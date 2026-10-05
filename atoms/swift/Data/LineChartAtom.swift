import SwiftUI
import Cieo

public struct LineChartAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "line", category: "Data", name: "Line chart",
        summary: "The line draws on the lazy spring through stroke-dashoffset. The dot and tooltip follow the nearest point on the snap spring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private static let data: [Double] = [42, 48, 45, 61, 58, 72, 69, 84, 80, 95, 103, 118]
    private static let months = Array("JFMAMJJASOND").map(String.init)
    private static let x0 = 36.0, x1 = 508.0, y0 = 190.0, y1 = 14.0
    @State private var draw = Track(0, preset: .lazy)
    @State private var hx = Track(36, preset: .snap)
    @State private var hy = Track(0, preset: .snap)
    @State private var show = Track(0, preset: .snap)
    @State private var index = -1
    @State private var shown = 0
    public init() {}

    private func px(_ i: Int) -> Double { Self.x0 + Double(i) * (Self.x1 - Self.x0) / 11 }
    private func py(_ v: Double) -> Double { Self.y0 - v / 120 * (Self.y0 - Self.y1) }
    private var points: [CGPoint] { Self.data.enumerated().map { CGPoint(x: px($0.offset), y: py($0.element)) } }

    private var curve: Path {
        let p = points
        var path = Path()
        path.move(to: p[0])
        for i in 0..<11 {
            let a = p[max(0, i - 1)], b = p[i], c = p[i + 1], e = p[min(11, i + 2)]
            path.addCurve(to: c,
                control1: CGPoint(x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6),
                control2: CGPoint(x: c.x - (e.x - b.x) / 6, y: c.y - (e.y - b.y) / 6))
        }
        return path
    }

    public var body: some View {
        AtomStage(hint: "Hover or drag across the line") {
            VStack(spacing: 14) {
                GeometryReader { g in
                    let s = g.size.width / 520
                    TimelineView(.motion(draw, hx, hy, show)) { ctx in
                        let t = ctx.date.timeIntervalSinceReferenceDate
                        let p = max(0, min(1, draw.value(at: t)))
                        let o = max(0, min(1, show.value(at: t))) * (p > 0.98 ? 1 : 0)
                        let x = hx.value(at: t), y = hy.value(at: t)
                        ZStack(alignment: .topLeading) {
                            Canvas { ctx, _ in
                                ctx.scaleBy(x: s, y: s)
                                for v in [0.0, 40, 80, 120] {
                                    var l = Path(); l.move(to: CGPoint(x: Self.x0, y: py(v))); l.addLine(to: CGPoint(x: Self.x1, y: py(v)))
                                    ctx.stroke(l, with: .color(.primary.opacity(0.12)), lineWidth: 1)
                                    ctx.draw(Text("\(Int(v))k").font(.system(size: 11)).foregroundStyle(.secondary), at: CGPoint(x: Self.x0 - 8, y: py(v)), anchor: .trailing)
                                }
                                for (i, m) in Self.months.enumerated() {
                                    ctx.draw(Text(m).font(.system(size: 11)).foregroundStyle(.secondary), at: CGPoint(x: px(i), y: Self.y0 + 20))
                                }
                                var area = curve
                                area.addLine(to: CGPoint(x: Self.x1, y: Self.y0)); area.addLine(to: CGPoint(x: Self.x0, y: Self.y0)); area.closeSubpath()
                                ctx.fill(area, with: .color(.primary.opacity(p * p * 0.07)))
                                ctx.stroke(curve.trimmedPath(from: 0, to: p), with: .color(.primary), style: StrokeStyle(lineWidth: 2.25, lineCap: .round))
                                var guide = Path(); guide.move(to: CGPoint(x: x, y: Self.y1)); guide.addLine(to: CGPoint(x: x, y: Self.y0))
                                ctx.stroke(guide, with: .color(.secondary.opacity(o * 0.8)), style: StrokeStyle(lineWidth: 1, dash: [3, 3]))
                                let dot = Path(ellipseIn: CGRect(x: x - 5, y: y - 5, width: 10, height: 10))
                                ctx.stroke(dot, with: .color(.primary.opacity(o)), lineWidth: 2.25)
                            }
                            if true {
                                Text("\(Self.months[shown]) · \(Int(Self.data[shown]))k readers")
                                    .font(.caption).monospacedDigit().padding(.horizontal, 9).padding(.vertical, 4)
                                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
                                    .fixedSize()
                                    .position(x: x * s, y: y * s - 30 + 6 * (1 - o))
                                    .opacity(o)
                            }
                        }
                    }
                    .contentShape(Rectangle())
                    .gesture(DragGesture(minimumDistance: 0)
                        .onChanged { move(to: $0.location.x / s) }
                        .onEnded { _ in leave() })
                    .onContinuousHover { phase in
                        switch phase {
                        case .active(let loc): move(to: loc.x / s)
                        case .ended: leave()
                        }
                    }
                }
                .aspectRatio(520.0 / 220.0, contentMode: .fit)
                .frame(maxWidth: 520)
                .accessibilityLabel("Weekly active readers by month, in thousands")
                Button("Replay", action: replay).buttonStyle(.bordered)
            }
        }
        .onAppear { hy.jump(py(Self.data[0])); replay() }
    }

    private func replay() { draw.jump(0); DataMotion.retarget(&draw, to: 1, reduce: reduce) }

    private func move(to x: Double) {
        let i = max(0, min(11, Int(((x - Self.x0) / ((Self.x1 - Self.x0) / 11)).rounded())))
        if show.target == 0 { hx.jump(px(i)); hy.jump(py(Self.data[i])) }
        DataMotion.retarget(&show, to: 1, reduce: reduce)
        if i != index {
            index = i; shown = i
            DataMotion.retarget(&hx, to: px(i), reduce: reduce)
            DataMotion.retarget(&hy, to: py(Self.data[i]), reduce: reduce)
        }
    }

    private func leave() { DataMotion.retarget(&show, to: 0, reduce: reduce); index = -1 }
}
