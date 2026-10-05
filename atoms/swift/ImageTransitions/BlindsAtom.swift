import SwiftUI
import Cieo

public struct BlindsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-blinds", category: "Image transitions", name: "Blinds",
        summary: "Vertical slats turn one after another, starting on the side you swiped from: each face narrows and darkens as it turns away while the new face widens. A fast flick turns the slats almost together; a slow drag spreads the wave out. Use it when photos are browsed by hand, like a lookbook, and the gesture should be felt in the change.")
    public init() {}
    private let slats = 8

    public var body: some View {
        PhSlideshow(hint: "Slats turn from the side you came from", preset: .soft) { f in
            let sw = f.size.width / CGFloat(slats)
            HStack(spacing: 0) {
                ForEach(0..<slats, id: \.self) { i in
                    let order = Double(f.dir >= 0 ? slats - 1 - i : i)
                    let t = phRange(f.p, order * 0.07, order * 0.07 + 0.5)
                    let angle = t < 0.5 ? t * 180 : (t - 1) * 180
                    ZStack {
                        phPhoto(t < 0.5 ? f.from : f.to, f.size).offset(x: -sw * CGFloat(i) + (f.size.width - sw) / 2)
                        Color.black.opacity(0.4 * abs(sin(angle * .pi / 180)))
                    }
                    .frame(width: sw, height: f.size.height).clipped()
                    .rotation3DEffect(.degrees(angle), axis: (0, 1, 0), perspective: 0.5)
                }
            }
            .frame(width: f.size.width, height: f.size.height)
        }
    }
}
