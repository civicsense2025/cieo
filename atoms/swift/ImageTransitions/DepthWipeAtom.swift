import SwiftUI
import MotionKit

public struct DepthWipeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-depth", category: "Image transitions", name: "Depth wipe",
        summary: "The current photo slides off like a sheet and uncovers the next one behind it. The new photo travels less than the sheet’s edge, and its ground travels further than its sky, the parallax of a camera trucking sideways; a soft shadow from the sheet’s edge falls on it. Use it for places seen in order, like a travel story or a property tour, where direction means moving on.")
    public init() {}

    public var body: some View {
        PhSlideshow(hint: "The sheet slides off; ground travels further than sky", preset: .soft) { f in
            let s = f.size, w = Double(s.width), d = f.dir >= 0 ? 1.0 : -1.0
            let sheetX = -d * w * f.p
            let edge = d > 0 ? w * (1 - f.p) : w * f.p
            ZStack {
                // the new photo travels less than the sheet; its ground travels further than its sky
                phPhoto(f.to, s).offset(x: d * w * 0.18 * (1 - f.p)).mask(alignment: .top) { Rectangle().frame(height: s.height * 0.5) }
                phPhoto(f.to, s).offset(x: d * w * 0.30 * (1 - f.p)).mask(alignment: .bottom) { Rectangle().frame(height: s.height * 0.5) }
                LinearGradient(colors: [.black.opacity(0.35 * (1 - f.p)), .clear],
                               startPoint: d > 0 ? .leading : .trailing, endPoint: d > 0 ? .trailing : .leading)
                    .frame(width: 40).position(x: edge + d * 20, y: s.height / 2)
                phPhoto(f.from, s).offset(x: sheetX)
            }
            .frame(width: s.width, height: s.height).clipped()
        }
    }
}
