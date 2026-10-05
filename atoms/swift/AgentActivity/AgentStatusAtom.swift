import SwiftUI
import Cieo

public struct AgentStatusAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentstatus", category: "Agent activity", name: "Agent status pill",
        summary: "One pill carries the whole run. On every change the shape morphs first (pill, rounded box, square, notched), the icon swaps, the label swaps and its width springs, and the action text grows out of the pill when there is one. Border weight and color blend with it, so state never relies on color alone. The elapsed timer restarts with rolling digits, and the button beside it swaps to the next sensible action.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct St: Hashable { let name: String; let icon: String; let radius: CGFloat; let tone: AgTone; let action: String; let border: CGFloat
        func hash(into h: inout Hasher) { h.combine(name) }
        static func == (a: St, b: St) -> Bool { a.name == b.name } }
    private let states = [St(name: "Working", icon: "cursorarrow.motionlines", radius: 16, tone: .info, action: "Pause", border: 1),
                          St(name: "Waiting", icon: "hourglass", radius: 6, tone: .warning, action: "Answer", border: 2),
                          St(name: "Blocked", icon: "hand.raised", radius: 2, tone: .warning, action: "Review", border: 2.5),
                          St(name: "Failed", icon: "xmark.octagon", radius: 8, tone: .danger, action: "Retry", border: 2.5),
                          St(name: "Done", icon: "checkmark.circle", radius: 16, tone: .success, action: "Review", border: 1)]
    @State private var cur = 0
    @State private var seconds = 0
    @State private var recent = ["Working"]
    public init() {}

    public var body: some View {
        let s = states[cur]
        AtomStage(hint: "Pick a state. Shape and icon change, not just colour.") {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    HStack(spacing: 6) {
                        Image(systemName: s.icon).contentTransition(.symbolEffect(.replace))
                        Text("Northwind agent:").font(.caption)
                        SwapText(s.name).font(.callout.weight(.semibold))
                    }
                    .foregroundStyle(s.tone.color).padding(.horizontal, 12).padding(.vertical, 6)
                    .background(s.tone.color.opacity(0.12), in: RoundedRectangle(cornerRadius: s.radius))
                    .overlay(RoundedRectangle(cornerRadius: s.radius).strokeBorder(s.tone.color, lineWidth: s.border))
                    HStack(spacing: 1) { RollingDigits(seconds / 60); Text(":"); RollingDigits(String(format: "%02d", seconds % 60)) }.font(.callout.monospacedDigit()).foregroundStyle(.secondary)
                    Button { } label: { SwapText(s.action) }.buttonStyle(AgPress())
                }
                .animation(reduce ? nil : .motion(.base), value: cur)
                Text("Pick a state to preview it.").font(.caption).foregroundStyle(.secondary)
                HStack { ForEach(states.indices, id: \.self) { i in Button(states[i].name) { pick(i) }.buttonStyle(AgPress(tone: cur == i ? .info : nil)).font(.caption) } }
                Text("Recent states").font(.caption.weight(.semibold))
                ForEach(Array(recent.reversed().prefix(4).enumerated()), id: \.offset) { _, r in Text(r).font(.caption).transition(.opacity) }
            }
            .animation(reduce ? nil : .motion(.base), value: recent.count)
        }
        .task(id: cur) {
            seconds = 0
            while !Task.isCancelled { try? await Task.sleep(nanoseconds: 1_000_000_000); withMotion(.base, reduceMotion: reduce) { seconds += 1 } }
        }
    }

    private func pick(_ i: Int) { withMotion(.base, reduceMotion: reduce) { cur = i; recent.append(states[i].name) } }
}
