import SwiftUI
import Cieo

public struct StatementRevealAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "statement", category: "Content", name: "Statement reveal",
        summary: "Words enter one by one, 50ms apart, using the same blur-and-rise as a content swap. Nothing moves once the line is complete.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = false
    private let line = "Make each page do one thing, and do it well."
    public init() {}

    public var body: some View {
        let words = line.split(separator: " ").map(String.init)
        AtomStage {
            VStack(spacing: 28) {
                CenteredFlow {
                    ForEach(words.indices, id: \.self) { i in
                        Text(words[i]).font(.system(size: 28, weight: .semibold))
                            .opacity(shown ? 1 : 0)
                            .blur(radius: shown ? 0 : 4)
                            .offset(y: shown ? 0 : 8)
                            .animation(reduce ? nil : .motion(.base).delay(shown ? Double(i) * 0.05 : 0), value: shown)
                    }
                }
                .frame(maxWidth: 340)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(line)
                Button("Replay", action: replay).buttonStyle(.bordered)
            }
        }
        .onAppear { shown = true }
    }

    private func replay() {
        var t = Transaction()
        t.disablesAnimations = true
        withTransaction(t) { shown = false }
        DispatchQueue.main.async { shown = true }
    }
}

/// Lays children out left to right, wrapping, with each line centered.
private struct CenteredFlow: Layout {
    var spacing: CGFloat = 8
    var lineSpacing: CGFloat = 4

    private func lines(_ width: CGFloat, _ subviews: Subviews) -> [[Int]] {
        var out: [[Int]] = [[]]
        var x: CGFloat = 0
        for i in subviews.indices {
            let w = subviews[i].sizeThatFits(.unspecified).width
            if x > 0, x + w > width {
                out.append([])
                x = 0
            }
            out[out.count - 1].append(i)
            x += w + spacing
        }
        return out
    }

    private func extent(_ line: [Int], _ subviews: Subviews) -> CGSize {
        let sizes = line.map { subviews[$0].sizeThatFits(.unspecified) }
        return CGSize(width: sizes.reduce(0) { $0 + $1.width } + spacing * CGFloat(max(0, sizes.count - 1)),
                      height: sizes.map(\.height).max() ?? 0)
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let ls = lines(proposal.width ?? .infinity, subviews).map { extent($0, subviews) }
        return CGSize(width: ls.map(\.width).max() ?? 0,
                      height: ls.reduce(0) { $0 + $1.height } + lineSpacing * CGFloat(max(0, ls.count - 1)))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for line in lines(bounds.width, subviews) {
            let e = extent(line, subviews)
            var x = bounds.minX + (bounds.width - e.width) / 2
            for i in line {
                let s = subviews[i].sizeThatFits(.unspecified)
                subviews[i].place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(s))
                x += s.width + spacing
            }
            y += e.height + lineSpacing
        }
    }
}
