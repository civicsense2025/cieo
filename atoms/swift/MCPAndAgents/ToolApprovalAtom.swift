import SwiftUI
import MotionKit

public struct ToolApprovalAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "toolapproval", category: "MCP and agents", name: "Tool call approval",
        summary: "The card holds one request at a time. Next request swaps the whole request block, and the card height eases from the old height to the new one. Show all arguments grows the preview on the base spring and swaps its label. Allow once or Always allow swaps the buttons for a running line with a live timer, then swaps that for the result; Deny goes straight to the result. The card height follows each swap without a jump.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Phase { case ask, running, done(String) }
    private struct Req { let tool: String; let args: [String] }
    @State private var index = 0
    @State private var phase = Phase.ask
    @State private var allArgs = false
    @State private var elapsed = 0.0
    public init() {}

    private let reqs = [Req(tool: "pages.publish", args: ["page: /spring", "visibility: public", "notify: true", "schedule: none"]),
                        Req(tool: "media.delete", args: ["id: img_4821", "permanent: true", "reason: duplicate", "backup: false"])]

    public var body: some View {
        let r = reqs[index]
        AtomStage(hint: "Allow once, Always allow or Deny; Next request swaps the card") {
            AgCard {
                VStack(alignment: .leading, spacing: 8) {
                    HStack { Text("Claude is working in Northwind").font(.caption).foregroundStyle(.secondary); Spacer()
                        Button("Next request") { next() }.buttonStyle(AgPress()).font(.caption) }
                    VStack(alignment: .leading, spacing: 6) {
                        Text(r.tool).font(.callout.monospaced().weight(.semibold))
                        VStack(alignment: .leading, spacing: 2) {
                            ForEach(Array(r.args.enumerated()), id: \.offset) { i, a in
                                if i < 2 || allArgs { Text(a).font(.caption.monospaced()).transition(.opacity) }
                            }
                        }
                        Button { withMotion(.base, reduceMotion: reduce) { allArgs.toggle() } } label: { SwapText(allArgs ? "Hide arguments" : "Show all arguments") }
                            .buttonStyle(.plain).font(.caption).foregroundStyle(Color.accentColor)
                    }
                    .id(index).transition(reduce ? .identity : .motionSwap())
                    Group {
                        switch phase {
                        case .ask:
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Button("Deny") { finish("Denied. Nothing ran.") }.buttonStyle(AgPress())
                                    Button("Allow once") { run() }.buttonStyle(AgPress(tone: .info))
                                    Button("Always allow") { run() }.buttonStyle(AgPress())
                                }
                                Text("Claude waits for your answer.").font(.caption).foregroundStyle(.secondary)
                            }
                        case .running:
                            HStack(spacing: 6) { AgSpinner(size: 12); Text("Running"); Text(String(format: "%.1fs", elapsed)).monospacedDigit() }.font(.callout)
                        case .done(let msg):
                            Label(msg, systemImage: msg.hasPrefix("Denied") ? "xmark.circle" : "checkmark.circle")
                                .font(.callout).foregroundStyle(msg.hasPrefix("Denied") ? Color.secondary : .green)
                        }
                    }
                    .id(phaseKey).transition(reduce ? .identity : .motionSwap())
                }
            }
            .frame(maxWidth: 400)
            .animation(reduce ? nil : .motion(.base), value: index)
            .animation(reduce ? nil : .motion(.base), value: phaseKey)
            .animation(reduce ? nil : .motion(.base), value: allArgs)
        }
    }

    private var phaseKey: String { switch phase { case .ask: "a"; case .running: "r"; case .done: "d" } }
    private func next() { withMotion(.base, reduceMotion: reduce) { index = (index + 1) % reqs.count; phase = .ask; allArgs = false } }
    private func finish(_ m: String) { withMotion(.base, reduceMotion: reduce) { phase = .done(m) } }
    private func run() {
        withMotion(.base, reduceMotion: reduce) { phase = .running }
        elapsed = 0
        Task { @MainActor in
            for _ in 0..<12 { try? await Task.sleep(nanoseconds: 100_000_000); elapsed += 0.1 }
            finish("Done in 1.2s")
        }
    }
}
