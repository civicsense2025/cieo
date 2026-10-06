import SwiftUI
import Cieo

public struct RegenerationDiffAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "regendiff", category: "AI chat", name: "Regeneration diff",
        summary: "The old answer blurs out while the new one swaps in. Changed phrases glow, then fade, and the card height springs to fit.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var regen = false
    @State private var glow = false
    @State private var highlight = true
    @State private var ticket = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Regenerate, watch phrases glow, then settle") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Regenerate answer").font(.system(size: 15, weight: .semibold))
                ZStack(alignment: .topLeading) {
                    if !regen {
                        Text("Start from your monthly price and offer two months free.")
                            .font(.system(size: 13.5)).lineSpacing(3)
                            .motionTransition(.swap())
                    } else {
                        newAnswer
                            .motionTransition(.swap())
                    }
                }
                .frame(minHeight: 66, alignment: .topLeading)
                .motion(.soft, value: regen)
                SwapText(!regen ? "Original draft" : (glow ? "Regenerating…" : "2 phrases changed — kept"))
                    .font(.caption)
                    .foregroundStyle(regen && !glow ? .green : .secondary)
                HStack {
                    Button("Regenerate") { toggle() }.buttonStyle(.borderedProminent).controlSize(.small)
                    Spacer()
                    Toggle("Highlight changes", isOn: $highlight).font(.caption).foregroundStyle(.secondary)
                }
            }
            .frame(width: 300)
            .animation(reduce ? nil : .motion(.base), value: regen)
        }
    }

    private func span(_ s: String) -> Text {
        Text(s).foregroundColor(glow && highlight ? Color.orange : Color.primary)
    }

    private var newAnswer: some View {
        Text("Start from your ") + span("annual price") + Text(" and offer ") + span("three months free") + Text(".")
    }

    private func toggle() {
        ticket += 1
        let id = ticket
        let next = !regen
        withMotion(.base, reduceMotion: reduce) {
            regen = next
            glow = next && highlight
        }
        guard next, highlight, !reduce else { return }
        Task {
            try? await Task.sleep(for: .seconds(1.4))
            guard id == ticket else { return }
            withMotion(.soft, reduceMotion: reduce) { glow = false }
        }
    }
}
