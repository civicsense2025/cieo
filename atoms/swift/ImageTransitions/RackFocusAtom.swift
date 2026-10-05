import SwiftUI
import Cieo

public struct RackFocusAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-rack", category: "Image transitions", name: "Rack focus",
        summary: "Focus pulls off the current photo, which softens and breathes 4% larger like a real lens, while the next photo sharpens from its foreground back to its horizon. Use it to move attention between related shots, like a detail and the wide view, without implying a direction.")
    public init() {}

    public var body: some View {
        PhSlideshow(hint: "Focus pulls off one photo onto the next", preset: .soft) { f in
            let out = phRange(f.p, 0, 0.5)
            ZStack {
                // the old photo softens and breathes 4% larger, like a lens
                phPhoto(f.from, f.size).blur(radius: 14 * out).scaleEffect(1 + 0.04 * out)
                    .opacity(1 - phRange(f.p, 0.3, 0.7))
                // the new photo sharpens from its foreground back to its horizon
                ZStack {
                    phPhoto(f.to, f.size).blur(radius: 14 * (1 - phRange(f.p, 0.3, 1)))
                    phPhoto(f.to, f.size).mask(phSoftEdge(phRange(f.p, 0.35, 1), soft: 0.4, start: .bottom, end: .top))
                }
                .opacity(phRange(f.p, 0.2, 0.6))
            }
            .frame(width: f.size.width, height: f.size.height).clipped()
        }
    }
}
