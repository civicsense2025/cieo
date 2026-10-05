import SwiftUI
import MotionKit

public struct ChapterScrollytellingAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-chapters", category: "Scroll stories", name: "Chapter scrollytelling",
        summary: "Use when each block of a narrative has its own picture: a case study, a trip, a product tour. Text steps scroll on the left while the photo pins on the right (on phones the photo pins full height and the steps scroll over it as cards). The photo holds while a step is centred, then in the gap between steps the next photo rises from below through a mask while the old one drifts up 18%, both tied to scroll so it reverses exactly. The caption swaps (exit, then enter) at the midpoint and the active step brightens. Reduced motion cross-fades.")
    public init() {}
    private let steps = [("Arrive", "The path starts low."), ("Climb", "Switchbacks open the view."), ("Ridge", "The whole valley, at once.")]

    public var body: some View {
        PhScrollStory(hint: "Text scrolls; the photo holds, then the next rises", length: 4) { p, s in
            let q = p * Double(steps.count - 1)
            let i = Int(q.rounded())
            HStack(spacing: 10) {
                ZStack(alignment: .topLeading) {
                    ForEach(steps.indices, id: \.self) { n in
                        let near = max(0, 1 - abs(q - Double(n)) * 1.4)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(steps[n].0).font(.subheadline.weight(.semibold))
                            Text(steps[n].1).font(.caption).foregroundStyle(.secondary)
                        }
                        .opacity(0.35 + 0.65 * near)                      // the active step brightens
                        .offset(y: CGFloat(Double(n) - q) * 64 + s.height / 2 - 20)
                    }
                }
                .frame(width: s.width * 0.42, height: s.height, alignment: .topLeading).clipped()
                ZStack {
                    ForEach(steps.indices, id: \.self) { n in
                        // between steps the next photo rises through a mask while the old one drifts up 18%
                        let up = phSmooth(phRange(q, Double(n - 1) + 0.35, Double(n) - 0.35))
                        let out = phSmooth(phRange(q, Double(n) + 0.35, Double(n + 1) - 0.35))
                        phPhoto(n, CGSize(width: s.width * 0.5, height: s.height * 0.7))
                            .offset(y: -CGFloat(out) * s.height * 0.7 * 0.18)
                            .mask(alignment: .bottom) { Rectangle().frame(height: n == 0 ? s.height * 0.7 : s.height * 0.7 * CGFloat(up)) }
                            .zIndex(Double(n))
                    }
                    SwapText(steps[min(max(i, 0), steps.count - 1)].0).font(.caption2.weight(.semibold)).foregroundStyle(.white)
                        .shadow(radius: 2).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading).padding(8)
                }
                .frame(width: s.width * 0.5, height: s.height * 0.7).clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .padding(.horizontal, 10)
        }
    }
}
