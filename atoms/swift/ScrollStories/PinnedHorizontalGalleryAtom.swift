import SwiftUI
import MotionKit

public struct PinnedHorizontalGalleryAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-hgallery", category: "Scroll stories", name: "Pinned horizontal gallery",
        summary: "Use when a short run of related photos sits inside a long page and a carousel would hide them behind buttons. The section pins while the row has travel left: each pixel scrolled down moves the row one pixel left, smoothed by the follower. Inside every card the photo drifts against the travel by up to 10% of its width (depth), the progress line fills, and the counter changes as a card crosses the centre. Reduced motion keeps the 1:1 travel and drops the inner drift.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}
    private let count = 5

    public var body: some View {
        PhScrollStory(hint: "Scroll down: the row travels sideways, 1:1") { p, s in
            let cw = s.width * 0.62, gap: CGFloat = 10
            let travel = CGFloat(count) * (cw + gap) - gap - s.width + 32
            VStack(spacing: 8) {
                ZStack(alignment: .leading) {
                    ForEach(0..<count, id: \.self) { i in
                        let x = 16 + CGFloat(i) * (cw + gap) - travel * CGFloat(p)
                        // inside every card the photo drifts against the travel (up to 10% of its width)
                        let local = (x + cw / 2 - s.width / 2) / s.width
                        phPhoto(i, CGSize(width: cw * 1.2, height: s.height * 0.62))
                            .offset(x: reduce ? 0 : -local * cw * 0.1)
                            .frame(width: cw, height: s.height * 0.62).clipShape(RoundedRectangle(cornerRadius: 10))
                            .offset(x: x)
                    }
                }
                .frame(width: s.width, height: s.height * 0.62, alignment: .leading)
                Capsule().fill(.quaternary).frame(height: 3).overlay(alignment: .leading) {
                    Capsule().fill(Color.accentColor).frame(width: max(4, (s.width - 32) * p)).frame(maxWidth: .infinity, alignment: .leading)
                }.padding(.horizontal, 16)
                Text("\(min(count, Int((p * Double(count - 1)).rounded()) + 1)) of \(count)").font(.caption.monospacedDigit()).foregroundStyle(.secondary)
            }
        }
    }
}
