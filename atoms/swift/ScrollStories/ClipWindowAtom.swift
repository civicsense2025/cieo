import SwiftUI
import Cieo

public struct ClipWindowAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-clipwindow", category: "Scroll stories", name: "Clip window to full bleed",
        summary: "Use when a page should move from editorial text into an immersive photo without a hard cut. The photo sits behind a small rounded window; scrolling opens the clip-path toward full bleed with the top and bottom edges leading and the sides lagging 8% of scroll behind, while the photo eases from 1.18× to 1×. The headline rides the top edge out, the note rides the bottom edge, and the caption tag fades in last. Reduced motion cuts from window to full bleed at the midpoint.")
    public init() {}

    public var body: some View {
        PhScrollStory(hint: "Scroll: a small window opens to full bleed") { p, s in
            // top and bottom edges lead; the sides lag 8% of scroll behind
            let v = phSmooth(phRange(p, 0, 0.7)), h = phSmooth(phRange(p, 0.08, 0.78))
            let insetV = 70 * (1 - v), insetH = 60 * (1 - h)
            ZStack {
                Color(white: 0.96)
                phPhoto(1, s).scaleEffect(1.18 - 0.18 * phSmooth(phRange(p, 0, 0.8)))
                    .mask(RoundedRectangle(cornerRadius: 22 * (1 - v)).padding(.vertical, insetV).padding(.horizontal, insetH))
                Text("The page opens").font(.headline).foregroundStyle(.primary).opacity(1 - phRange(p, 0.2, 0.5))
                    .offset(y: -insetV - 4 - 60 * phRange(p, 0, 0.7)).frame(maxHeight: .infinity, alignment: .top).padding(.top, 74)
                Text("Dusk, 6:42 pm").font(.caption.weight(.semibold)).padding(.horizontal, 10).padding(.vertical, 4)
                    .background(.regularMaterial, in: Capsule()).opacity(phRange(p, 0.85, 1))
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading).padding(14)
            }
        }
    }
}
