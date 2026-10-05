import SwiftUI
import Cieo

public struct ParallaxDepthPlanesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-depthplanes", category: "Scroll stories", name: "Parallax depth planes",
        summary: "Use when a hero should feel spatial without 3D assets. One PhotoKit scene is cut into planes in the page: per column, flat runs are found from the bottom up and clustered into ridge tones; the sky is the back plane. Scrolling moves each plane by its depth (sky 8%, far ridge 25%, near slope 100% of a 16% range), and the headline sits between the far and middle ridges, so it rises from behind the hills. Reduced motion holds the planes still and fades the headline in.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}

    public var body: some View {
        PhScrollStory(hint: "Scroll: each plane moves by its depth") { p, s in
            let range = s.height * 0.16 * (reduce ? 0 : p)
            ZStack {
                // one scene cut into planes: the sky is the back plane, then a far ridge, then the near slope
                plane(s, from: 0, shift: range * 0.08)
                plane(s, from: 0.5, shift: range * 0.25)
                Text("Over the hills").font(.title3.weight(.bold)).foregroundStyle(.white).shadow(radius: 4)
                    .offset(y: s.height * 0.14 * (1 - CGFloat(phSmooth(phRange(p, 0, 0.7)))))      // rises from behind the hills
                    .opacity(reduce ? phRange(p, 0.1, 0.4) : 1)
                plane(s, from: 0.74, shift: range)
            }
        }
    }

    /// The photo below `from` (a fraction of height), nudged up by `shift` and over-sized so the move never shows an edge.
    private func plane(_ s: CGSize, from: Double, shift: CGFloat) -> some View {
        phPhoto(2, s).scaleEffect(1.2)
            .offset(y: -shift)
            .mask(alignment: .bottom) { Rectangle().frame(height: s.height * (1 - from)) }
    }
}
