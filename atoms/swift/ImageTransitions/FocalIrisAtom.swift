import SwiftUI
import MotionKit

public struct FocalIrisAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-iris", category: "Image transitions", name: "Focal iris",
        summary: "The next photo opens in a circle centred on its own subject, starting 10% large and settling, while the current photo pushes in 5% toward that same point and dims; reversing closes the iris into the subject. Use it when the subject matters more than the place, like portraits, products or a featured story.")
    public init() {}
    private let subject = CGPoint(x: 0.6, y: 0.4)

    public var body: some View {
        PhSlideshow(hint: "Next opens an iris on the subject; Back closes it") { f in
            let s = f.size
            let c = CGPoint(x: s.width * subject.x, y: s.height * subject.y)
            let r = Double(hypot(s.width, s.height))
            let fwd = f.dir >= 0
            let p = fwd ? f.p : 1 - f.p      // forward opens the iris, reversing closes it
            ZStack {
                // the photo under the iris pushes in 5% toward the subject and dims
                phPhoto(fwd ? f.from : f.to, s)
                    .scaleEffect(1 + 0.05 * p, anchor: UnitPoint(x: subject.x, y: subject.y))
                    .overlay(Color.black.opacity(0.35 * p))
                phPhoto(fwd ? f.to : f.from, s)
                    .scaleEffect(1.1 - 0.1 * p, anchor: UnitPoint(x: subject.x, y: subject.y))
                    .mask(phCircle(c, r * p, s))
            }
        }
    }
}
