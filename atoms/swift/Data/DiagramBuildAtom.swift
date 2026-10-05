import SwiftUI
import MotionKit

public struct DiagramBuildAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "diagram", category: "Data", name: "Diagram build",
        summary: "Each node arrives 180ms after the last, and each connector draws from its source only after that source has landed, so the flow reads in order.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let nodes: [(String, Double, Double)] = [("Draft", 20, 40), ("Review", 210, 40), ("Publish", 400, 40), ("Changes", 210, 118)]
    /// from node, to node, polyline, and the heading of the arrowhead
    private let edges: [(from: Int, points: [CGPoint], heading: Double)] = [
        (0, [CGPoint(x: 160, y: 60), CGPoint(x: 210, y: 60)], 0), (1, [CGPoint(x: 350, y: 60), CGPoint(x: 400, y: 60)], 0),
        (1, [CGPoint(x: 280, y: 80), CGPoint(x: 280, y: 118)], .pi / 2), (3, [CGPoint(x: 210, y: 138), CGPoint(x: 90, y: 138), CGPoint(x: 90, y: 80)], -.pi / 2)]
    @State private var start = DataMotion.now
    public init() {}

    public var body: some View {
        AtomStage(hint: "Replay to rebuild the flow") {
            VStack(spacing: 14) {
                GeometryReader { g in
                    let s = g.size.width / 560
                    TimelineView(.animation) { ctx in
                        let t = reduce ? start + 100 : ctx.date.timeIntervalSinceReferenceDate
                        Canvas { c, _ in
                            c.scaleBy(x: s, y: s)
                            for (i, e) in edges.enumerated() {
                                let d = max(0, min(1, dataStep(t, start: start + Double(e.from) * 0.18 + 0.12 + (i == 3 ? 0.5 : 0), .soft)))
                                guard d > 0.02 else { continue }
                                var p = Path(); p.move(to: e.points[0]); e.points.dropFirst().forEach { p.addLine(to: $0) }
                                c.stroke(p.trimmedPath(from: 0, to: d), with: .color(.secondary), lineWidth: 1.5)
                                let tip = e.points.last!, h = e.heading
                                var a = Path()
                                a.move(to: tip)
                                a.addLine(to: CGPoint(x: tip.x - 7 * cos(h - 0.45), y: tip.y - 7 * sin(h - 0.45)))
                                a.addLine(to: CGPoint(x: tip.x - 7 * cos(h + 0.45), y: tip.y - 7 * sin(h + 0.45)))
                                a.closeSubpath()
                                c.fill(a, with: .color(.secondary.opacity(d)))
                            }
                            for (i, n) in nodes.enumerated() {
                                let p = max(0, min(1, dataStep(t, start: start + Double(i) * 0.18)))
                                var cc = c
                                cc.opacity = p
                                let r = CGRect(x: n.1, y: n.2, width: 140, height: 40)
                                cc.translateBy(x: r.midX, y: r.midY); cc.scaleBy(x: 0.96 + 0.04 * p, y: 0.96 + 0.04 * p); cc.translateBy(x: -r.midX, y: -r.midY)
                                let box = Path(roundedRect: r, cornerRadius: 10)
                                cc.fill(box, with: .color(i == 2 ? .primary : Color.primary.opacity(0.06)))
                                cc.stroke(box, with: .color(.primary.opacity(0.15)), lineWidth: 1)
                                let label = Text(n.0).font(.system(size: 14, weight: .medium))
                                cc.draw(i == 2 ? label.foregroundStyle(.background) : label, at: CGPoint(x: r.midX, y: r.midY))
                            }
                        }
                    }
                }
                .aspectRatio(560.0 / 170.0, contentMode: .fit).frame(maxWidth: 560)
                .accessibilityElement().accessibilityLabel("Publishing flow: Draft, Review, Publish, with a Changes loop back to Draft")
                Button("Replay") { start = DataMotion.now }.buttonStyle(.bordered)
            }
        }
    }
}
