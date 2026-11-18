import Foundation
import Observation

/// Pure, bounded snapshot reduced from an ordered `AgentEvent` log.
public struct AgentSnapshot: Equatable, Sendable {
    private static let quietTypes: Set<String> = ["message.delta", "draft.update"]
    private static let maxLabel = 512
    private static let maxDetail = 4000

    public var cursor: Int
    public var gap: AgentGap?
    public var runs = OrderedEntityMap<RunView>()
    public var agents = OrderedEntityMap<AgentView>()
    public var messages = OrderedEntityMap<MessageView>()
    public var tools = OrderedEntityMap<ToolCallView>()
    public var approvals = OrderedEntityMap<ApprovalView>()
    public var drafts = OrderedEntityMap<DraftView>()
    public var artifacts = OrderedEntityMap<ArtifactView>()
    public var activity: [ActivityEntry] = []
    public var rejected: Int = 0

    public init(cursor: Int = 0) { self.cursor = max(0, cursor) }
    public var hasGap: Bool { gap != nil }

    public static func reduce(_ state: AgentSnapshot, event: AgentEvent, limits: AgentLimits = AgentLimits()) -> AgentSnapshot {
        guard event.seq > state.cursor else { return state }
        if limits.contiguous && event.seq != state.cursor + 1 {
            let received = max(event.seq, state.gap?.received ?? 0)
            guard state.gap?.received != received else { return state }
            var gapped = state
            gapped.gap = AgentGap(after: state.cursor, received: received)
            return gapped
        }
        var next = state
        next.cursor = event.seq
        next.gap = nil
        guard let ref = applyEvent(&next, event: event, limits: limits) else {
            next.rejected += 1
            return next
        }
        guard !quietTypes.contains(event.type) else { return next }
        let entry = ActivityEntry(
            seq: event.seq, at: event.at, runId: event.runId, agentId: event.agentId,
            type: event.type, ref: ref.value, data: event.isExtensionType ? event.data : nil
        )
        next.activity.append(entry)
        if next.activity.count > limits.maxActivity {
            next.activity.removeFirst(next.activity.count - limits.maxActivity)
        }
        return next
    }

    private struct Ref { let value: String? }

    private static func text(_ data: [String: AgentValue], _ key: String, max limit: Int = maxLabel) -> String? {
        guard let raw = data[key]?.stringValue, !raw.isEmpty else { return nil }
        return String(raw.prefix(limit))
    }

    private static func ensureRun(_ s: inout AgentSnapshot, _ e: AgentEvent, max limit: Int) {
        guard !s.runs.contains(e.runId) else { return }
        let run = RunView(id: e.runId, status: .starting, reason: nil, startedAt: e.at, updatedAt: e.at)
        s.runs = s.runs.putting(run, forKey: e.runId, max: limit, isSettled: \.status.isSettled)
    }

    private static func agentOf(_ s: AgentSnapshot, _ e: AgentEvent) -> AgentView {
        s.agents[e.agentId] ?? AgentView(
            id: e.agentId, runId: e.runId, parentAgentId: e.parentAgentId, name: nil,
            status: .starting, reason: nil, location: nil, openMessageId: nil, updatedAt: e.at
        )
    }

    private static func touchAgent(_ s: inout AgentSnapshot, _ e: AgentEvent, max limit: Int) {
        guard !s.agents.contains(e.agentId) else { return }
        s.agents = s.agents.putting(agentOf(s, e), forKey: e.agentId, max: limit, isSettled: \.status.isSettled)
    }

    private static func applyEvent(_ s: inout AgentSnapshot, event e: AgentEvent, limits: AgentLimits) -> Ref? {
        let maxE = limits.maxEntities
        ensureRun(&s, e, max: maxE)
        switch e.type {
        case "run.status":
            guard let raw = e.data["status"]?.stringValue, let status = AgentRunStatus(rawValue: raw),
                  let prior = s.runs[e.runId] else { return nil }
            let updated = RunView(id: e.runId, status: status, reason: text(e.data, "reason"), startedAt: prior.startedAt, updatedAt: e.at)
            s.runs = s.runs.putting(updated, forKey: e.runId, max: maxE, isSettled: \.status.isSettled)
            return Ref(value: e.runId)

        case "agent.status":
            guard let raw = e.data["status"]?.stringValue, let status = AgentRunStatus(rawValue: raw) else { return nil }
            let prior = agentOf(s, e)
            let updated = AgentView(
                id: prior.id, runId: prior.runId, parentAgentId: prior.parentAgentId,
                name: text(e.data, "name") ?? prior.name, status: status, reason: text(e.data, "reason"),
                location: prior.location, openMessageId: prior.openMessageId, updatedAt: e.at
            )
            s.agents = s.agents.putting(updated, forKey: e.agentId, max: maxE, isSettled: \.status.isSettled)
            if let rRaw = e.data["runStatus"]?.stringValue, let rStatus = AgentRunStatus(rawValue: rRaw), let run = s.runs[e.runId] {
                let nextRun = RunView(id: run.id, status: rStatus, reason: run.reason, startedAt: run.startedAt, updatedAt: e.at)
                s.runs = s.runs.putting(nextRun, forKey: e.runId, max: maxE, isSettled: \.status.isSettled)
            }
            return Ref(value: e.agentId)

        case "message.delta", "message.complete":
            guard let chunk = e.data["text"]?.stringValue else { return nil }
            let agent = agentOf(s, e)
            let id = text(e.data, "messageId", max: 256) ?? agent.openMessageId ?? "\(e.agentId)#\(e.seq)"
            let prior = s.messages[id]
            if prior?.complete == true { return nil }
            let isComplete = e.type == "message.complete"
            let replace = isComplete || e.data["mode"]?.stringValue == "replace"
            let whole = replace ? chunk : (prior?.text ?? "") + chunk
            let msg = MessageView(
                id: id, runId: e.runId, agentId: e.agentId,
                text: String(whole.prefix(limits.maxTextChars)),
                complete: isComplete,
                truncated: whole.count > limits.maxTextChars,
                startedAt: prior?.startedAt ?? e.at, updatedAt: e.at
            )
            s.messages = s.messages.putting(msg, forKey: id, max: maxE, isSettled: \.complete)
            let nextOpen = isComplete ? (agent.openMessageId == id ? nil : agent.openMessageId) : id
            if nextOpen != agent.openMessageId || !s.agents.contains(e.agentId) {
                let nextAgent = AgentView(
                    id: agent.id, runId: agent.runId, parentAgentId: agent.parentAgentId, name: agent.name,
                    status: agent.status, reason: agent.reason, location: agent.location, openMessageId: nextOpen, updatedAt: e.at
                )
                s.agents = s.agents.putting(nextAgent, forKey: e.agentId, max: maxE, isSettled: \.status.isSettled)
            }
            return Ref(value: id)

        case "tool.call":
            guard let id = text(e.data, "callId", max: 256),
                  let pRaw = e.data["phase"]?.stringValue, let phase = AgentToolPhase(rawValue: pRaw) else { return nil }
            let prior = s.tools[id]
            guard let name = text(e.data, "name") ?? prior?.name else { return nil }
            let call = ToolCallView(
                id: id, runId: e.runId, agentId: e.agentId, name: name, phase: phase,
                summary: text(e.data, "summary", max: maxDetail) ?? prior?.summary,
                error: phase == .failed ? (text(e.data, "error", max: maxDetail) ?? "The tool call failed.") : nil,
                startedAt: prior?.startedAt ?? e.at, updatedAt: e.at
            )
            touchAgent(&s, e, max: maxE)
            s.tools = s.tools.putting(call, forKey: id, max: maxE, isSettled: \.phase.isSettled)
            return Ref(value: id)

        case "approval.requested":
            guard let id = text(e.data, "approvalId", max: 256) else { return nil }
            if let prior = s.approvals[id], prior.status != .pending { return Ref(value: id) }
            let prior = s.approvals[id]
            let approval = ApprovalView(
                id: id, runId: e.runId, agentId: e.agentId, title: text(e.data, "title"),
                detail: text(e.data, "detail", max: maxDetail), status: .pending,
                requestedAt: prior?.requestedAt ?? e.at, resolvedAt: nil
            )
            touchAgent(&s, e, max: maxE)
            s.approvals = s.approvals.putting(approval, forKey: id, max: maxE, isSettled: \.status.isSettled)
            return Ref(value: id)

        case "approval.resolved":
            guard let id = text(e.data, "approvalId", max: 256),
                  let dRaw = e.data["decision"]?.stringValue,
                  let decision = ApprovalState(rawValue: dRaw), decision != .pending else { return nil }
            let prior = s.approvals[id]
            let approval = ApprovalView(
                id: id, runId: e.runId, agentId: e.agentId, title: prior?.title, detail: prior?.detail,
                status: decision, requestedAt: prior?.requestedAt ?? e.at, resolvedAt: e.at
            )
            s.approvals = s.approvals.putting(approval, forKey: id, max: maxE, isSettled: \.status.isSettled)
            return Ref(value: id)

        case "draft.begin", "draft.update", "draft.cancel", "draft.complete":
            guard let id = text(e.data, "draftId", max: 256) else { return nil }
            let prior = s.drafts[id]
            if e.type != "draft.begin" && prior == nil { return nil }
            if let prior, prior.status != .open { return nil }
            let status: AgentDraftStatus = e.type == "draft.cancel" ? .cancelled : (e.type == "draft.complete" ? .complete : .open)
            let draftText = e.data["text"]?.stringValue.map { String($0.prefix(limits.maxTextChars)) } ?? prior?.text ?? ""
            let draft = DraftView(
                id: id, runId: e.runId, agentId: e.agentId, text: draftText,
                anchor: e.data["anchor"] ?? prior?.anchor, status: status,
                artifactId: text(e.data, "artifactId", max: 256) ?? prior?.artifactId, updatedAt: e.at
            )
            touchAgent(&s, e, max: maxE)
            s.drafts = s.drafts.putting(draft, forKey: id, max: maxE, isSettled: \.status.isSettled)
            return Ref(value: id)

        case "artifact.saved":
            guard let id = text(e.data, "artifactId", max: 256), let kind = text(e.data, "kind", max: 64) else { return nil }
            let artifact = ArtifactView(id: id, runId: e.runId, agentId: e.agentId, kind: kind, title: text(e.data, "title"), savedAt: e.at)
            touchAgent(&s, e, max: maxE)
            s.artifacts = s.artifacts.putting(artifact, forKey: id, max: maxE, isSettled: { _ in true })
            return Ref(value: id)

        case "navigation":
            guard let loc = text(e.data, "location", max: 2048) else { return nil }
            let agent = agentOf(s, e)
            let nextAgent = AgentView(
                id: agent.id, runId: agent.runId, parentAgentId: agent.parentAgentId, name: agent.name,
                status: agent.status, reason: agent.reason, location: loc, openMessageId: agent.openMessageId, updatedAt: e.at
            )
            s.agents = s.agents.putting(nextAgent, forKey: e.agentId, max: maxE, isSettled: \.status.isSettled)
            return Ref(value: e.agentId)

        default:
            guard e.isExtensionType && !e.isCoreType else { return nil }
            touchAgent(&s, e, max: maxE)
            return Ref(value: nil)
        }
    }
}

/// Observable store wrapping `AgentSnapshot` for SwiftUI views with deterministic sequence ordering and non-optimistic state.
@Observable
@MainActor
public final class AgentStore {
    public private(set) var state: AgentSnapshot
    public let limits: AgentLimits
    public private(set) var dropped: Int = 0

    public init(initial: AgentSnapshot = AgentSnapshot(), limits: AgentLimits = AgentLimits()) {
        self.state = initial
        self.limits = limits
    }

    public var cursor: Int { state.cursor }
    public var gap: AgentGap? { state.gap }
    public var hasGap: Bool { state.hasGap }
    public var runs: [RunView] { state.runs.values }
    public var agents: [AgentView] { state.agents.values }
    public var activeAgents: [AgentView] { state.agents.values.filter { !$0.status.isSettled } }
    public var pendingApprovals: [ApprovalView] { state.approvals.values.filter { $0.status == .pending } }
    public var toolCalls: [ToolCallView] { state.tools.values }
    public var messages: [MessageView] { state.messages.values }
    public var activity: [ActivityEntry] { state.activity }
    public var attentionCount: Int { pendingApprovals.count + agents.filter { $0.status == .waiting }.count }

    public func streamingMessage(forAgent agentId: String) -> MessageView? {
        guard let openId = state.agents[agentId]?.openMessageId else { return nil }
        return state.messages[openId]
    }

    @discardableResult
    public func apply(_ events: [AgentEvent]) -> Int {
        var valid: [AgentEvent] = []
        valid.reserveCapacity(events.count)
        for event in events {
            if event.isValidEnvelope { valid.append(event) }
            else { dropped += 1 }
        }
        valid.sort { $0.seq < $1.seq }
        var changed = 0
        var next = state
        for event in valid {
            let candidate = AgentSnapshot.reduce(next, event: event, limits: limits)
            if candidate != next {
                changed += 1
                next = candidate
            }
        }
        if next != state { state = next }
        return changed
    }

    @discardableResult
    public func applyJSON(_ jsonData: Data) -> Int {
        let decoder = JSONDecoder()
        if let single = try? decoder.decode(AgentEvent.self, from: jsonData) {
            return apply([single])
        }
        if let batch = try? decoder.decode([AgentEvent].self, from: jsonData) {
            return apply(batch)
        }
        dropped += 1
        return 0
    }

    public func reset(_ initial: AgentSnapshot = AgentSnapshot()) {
        state = initial
    }
}
