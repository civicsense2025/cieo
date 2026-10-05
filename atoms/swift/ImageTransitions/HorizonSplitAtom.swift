import SwiftUI
import MotionKit

public struct HorizonSplitAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-split", category: "Image transitions", name: "Horizon split",
        summary: "The photo parts along its own horizon, the next caption shows in the seam, the seam slides to the new photo’s horizon, then the halves close on the new photo, which drifts in from the side of travel. Exit, then enter, never overlapping. Use it for chaptered stories, where each photo opens a new section.")
    public init() {}

    public var body: some View {
        PhSlideshow(hint: "Exit, then enter: the halves part, then close", preset: .soft) { f in
            let s = f.size
            let open = phRange(f.p, 0, 0.35), close = phRange(f.p, 0.65, 1)
            let gap = 44 * (open - close)
            let seam = s.height * (0.55 + 0.05 * Double(f.to % 2))
            let showNew = f.p >= 0.5
            let drift = CGFloat(f.dir) * 24 * (1 - close)
            ZStack {
                Color.black.opacity(0.85)
                Text("Chapter \(f.to + 1)").font(.caption.weight(.semibold)).foregroundStyle(.white)
                    .opacity(phRange(f.p, 0.25, 0.4) - phRange(f.p, 0.6, 0.75))
                half(top: true, f: f, seam: seam, gap: gap, newPhoto: showNew, drift: showNew ? drift : 0)
                half(top: false, f: f, seam: seam, gap: gap, newPhoto: showNew, drift: showNew ? drift : 0)
            }
            .frame(width: s.width, height: s.height).clipped()
        }
    }

    private func half(top: Bool, f: PhFrame, seam: Double, gap: Double, newPhoto: Bool, drift: CGFloat) -> some View {
        let s = f.size, h = top ? seam : Double(s.height) - seam
        return phPhoto(newPhoto ? f.to : f.from, s)
            .offset(x: drift)
            .mask(alignment: top ? .top : .bottom) { Rectangle().frame(height: h) }
            .offset(y: CGFloat(top ? -gap / 2 : gap / 2))
    }
}
