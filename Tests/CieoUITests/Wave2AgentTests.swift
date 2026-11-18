@testable import CieoUI
import Cieo
import SwiftUI
import XCTest

final class Wave2AgentTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)

    @MainActor
    func testAgentStoreOrdersBatchIgnoresDuplicatesAndDetectsContiguousGaps() {
        let store = AgentStore()
        XCTAssertEqual(store.cursor, 0)
        XCTAssertFalse(store.hasGap)

        // Out-of-order batch [seq 2, seq 1] sorts by seq and applies both cleanly
        let applied = store.apply([
            .agentStatus(seq: 2, at: "2026-11-18T00:00:02Z", runId: "run-1", agentId: "a-1", status: .running, name: "Planner"),
            .runStatus(seq: 1, at: "2026-11-18T00:00:01Z", runId: "run-1", agentId: "a-1", status: .running),
        ])
        XCTAssertEqual(applied, 2)
        XCTAssertEqual(store.cursor, 2)
        XCTAssertFalse(store.hasGap)
        XCTAssertEqual(store.state.runs["run-1"]?.status, .running)
        XCTAssertEqual(store.state.agents["a-1"]?.name, "Planner")

        // Duplicate sequence <= cursor is ignored
        let dup = store.apply([
            .runStatus(seq: 2, at: "2026-11-18T00:00:02Z", runId: "run-1", agentId: "a-1", status: .failed),
        ])
        XCTAssertEqual(dup, 0)
        XCTAssertEqual(store.state.runs["run-1"]?.status, .running)

        // Sequence jump (seq 5 when cursor is 2) flags gap without advancing cursor
        _ = store.apply([
            .runStatus(seq: 5, at: "2026-11-18T00:00:05Z", runId: "run-1", agentId: "a-1", status: .completed),
        ])
        XCTAssertTrue(store.hasGap)
        XCTAssertEqual(store.gap, AgentGap(after: 2, received: 5))
        XCTAssertEqual(store.cursor, 2)

        // Supplying missing seq 3 clears gap and advances cursor
        _ = store.apply([
            .runStatus(seq: 3, at: "2026-11-18T00:00:03Z", runId: "run-1", agentId: "a-1", status: .waiting),
        ])
        XCTAssertFalse(store.hasGap)
        XCTAssertEqual(store.cursor, 3)

        // Invalid envelope (whitespace in agentId or seq < 1) increments dropped and leaves cursor untouched
        let invalid = AgentEvent(v: 1, seq: 4, at: "2026-11-18T00:00:04Z", runId: "run-1", agentId: "bad id", type: "run.status", data: ["status": "running"])
        XCTAssertEqual(store.apply([invalid]), 0)
        XCTAssertEqual(store.dropped, 1)
        XCTAssertEqual(store.cursor, 3)

        // Unknown event type advances cursor and increments rejected so newer hosts never stall older clients
        let futureType = AgentEvent(v: 1, seq: 4, at: "2026-11-18T00:00:04Z", runId: "run-1", agentId: "a-1", type: "future.capability", data: [:])
        _ = store.apply([futureType])
        XCTAssertEqual(store.cursor, 4)
        XCTAssertEqual(store.state.rejected, 1)
    }

    @MainActor
    func testAgentStoreStreamsMessagesTracksToolsAndEnforcesNonOptimisticApprovals() {
        let store = AgentStore(limits: AgentLimits(maxActivity: 4, maxTextChars: 12, maxEntities: 3, contiguous: true))

        _ = store.apply([
            .messageDelta(seq: 1, at: "t1", runId: "r1", agentId: "a1", text: "Hello "),
            .messageDelta(seq: 2, at: "t2", runId: "r1", agentId: "a1", text: "world, overflow!"),
        ])
        let streaming = store.streamingMessage(forAgent: "a1")
        XCTAssertEqual(streaming?.text, "Hello world,")
        XCTAssertEqual(streaming?.truncated, true)
        XCTAssertEqual(streaming?.complete, false)
        XCTAssertEqual(store.activity.count, 0, "message.delta is quiet and does not spam activity ring")

        _ = store.apply([
            .messageComplete(seq: 3, at: "t3", runId: "r1", agentId: "a1", text: "Final text"),
            .messageDelta(seq: 4, at: "t4", runId: "r1", agentId: "a1", text: "Second msg"),
        ])
        XCTAssertNotEqual(store.streamingMessage(forAgent: "a1")?.id, streaming?.id, "next delta after complete opens a new message")

        // Tool call lifecycle + non-optimistic approval lifecycle
        _ = store.apply([
            .toolCall(seq: 5, at: "t5", runId: "r1", agentId: "a1", callId: "c1", name: "sql.exec", phase: .started, summary: "SELECT 1"),
            .approvalRequested(seq: 6, at: "t6", runId: "r1", agentId: "a1", approvalId: "ap1", title: "Run migration", detail: "Alters users table"),
        ])
        XCTAssertEqual(store.pendingApprovals.count, 1)
        XCTAssertEqual(store.state.approvals["ap1"]?.status, .pending)

        // Resolution updates state; a duplicate approval.requested afterward MUST NOT reopen it
        _ = store.apply([
            .approvalResolved(seq: 7, at: "t7", runId: "r1", agentId: "a1", approvalId: "ap1", decision: .approved),
            .approvalRequested(seq: 8, at: "t8", runId: "r1", agentId: "a1", approvalId: "ap1", title: "Replay"),
            .toolCall(seq: 9, at: "t9", runId: "r1", agentId: "a1", callId: "c1", name: "sql.exec", phase: .failed),
        ])
        XCTAssertEqual(store.state.approvals["ap1"]?.status, .approved, "resolved approval never reopens on repeated request")
        XCTAssertEqual(store.pendingApprovals.count, 0)
        XCTAssertEqual(store.state.tools["c1"]?.phase, .failed)
        XCTAssertEqual(store.state.tools["c1"]?.error, "The tool call failed.")
        XCTAssertLessThanOrEqual(store.activity.count, 4, "activity ring respects maxActivity bound")
    }

    @MainActor
    func testAgentStoreEvictsOldestSettledEntitiesBeforeLiveOnes() {
        let store = AgentStore(limits: AgentLimits(maxActivity: 20, maxTextChars: 500, maxEntities: 2, contiguous: true))
        _ = store.apply([
            .agentStatus(seq: 1, at: "t1", runId: "r1", agentId: "live-1", status: .running),
            .agentStatus(seq: 2, at: "t2", runId: "r1", agentId: "done-1", status: .completed),
            .agentStatus(seq: 3, at: "t3", runId: "r1", agentId: "live-2", status: .waiting),
        ])
        XCTAssertNil(store.state.agents["done-1"], "settled agent is evicted first when exceeding maxEntities")
        XCTAssertNotNil(store.state.agents["live-1"])
        XCTAssertNotNil(store.state.agents["live-2"])
    }

    @MainActor
    func testAllSevenAgentComponentsRenderWithHostSlotsAndCycleSafeLanes() throws {
        let store = AgentStore()
        _ = store.apply([
            .runStatus(seq: 1, at: "t1", runId: "r1", agentId: "root", status: .running),
            .agentStatus(seq: 2, at: "t2", runId: "r1", agentId: "root", status: .running, name: "Coordinator"),
            .agentStatus(seq: 3, at: "t3", runId: "r1", agentId: "worker", parentAgentId: "root", status: .waiting, name: "Builder"),
            .toolCall(seq: 4, at: "t4", runId: "r1", agentId: "worker", callId: "tc1", name: "swift.test", phase: .finished, summary: "42 passed"),
            .approvalRequested(seq: 5, at: "t5", runId: "r1", agentId: "worker", approvalId: "ap1", title: "Deploy preview", detail: "Staging environment"),
        ])

        // Cycle test: cyclic parentAgentId a <-> b must terminate cleanly without infinite recursion
        let cyclicAgents = [
            AgentView(id: "a", runId: "r1", parentAgentId: "b", name: "Alpha", status: .running, reason: nil, location: nil, openMessageId: nil, updatedAt: "t1"),
            AgentView(id: "b", runId: "r1", parentAgentId: "a", name: "Beta", status: .waiting, reason: nil, location: nil, openMessageId: nil, updatedAt: "t2"),
        ]

        let run = try XCTUnwrap(store.state.runs["r1"])
        let call = try XCTUnwrap(store.state.tools["tc1"])
        let approval = try XCTUnwrap(store.state.approvals["ap1"])

        let showcase = VStack(alignment: .leading, spacing: 12) {
            AgentStatus(status: .running, name: "Coordinator")
            HStack {
                ForEach(AgentIconRole.allCases.prefix(6), id: \.self) { role in
                    AgentIcon(role, size: 22)
                }
            }
            RunControls(run: run, onPause: {}, onStop: {})
            ToolCallDisclosure(call: call, inputText: "--filter Wave2", outputText: "0 failures", duration: "1.2s")
            ApprovalRequest(approval: approval, approvePhase: .pending, onApprove: {}, onDeny: {})
            AgentLanes(agents: store.agents) { agent in
                Text(agent.name ?? agent.id)
            }
            AgentLanes(agents: cyclicAgents) { agent in
                Text(agent.id)
            }
            AgentActivity(store: store)
        }
        .environment(\.componentTheme, Theme(accent: red, info: red))
        .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
        .frame(width: 390)

        let image = try XCTUnwrap(ImageRenderer(content: showcase).cgImage)
        XCTAssertGreaterThan(image.height, 200)
        XCTAssertTrue(ComponentIconTests.containsRed(image))
        XCTAssertEqual(AgentIconRole.allCases.count, 24)
    }
}
