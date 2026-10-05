import SwiftUI
import Cieo

public struct SelectMoveSnapAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "selectresize", category: "Design tools", name: "Select, move and snap",
        summary: "Moving and resizing follow the pointer, but within 8px of the other shape’s edges or center the box is pulled into alignment on a stiff spring, and a red guide marks the match.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let ref = CGRect(x: 60, y: 60, width: 160, height: 110)
    @State private var bx = Track(330, preset: .snap)
    @State private var by = Track(130, preset: .snap)
    @State private var bw = Track(140, preset: .snap)
    @State private var bh = Track(100, preset: .snap)
    @State private var gx = Track(0, preset: .snap)
    @State private var gy = Track(0, preset: .snap)
    @State private var guideX = 0.0
    @State private var guideY = 0.0
    @State private var origin: (x: Double, y: Double, w: Double, h: Double)?
    public init() {}

    private var xs: [Double] { [ref.minX, ref.maxX, ref.midX] }
    private var ys: [Double] { [ref.minY, ref.maxY, ref.midY] }
    private func near(_ v: Double, _ c: [Double]) -> Double? { c.first { abs(v - $0) < 8 } }

    public var body: some View {
        AtomStage(hint: "Drag the box near the grey one · drag the corner to resize") {
            TimelineView(.motion(bx, by, bw, bh, gx, gy)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let x = bx.value(at: t), y = by.value(at: t), w = bw.value(at: t), h = bh.value(at: t)
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 10).fill(.quaternary).frame(width: ref.width, height: ref.height).offset(x: ref.minX, y: ref.minY)
                    Rectangle().fill(.red).frame(width: 1).frame(maxHeight: .infinity).offset(x: guideX).opacity(max(0, min(1, gx.value(at: t))))
                    Rectangle().fill(.red).frame(height: 1).frame(maxWidth: .infinity).offset(y: guideY).opacity(max(0, min(1, gy.value(at: t))))
                    RoundedRectangle(cornerRadius: 10).fill(Color.accentColor).frame(width: max(0, w), height: max(0, h)).offset(x: x, y: y)
                        .gesture(DragGesture(minimumDistance: 0).onChanged { move($0.translation) }.onEnded { _ in release() })
                        .accessibilityLabel("Box").accessibilityValue("\(Int(bw.target)) by \(Int(bh.target))")
                    RoundedRectangle(cornerRadius: 3).fill(.background).overlay(RoundedRectangle(cornerRadius: 3).stroke(.primary, lineWidth: 2))
                        .frame(width: 12, height: 12).contentShape(Rectangle().inset(by: -8)).offset(x: x + w - 6, y: y + h - 6)
                        .gesture(DragGesture(minimumDistance: 0).onChanged { resize($0.translation) }.onEnded { _ in release() })
                        .accessibilityLabel("Resize handle")
                    Text("\(Int(bw.target.rounded())) × \(Int(bh.target.rounded()))").font(.caption).monospacedDigit().foregroundStyle(.background)
                        .padding(.horizontal, 6).padding(.vertical, 1).background(.primary, in: RoundedRectangle(cornerRadius: 5)).fixedSize()
                        .offset(x: x + w / 2 - 28, y: y + h + 8)
                }
                .frame(maxWidth: 600, maxHeight: 280, alignment: .topLeading)
                .background(.background, in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(.quaternary))
            }
            .frame(maxWidth: 600).frame(height: 280)
        }
    }

    private func begin() {
        if origin == nil { origin = (bx.target, by.target, bw.target, bh.target) }
    }

    private func set(_ track: inout Track, _ v: Double) { DataMotion.retarget(&track, to: v, reduce: reduce) }

    private func move(_ d: CGSize) {
        begin()
        guard let o = origin else { return }
        let nx = o.x + d.width, ny = o.y + d.height
        var fx = nx, fy = ny, sx: Double?, sy: Double?
        for off in [0, o.w, o.w / 2] { if let c = near(nx + off, xs) { fx = c - off; sx = c; break } }
        for off in [0, o.h, o.h / 2] { if let c = near(ny + off, ys) { fy = c - off; sy = c; break } }
        set(&bx, fx); set(&by, fy)
        set(&gx, sx == nil ? 0 : 1); set(&gy, sy == nil ? 0 : 1)
        if let sx { guideX = sx }; if let sy { guideY = sy }
    }

    private func resize(_ d: CGSize) {
        begin()
        guard let o = origin else { return }
        var w = max(40, o.w + d.width), h = max(40, o.h + d.height)
        let cx = near(bx.target + w, xs), cy = near(by.target + h, ys)
        if let cx { w = cx - bx.target }; if let cy { h = cy - by.target }
        set(&bw, w); set(&bh, h)
        set(&gx, cx == nil ? 0 : 1); set(&gy, cy == nil ? 0 : 1)
        if let cx { guideX = cx }; if let cy { guideY = cy }
    }

    private func release() { origin = nil; set(&gx, 0); set(&gy, 0) }
}
