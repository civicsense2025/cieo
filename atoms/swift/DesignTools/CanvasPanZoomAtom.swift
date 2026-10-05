import SwiftUI
import MotionKit

public struct CanvasPanZoomAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "canvaszoom", category: "Design tools", name: "Canvas pan and zoom",
        summary: "Zoom keeps the point under the pointer fixed, so you zoom into what you are looking at. Pan follows the drag exactly and coasts briefly after release.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var scale = Track(1, preset: .snap)
    @State private var x = Track(-60, preset: .soft)
    @State private var y = Track(-60, preset: .soft)
    @State private var panning = false
    @State private var hx = 0.0
    @State private var hy = 0.0
    @State private var start = CGPoint.zero
    @State private var vx = DataVelocity()
    @State private var vy = DataVelocity()
    @State private var pinch: (s: Double, x: Double, y: Double)?
    public init() {}

    private func now() -> Double { DataMotion.now }

    private func zoom(to target: Double, around c: CGPoint) {
        let ns = max(0.3, min(3, target)), k = ns / scale.target
        DataMotion.retarget(&x, to: c.x - (c.x - x.target) * k, preset: .snap, reduce: reduce)
        DataMotion.retarget(&y, to: c.y - (c.y - y.target) * k, preset: .snap, reduce: reduce)
        DataMotion.retarget(&scale, to: ns, reduce: reduce)
    }

    public var body: some View {
        AtomStage(hint: "Drag to pan · pinch or use + − to zoom toward a point") {
            GeometryReader { g in
                let center = CGPoint(x: g.size.width / 2, y: g.size.height / 2)
                ZStack(alignment: .topLeading) {
                    TimelineView(.animation) { ctx in
                        let t = ctx.date.timeIntervalSinceReferenceDate
                        world.scaleEffect(scale.value(at: t), anchor: .topLeading)
                            .offset(x: panning ? hx : x.value(at: t), y: panning ? hy : y.value(at: t))
                    }
                    .frame(width: g.size.width, height: g.size.height, alignment: .topLeading)
                    controls(center, g.size)
                }
                .frame(width: g.size.width, height: g.size.height).clipped()
                .background(.background, in: RoundedRectangle(cornerRadius: 14))
                .clipShape(RoundedRectangle(cornerRadius: 14)).overlay(RoundedRectangle(cornerRadius: 14).stroke(.quaternary))
                .gesture(DragGesture(minimumDistance: 2)
                    .onChanged { d in
                        let n = now()
                        if !panning { panning = true; start = CGPoint(x: x.value(at: n), y: y.value(at: n)); vx.reset(); vy.reset() }
                        hx = start.x + d.translation.width; hy = start.y + d.translation.height
                        vx.add(hx, at: d.time.timeIntervalSinceReferenceDate); vy.add(hy, at: d.time.timeIntervalSinceReferenceDate)
                    }
                    .onEnded { _ in
                        panning = false
                        if reduce { x.jump(hx); y.jump(hy) } else {
                            x.release(from: hx, velocity: vx.v, to: hx + vx.v * 0.25, preset: .soft, at: now())
                            y.release(from: hy, velocity: vy.v, to: hy + vy.v * 0.25, preset: .soft, at: now())
                        }
                    })
                .simultaneousGesture(MagnifyGesture()
                    .onChanged { m in
                        if pinch == nil { pinch = (scale.target, x.target, y.target) }
                        guard let p = pinch else { return }
                        let ns = max(0.3, min(3, p.s * m.magnification)), k = ns / p.s
                        let c = CGPoint(x: m.startAnchor.x * g.size.width, y: m.startAnchor.y * g.size.height)
                        scale.jump(ns); x.jump(c.x - (c.x - p.x) * k); y.jump(c.y - (c.y - p.y) * k)
                    }
                    .onEnded { _ in pinch = nil })
            }
            .frame(maxWidth: 600).frame(height: 280)
        }
    }

    private func controls(_ center: CGPoint, _ size: CGSize) -> some View {
        HStack(spacing: 4) {
            Button { zoom(to: scale.target / 1.25, around: center) } label: { Text("−").frame(width: 24) }.accessibilityLabel("Zoom out")
            Text("\(Int((scale.target * 100).rounded()))%").monospacedDigit().frame(minWidth: 52)
            Button { zoom(to: scale.target * 1.25, around: center) } label: { Text("+").frame(width: 24) }.accessibilityLabel("Zoom in")
            Button("Fit") {
                let ns = min(size.width / 900, size.height / 600) * 1.6
                DataMotion.retarget(&scale, to: ns, reduce: reduce)
                DataMotion.retarget(&x, to: (size.width - 900 * ns) / 2 + 40 * ns, preset: .snap, reduce: reduce)
                DataMotion.retarget(&y, to: (size.height - 600 * ns) / 2 - 20 * ns, preset: .snap, reduce: reduce)
            }
        }
        .buttonStyle(.bordered).controlSize(.small).font(.caption)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing).padding(10)
    }

    private var world: some View {
        ZStack(alignment: .topLeading) {
            Canvas { c, size in
                for gx in stride(from: 0.0, to: size.width, by: 24) { for gy in stride(from: 0.0, to: size.height, by: 24) {
                    c.fill(Path(ellipseIn: CGRect(x: gx, y: gy, width: 1.5, height: 1.5)), with: .color(.primary.opacity(0.2)))
                } }
            }
            VStack(alignment: .leading, spacing: 6) { Text("Hero").fontWeight(.semibold); Text("Headline, one line of support, one button.").font(.caption).foregroundStyle(.secondary) }
                .padding(14).frame(width: 220, height: 150, alignment: .topLeading).background(.quaternary, in: RoundedRectangle(cornerRadius: 12)).offset(x: 160, y: 120)
            Circle().fill(Color.accentColor).frame(width: 140, height: 140).offset(x: 440, y: 180)
            Text("Pricing").font(.caption.weight(.semibold)).padding(14).frame(width: 260, height: 90, alignment: .topLeading)
                .background(.quaternary, in: RoundedRectangle(cornerRadius: 12)).offset(x: 300, y: 340)
        }
        .frame(width: 900, height: 600, alignment: .topLeading).accessibilityHidden(true)
    }
}
