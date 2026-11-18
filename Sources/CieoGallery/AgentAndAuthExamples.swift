import Cieo
import CieoUI
import SwiftUI

/// Interactive gallery specimens for Wave 2/3 agent, data table, command palette, toast queue, sheet detent, and authentication controls.
public struct AgentAndAuthExamples: View {
    private struct ServiceRow: Identifiable {
        let id: String
        let name: String
        let status: String
        let latencyMs: Int
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics

    @State private var store = AgentAndAuthExamples.makeDemoStore()
    @State private var nextSeq = 6
    @State private var approvePhase: AsyncActionPhase = .idle
    @State private var palettePresented = true
    @State private var lastCommand = "None"
    @State private var sheetPresented = true
    @State private var toastQueue = AgentAndAuthExamples.makeDemoQueue()
    @State private var selectedRows: Set<String> = ["svc-1"]
    @State private var email = "ada@cieo.dev"
    @State private var otpCode = "482910"
    @State private var password = "Correct-Horse-99!"
    @State private var signInPhase: AsyncActionPhase = .idle

    private let services: [ServiceRow] = [
        .init(id: "svc-1", name: "Motion Core", status: "Healthy", latencyMs: 8),
        .init(id: "svc-2", name: "Agent Stream", status: "Active", latencyMs: 21),
        .init(id: "svc-3", name: "Token Mirror", status: "Synced", latencyMs: 14),
    ]

    private let serviceColumns: [DataTableColumn<ServiceRow>] = [
        .text(id: "name", title: "Service", value: \.name),
        .text(id: "status", title: "State", value: \.status),
        .comparable(id: "latency", title: "p95", value: \.latencyMs) { "\($0) ms" },
    ]

    private let commandGroups: [CieoUI.CommandGroup] = [
        CieoUI.CommandGroup(id: "workspace", title: "Workspace", items: [
            CommandItem(id: "test", title: "Run Swift test suite", shortcut: "⌘U", icon: .play, keywords: ["verify", "xctest"]),
            CommandItem(id: "theme", title: "Switch Instrument palette", shortcut: "⌘T", icon: .command, keywords: ["brand", "dark"]),
            CommandItem(id: "purge", title: "Purge production cache", icon: .discard, isDisabled: true),
        ]),
    ]

    public init() {}

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.section) {
            Specimen(title: "Agent Lanes, Run Controls & Activity") {
                if let run = store.state.runs["run-1"] {
                    RunControls(
                        run: run,
                        onPause: { emitStatus(.waiting) },
                        onResume: { emitStatus(.running) },
                        onStop: { emitStatus(.stopped) }
                    )
                }
                AgentLanes(agents: store.agents) { agent in
                    if let msg = store.streamingMessage(forAgent: agent.id) {
                        Text(verbatim: msg.text).font(typography.detail).foregroundStyle(theme.secondary)
                    }
                }
                AgentActivity(entries: store.activity) { entry in
                    DefaultAgentActivityRow(entry: entry)
                }
            }

            Specimen(title: "Tool Call Disclosure & Non-Optimistic Approval") {
                if let call = store.state.tools["tc-1"] {
                    ToolCallDisclosure(
                        call: call,
                        inputText: "swift test --filter Wave2",
                        outputText: "Executed 18 tests, with 0 failures",
                        duration: "0.84s"
                    )
                }
                if let approval = store.state.approvals["ap-1"] {
                    ApprovalRequest(
                        approval: approval,
                        approvePhase: approvePhase,
                        onApprove: { resolveApproval(.approved) },
                        onDeny: { resolveApproval(.denied) }
                    )
                }
            }

            ConfigurableSpecimen(
                title: "Sortable Data Table",
                code: """
                DataTable(rows: services, columns: serviceColumns, selection: $selectedRows)
                """
            ) {
                DataTable(rows: services, columns: serviceColumns, selection: $selectedRows)
            }

            Specimen(title: "Command Palette, Detent Sheet & Priority Toasts") {
                HStack(spacing: metrics.compact) {
                    ActionButton(palettePresented ? "Hide palette" : "Show palette", emphasis: .quiet, sizing: .fitted) {
                        palettePresented.toggle()
                    }
                    Text(verbatim: "Last command: \(lastCommand)")
                        .font(typography.reference)
                        .foregroundStyle(theme.secondary)
                }
                CommandPaletteView(isPresented: $palettePresented, groups: commandGroups) { selected in
                    lastCommand = selected
                }
                BottomSheetPanel(isPresented: $sheetPresented, detents: [120, 200], selectedDetent: 120) {
                    Heading("Detent Sheet Preview", detail: "Drag or tap the grabber to snap between detents.", level: .heading, isHeader: false)
                }
                FlowStack(spacing: metrics.compact) {
                    ActionButton("Enqueue info", emphasis: .quiet, sizing: .fitted) {
                        _ = toastQueue.enqueue(title: "Synced snapshot", detail: "All local changes saved.", priority: .info)
                    }
                    ActionButton("Enqueue warning", emphasis: .quiet, sizing: .fitted) {
                        _ = toastQueue.enqueue(title: "Rate limit near", detail: "88% of hourly window used.", priority: .warning, actionTitle: "Inspect")
                    }
                }
                if let previewItem = toastQueue.visibleItems.first {
                    ToastBanner(item: previewItem, onDismiss: { toastQueue.dismiss(id: previewItem.id) })
                }
                ToastHost(queue: toastQueue)
            }

            ConfigurableSpecimen(
                title: "Composed Sign-In Card & Verification Inputs",
                code: """
                AuthSignInCard(
                    email: $email,
                    password: $password,
                    requiresOtp: true,
                    otpCode: $otpCode,
                    phase: signInPhase,
                    onSubmit: signIn
                )
                """
            ) {
                AuthSignInCard(
                    title: "Sign in to Cieo",
                    subtitle: "Password strength and one-time verification code.",
                    email: $email,
                    password: $password,
                    requiresOtp: true,
                    otpCode: $otpCode,
                    otpError: otpCode.count < 6 ? Text("Enter all 6 verification digits.") : nil,
                    phase: signInPhase,
                    onSubmit: { signInPhase = signInPhase == .succeeded ? .idle : .succeeded }
                )
                AuthOtpInput(code: $otpCode, length: 6)
                AuthPasswordField(text: $password)
            }
        }
    }

    private func emitStatus(_ status: AgentRunStatus) {
        _ = store.apply([.runStatus(seq: nextSeq, at: "now", runId: "run-1", agentId: "coord", status: status)])
        nextSeq += 1
    }

    private func resolveApproval(_ decision: ApprovalState) {
        approvePhase = .idle
        _ = store.apply([.approvalResolved(seq: nextSeq, at: "now", runId: "run-1", agentId: "worker", approvalId: "ap-1", decision: decision)])
        nextSeq += 1
    }

    @MainActor
    private static func makeDemoStore() -> AgentStore {
        let store = AgentStore()
        _ = store.apply([
            .runStatus(seq: 1, at: "00:01", runId: "run-1", agentId: "coord", status: .running),
            .agentStatus(seq: 2, at: "00:01", runId: "run-1", agentId: "coord", status: .running, name: "Coordinator"),
            .agentStatus(seq: 3, at: "00:02", runId: "run-1", agentId: "worker", parentAgentId: "coord", status: .waiting, name: "Verifier"),
            .toolCall(seq: 4, at: "00:03", runId: "run-1", agentId: "worker", callId: "tc-1", name: "swift.test", phase: .finished, summary: "Wave 2 suite green"),
            .approvalRequested(seq: 5, at: "00:04", runId: "run-1", agentId: "worker", approvalId: "ap-1", title: "Publish snapshot", detail: "Updates portable Apple runtime mirror"),
        ])
        return store
    }

    @MainActor
    private static func makeDemoQueue() -> ToastQueueModel {
        let queue = ToastQueueModel()
        _ = queue.enqueue(title: "Build ready", detail: "Zero warnings across targets.", priority: .success, duration: 60)
        return queue
    }
}
