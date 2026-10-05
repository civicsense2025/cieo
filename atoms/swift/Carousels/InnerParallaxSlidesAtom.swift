import SwiftUI
import MotionKit

public struct InnerParallaxSlidesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-para", category: "Carousels", name: "Inner parallax slides",
        summary: "The frame follows the finger 1:1 while its photo drifts the other way inside it, and the caption runs slightly ahead, so three depths separate as you drag. The dot plate stretches from its leading edge and the trailing edge catches up. Inspired by Swiper parallax and Codrops slideshows; changed: every offset is computed from the slide’s distance to center, so it holds mid-flick, in reverse and when interrupted. Use when each slide is a place or a story and a sense of depth helps it read as a window.")
    public init() {}
    private let titles = ["Harbour", "Ridge", "Orchard", "Quarry"]

    public var body: some View {
        AtomStage(hint: "Frame, photo and caption move at three depths") {
            VStack(spacing: 12) {
                PhPager(count: titles.count, itemFraction: 0.8) { pos, size, item in
                    ZStack {
                        ForEach(titles.indices, id: \.self) { i in
                            let d = Double(i) - pos
                            ZStack {
                                // the photo drifts the other way inside its frame, the caption runs ahead
                                phPhoto(i, CGSize(width: item * 1.4, height: size.height))
                                    .offset(x: CGFloat(-d) * item * 0.3)
                                Text(titles[i]).font(.headline).foregroundStyle(.white).shadow(radius: 4)
                                    .offset(x: CGFloat(d) * item * 0.18, y: size.height * 0.32)
                            }
                            .frame(width: item - 10, height: size.height).clipShape(RoundedRectangle(cornerRadius: 12))
                            .offset(x: CGFloat(d) * item)
                        }
                        dots(pos).offset(y: size.height / 2 - 14)
                    }
                    .frame(width: size.width, height: size.height)
                }
                .frame(height: 170)
            }
        }
    }

    /// One plate that stretches from its leading edge while the trailing edge catches up.
    private func dots(_ pos: Double) -> some View {
        let i = floor(pos), f = pos - i
        let lo = i + phSmooth(phRange(f, 0.25, 1)), hi = i + 1 + phSmooth(phRange(f, 0, 0.75))
        return ZStack(alignment: .leading) {
            HStack(spacing: 10) { ForEach(titles.indices, id: \.self) { _ in Circle().fill(.white.opacity(0.5)).frame(width: 6, height: 6) } }
            Capsule().fill(.white).frame(width: CGFloat(hi - lo) * 16 - 10 + 6, height: 6).offset(x: CGFloat(lo) * 16)
        }
        .frame(width: CGFloat(titles.count) * 16, height: 8)
        .accessibilityHidden(true)
    }
}
