import SwiftUI
import MotionKit

public struct TileWaveAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-tiles", category: "Image transitions", name: "Tile wave",
        summary: "The next photo grows in as dots that open into squares, in a wave that starts exactly where you clicked, tapped or started your swipe; keys start it from the side you are heading to. Use it when the change comes from a place the person pointed at, like choosing a hotspot or a map region.")
    public init() {}

    public var body: some View {
        PhSlideshow(hint: "The wave starts where you tap", preset: .lazy) { f in
            ZStack {
                phPhoto(f.from, f.size)
                phPhoto(f.to, f.size).mask(
                    Canvas { ctx, size in
                        let cols = 10, rows = 7
                        let tw = size.width / CGFloat(cols), th = size.height / CGFloat(rows)
                        let o = CGPoint(x: f.origin.x * size.width, y: f.origin.y * size.height)
                        let far = hypot(size.width, size.height)
                        for r in 0..<rows { for c in 0..<cols {
                            let mid = CGPoint(x: (CGFloat(c) + 0.5) * tw, y: (CGFloat(r) + 0.5) * th)
                            let delay = Double(hypot(mid.x - o.x, mid.y - o.y) / far) * 0.55
                            let t = phSmooth(phRange(f.p, delay, delay + 0.45))
                            let side = max(tw, th) * 1.02 * t
                            let rect = CGRect(x: mid.x - side / 2, y: mid.y - side / 2, width: side, height: side)
                            // dots open into squares: the corner radius closes as the tile grows
                            ctx.fill(Path(roundedRect: rect, cornerRadius: side * (1 - t) / 2), with: .color(.white))
                        } }
                    }
                    .frame(width: f.size.width, height: f.size.height))
            }
        }
    }
}
