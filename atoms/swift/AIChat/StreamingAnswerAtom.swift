import SwiftUI
import Cieo

public struct StreamingAnswerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "streaming", category: "AI chat", name: "Streaming answer",
        summary: "Words arrive on a schedule and each one fades up out of a slight blur, so the text feels written rather than printed. A soft caret rides the last word. Stop freezes the answer where it is.")

    private let words = "Start from your monthly price and offer two months free, about 17% off. Show the yearly total and the monthly equivalent side by side. Default the toggle to yearly only if most readers already pay monthly for over three months. Keep the saving visible on the button itself.".split(separator: " ").map(String.init)
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = 0
    @State private var running = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Ask, then stop mid-answer") {
            VStack(spacing: 10) {
                HStack(spacing: 6) {
                    Text("How should I price a yearly plan?").font(.footnote).lineLimit(1)
                        .padding(8).frame(maxWidth: .infinity, alignment: .leading)
                        .background(.quaternary.opacity(0.6), in: RoundedRectangle(cornerRadius: 9))
                    Button(action: toggle) { SwapText(running ? "Stop" : "Ask").font(.footnote.weight(.medium)).frame(width: 52, height: 30) }
                        .buttonStyle(.borderedProminent).controlSize(.small)
                }
                Flow(spacing: 4) {
                    ForEach(0..<shown, id: \.self) { i in
                        Text(words[i]).transition(reduce ? .identity : .modifier(active: Rise(), identity: Rise(blur: 0, o: 1, y: 0)))
                    }
                    Caret(running: running).opacity(shown > 0 || running ? 1 : 0)
                }
                .font(.footnote).frame(maxWidth: .infinity, minHeight: 140, alignment: .topLeading)
                .padding(12).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 12))
                .animation(reduce ? nil : .motion(.snap), value: shown)
                .accessibilityElement(children: .combine)
            }
            .frame(width: 340)
        }
        .task(id: running) {
            guard running else { return }
            while !Task.isCancelled && shown < words.count {
                try? await Task.sleep(for: .seconds(0.045))
                if Task.isCancelled { return }
                shown += 1
            }
            if shown >= words.count { running = false }
        }
    }

    private func toggle() {
        if running { running = false } else { shown = 0; running = true }
    }
}

private struct Rise: ViewModifier {
    var blur: CGFloat = 3, o = 0.0, y: CGFloat = 4
    func body(content: Content) -> some View { content.blur(radius: blur).opacity(o).offset(y: y) }
}

private struct Caret: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let running: Bool
    var body: some View {
        TimelineView(.animation(paused: reduce || !running)) { tl in
            RoundedRectangle(cornerRadius: 2).fill(.primary).frame(width: 6, height: 13)
                .opacity(running ? (reduce ? 0.7 : 0.55 + 0.35 * cos(tl.date.timeIntervalSinceReferenceDate * 6)) : 0)
        }.accessibilityHidden(true)
    }
}

/// Lays children out left to right and wraps to a new line when the row is full.
private struct Flow: Layout {
    var spacing: CGFloat
    private func place(_ width: CGFloat, _ subs: Subviews) -> (frames: [CGRect], size: CGSize) {
        var x: CGFloat = 0, y: CGFloat = 0, row: CGFloat = 0, out: [CGRect] = []
        for s in subs {
            let sz = s.sizeThatFits(.unspecified)
            if x > 0 && x + sz.width > width { x = 0; y += row + 4; row = 0 }
            out.append(CGRect(origin: CGPoint(x: x, y: y), size: sz))
            x += sz.width + spacing; row = max(row, sz.height)
        }
        return (out, CGSize(width: width, height: y + row))
    }
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize { place(proposal.width ?? 300, subviews).size }
    func placeSubviews(in b: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        for (s, f) in zip(subviews, place(b.width, subviews).frames) { s.place(at: CGPoint(x: b.minX + f.minX, y: b.minY + f.minY), proposal: .unspecified) }
    }
}
