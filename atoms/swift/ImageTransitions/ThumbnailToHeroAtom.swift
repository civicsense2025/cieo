import SwiftUI
import MotionKit

public struct ThumbnailToHeroAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-flip", category: "Image transitions", name: "Thumbnail to hero",
        summary: "The thumbnail you choose lifts out of the strip and grows into the hero along a curved path: it rises first, then widens as it lands, while its slot stays outlined until it arrives and the old hero dims beneath. Use it for galleries with a visible strip or grid, so people see where the big photo came from.")
    @State private var from = 0
    @State private var to = 0
    @State private var epoch = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a thumbnail: it lifts out and lands as the hero") {
            GeometryReader { g in
                let w = g.size.width, h = g.size.height
                let hero = CGRect(x: 0, y: 0, width: w, height: h * 0.72)
                let tw = (w - 16) / 3, th = h * 0.24
                let thumbs = (0..<3).map { CGRect(x: CGFloat($0) * (tw + 8), y: h - th, width: tw, height: th) }
                PhFollow(target: 1, preset: .soft, epoch: epoch) { p in
                    ZStack(alignment: .topLeading) {
                        phPhoto(from, hero.size).clipShape(RoundedRectangle(cornerRadius: 10)).opacity(1 - 0.6 * p)
                        ForEach(0..<3, id: \.self) { i in
                            ZStack {
                                RoundedRectangle(cornerRadius: 8).strokeBorder(Color.accentColor, lineWidth: 2)
                                    .opacity(i == to && p < 1 ? 1 : 0)       // the slot stays outlined until the photo lands
                                phPhoto(i, thumbs[i].size).clipShape(RoundedRectangle(cornerRadius: 8))
                                    .opacity(i == to && p < 1 ? 0.25 : 1)
                            }
                            .frame(width: tw, height: th).offset(x: thumbs[i].minX, y: thumbs[i].minY)
                            .onTapGesture { pick(i) }
                            .accessibilityLabel("Photo \(i + 1)").accessibilityAddTraits(.isButton)
                        }
                        // the flying photo rises first, then widens as it lands
                        let rise = phSmooth(phRange(p, 0, 0.6)), grow = phSmooth(phRange(p, 0.25, 1))
                        let t = thumbs[to]
                        phPhoto(to, CGSize(width: lerp(t.width, hero.width, grow), height: lerp(t.height, hero.height, grow)))
                            .clipShape(RoundedRectangle(cornerRadius: lerp(8, 10, grow)))
                            .offset(x: lerp(t.minX, hero.minX, grow), y: lerp(t.minY, hero.minY, rise))
                            .allowsHitTesting(false)
                    }
                }
            }
            .frame(height: 230)
        }
    }

    private func lerp(_ a: CGFloat, _ b: CGFloat, _ t: Double) -> CGFloat { a + (b - a) * CGFloat(t) }
    private func pick(_ i: Int) {
        guard i != to else { return }
        from = to; to = i; epoch += 1
    }
}
