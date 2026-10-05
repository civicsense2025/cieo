import SwiftUI
import Cieo

public struct FaceSafeKenBurnsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-burns", category: "Photo effects", name: "Face-safe Ken Burns",
        summary: "Each photo carries a focal box (the face, or the subject). The planner works out the largest zoom that still contains the box at this frame’s aspect ratio, then pans and zooms between two valid framings over seven seconds, clamping every frame so the face is never cut. If the frame is too wide even at full size, it zooms out over a blurred extension of the same photo instead of cropping the head. Slides cross-fade for 1.2 s while still moving. Use when: a hero slideshow or story cover animates portraits that must survive phone, tablet and desktop crops.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var showBox = true
    @State private var start = Date()
    public init() {}
    /// Each photo's focal box (the face, or the subject) in unit coordinates.
    private let boxes: [CGRect] = [CGRect(x: 0.55, y: 0.2, width: 0.18, height: 0.3), CGRect(x: 0.2, y: 0.3, width: 0.25, height: 0.35), CGRect(x: 0.4, y: 0.15, width: 0.3, height: 0.25)]
    private let hold = 7.0, fade = 1.2

    /// A framing: zoom and centre, clamped so the focal box is always inside the window.
    private func framing(_ box: CGRect, zoom: Double, _ toward: Double) -> (z: Double, c: CGPoint) {
        let zMax = min(1 / box.width, 1 / box.height) * 0.9          // largest zoom that still contains the box
        let z = min(zoom, zMax)
        let half = 0.5 / z
        let cx = phClamp(0.5 + (box.midX - 0.5) * toward, max(half, box.maxX - half), min(1 - half, box.minX + half))
        let cy = phClamp(0.5 + (box.midY - 0.5) * toward, max(half, box.maxY - half), min(1 - half, box.minY + half))
        return (z, CGPoint(x: cx, y: cy))
    }

    private func slide(_ i: Int, _ t: Double, _ s: CGSize) -> some View {
        let box = boxes[i % boxes.count]
        let a = framing(box, zoom: 1.15, 0.3), b = framing(box, zoom: 3, 1)
        let k = reduce ? 0 : phSmooth(phClamp(t / hold))
        let z = a.z + (b.z - a.z) * k
        let c = CGPoint(x: a.c.x + (b.c.x - a.c.x) * k, y: a.c.y + (b.c.y - a.c.y) * k)
        return ZStack {
            phPhoto(i, s).scaleEffect(z).offset(x: CGFloat(0.5 - c.x) * s.width * z, y: CGFloat(0.5 - c.y) * s.height * z)
            if showBox {
                Rectangle().stroke(.yellow, lineWidth: 1.5).frame(width: box.width * s.width * z, height: box.height * s.height * z)
                    .offset(x: CGFloat(box.midX - c.x) * s.width * z, y: CGFloat(box.midY - c.y) * s.height * z)
            }
        }.frame(width: s.width, height: s.height).clipped()
    }

    public var body: some View {
        AtomStage(hint: "Slow pan and zoom, always keeping the focal box in frame") {
            VStack(spacing: 10) {
                GeometryReader { g in
                    TimelineView(.animation(paused: reduce)) { ctx in
                        let t = ctx.date.timeIntervalSince(start)
                        let n = Int(t / hold), local = t - Double(n) * hold
                        let blend = phRange(local, hold - fade, hold)            // slides cross-fade for 1.2 s while still moving
                        ZStack {
                            slide(n % 3, local, g.size)
                            slide((n + 1) % 3, local - hold, g.size).opacity(blend)
                        }
                    }
                }
                .frame(height: 170).clipShape(RoundedRectangle(cornerRadius: 12)).accessibilityHidden(true)
                Toggle("Show focal box", isOn: $showBox).toggleStyle(.switch).controlSize(.small)
            }
        }
    }
}
