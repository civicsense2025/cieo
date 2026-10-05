import SwiftUI
import MotionKit

public struct InkEdgeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-ink", category: "Image transitions", name: "Ink edge",
        summary: "The next photo spreads in from the side of travel behind a calm, low-frequency ink contour that drifts slowly as it advances, with a faint darker rim like wash drying on paper. Use it for slower editorial pacing, where a hard wipe would feel mechanical.")
    public init() {}

    public var body: some View {
        PhSlideshow(hint: "A slow, wavering contour spreads in from the side of travel", preset: .lazy) { f in
            ZStack {
                phPhoto(f.from, f.size)
                phPhoto(f.to, f.size).mask(contour(f, fill: true))
                contour(f, fill: false).stroke(Color.black.opacity(0.18 * sin(f.p * .pi)), lineWidth: 2)
            }
            .frame(width: f.size.width, height: f.size.height).clipped()
        }
    }

    /// A low-frequency edge that drifts as it advances; filled on the side already inked.
    private func contour(_ f: PhFrame, fill: Bool) -> Path {
        let w = Double(f.size.width), h = Double(f.size.height), d = f.dir >= 0 ? 1.0 : -1.0
        let edge = (w + 80) * f.p - 40
        var path = Path()
        func x(_ y: Double) -> Double {
            let wob = sin(y / h * 5 + f.p * 4) * 18 + sin(y / h * 11 - f.p * 3) * 6
            let v = edge + wob
            return d > 0 ? w - v : v
        }
        path.move(to: CGPoint(x: x(0), y: 0))
        stride(from: 4.0, through: h, by: 4).forEach { path.addLine(to: CGPoint(x: x($0), y: $0)) }
        if fill {
            path.addLine(to: CGPoint(x: d > 0 ? w + 80 : -80, y: h))
            path.addLine(to: CGPoint(x: d > 0 ? w + 80 : -80, y: 0))
            path.closeSubpath()
        }
        return path
    }
}
