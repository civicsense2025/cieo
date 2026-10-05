import SwiftUI
import Cieo

public struct ShapeMorphLoaderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "loader", category: "Foundations", name: "Shape-morph loader",
        summary: "Like a drop of water: five ripples of 2 to 6 lobes are always present, and each swells and drifts at its own slow rate. Nothing ever switches or holds, so the outline flows continuously while it turns, and every frame still comes from the clock.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var epoch = Date()
    public init() {}

    /// Lobes k with amplitude, breathing rate, phase and drift.
    private static let harmonics: [(k: Double, amp: Double, rate: Double, phase: Double, drift: Double)] = [
        (2, 0.045, 0.83, 0.4, 0.31), (3, 0.06, 0.61, 1.7, -0.47), (4, 0.05, 0.97, 2.9, 0.38), (5, 0.035, 0.53, 0.8, -0.29), (6, 0.025, 1.19, 4.1, 0.52),
    ]

    /// A closed quadratic spline through midpoints keeps the outline smooth on every frame.
    private static func outline(at t: Double, in rect: CGRect) -> Path {
        let n = 96, scale = rect.width / 2.6
        let points: [CGPoint] = (0..<n).map { i in
            let th = Double(i) / Double(n) * 2 * .pi
            var r = 0.9
            for h in harmonics { r += h.amp * (0.55 + 0.45 * sin(t * h.rate * 2.2 + h.phase)) * cos(h.k * th + t * h.drift * 2.2 + h.phase) }
            let a = th + t * 0.9
            return CGPoint(x: rect.midX + r * cos(a) * scale, y: rect.midY + r * sin(a) * scale)
        }
        func mid(_ i: Int) -> CGPoint {
            let a = points[i % n], b = points[(i + 1) % n]
            return CGPoint(x: (a.x + b.x) / 2, y: (a.y + b.y) / 2)
        }
        var p = Path()
        p.move(to: mid(0))
        for i in 1...n { p.addQuadCurve(to: mid(i), control: points[i % n]) }
        p.closeSubpath()
        return p
    }

    public var body: some View {
        AtomStage {
            TimelineView(.animation(paused: reduce)) { ctx in
                let t = reduce ? 0 : ctx.date.timeIntervalSince(epoch)
                HStack(spacing: 36) {
                    Canvas { c, size in c.fill(Self.outline(at: t, in: CGRect(origin: .zero, size: size)), with: .color(.primary)) }
                        .frame(width: 56, height: 56)
                    ZStack {
                        Circle().fill(Color.primary.opacity(0.08))
                        Canvas { c, size in c.fill(Self.outline(at: t, in: CGRect(origin: .zero, size: size)), with: .color(.primary)) }
                            .frame(width: 36, height: 36)
                    }
                    .frame(width: 56, height: 56)
                }
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Loading")
        }
    }
}
