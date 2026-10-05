import SwiftUI
import MotionKit

public struct BeforeAfterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "beforeafter", category: "Media", name: "Before / after",
        summary: "The divider sits exactly under the pointer while dragging. Clicking elsewhere springs it there instead.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var x = Track(0.5, preset: .base)
    @State private var held = false
    @State private var moved = false
    @State private var hx = 0.5
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the handle, or click to spring it") {
            GeometryReader { g in
                TimelineView(.motion(x)) { ctx in
                    let v = held && moved ? hx : x.value(at: ctx.date.timeIntervalSinceReferenceDate)
                    ZStack(alignment: .leading) {
                        AtomPhoto(seed: 2, goldenHour: 0).saturation(0)
                        AtomPhoto(seed: 2, goldenHour: 1)
                            .mask(alignment: .leading) { Rectangle().frame(width: g.size.width * v) }
                        Rectangle().fill(.primary).frame(width: 2).offset(x: g.size.width * v - 1)
                        Circle().fill(.primary).frame(width: 28, height: 28).shadow(radius: 3, y: 1)
                            .offset(x: g.size.width * v - 14)
                        Text("Sketch").font(.caption).foregroundStyle(.secondary).padding(10).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                        Text("Final").font(.caption).foregroundStyle(.white).padding(10).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .contentShape(Rectangle())
                .gesture(DragGesture(minimumDistance: 0)
                    .onChanged { d in
                        let p = max(0, min(1, d.location.x / g.size.width))
                        if !held {
                            held = true; moved = false; hx = p
                            DataMotion.retarget(&x, to: p, reduce: reduce)
                        } else if abs(d.translation.width) > 2 { moved = true; hx = p }
                    }
                    .onEnded { _ in
                        if moved { x.jump(hx) }
                        held = false
                    })
                .accessibilityElement()
                .accessibilityLabel("Comparison position")
                .accessibilityValue("\(Int(x.target * 100)) percent")
                .accessibilityAdjustableAction { dir in
                    let d = dir == .increment ? 0.1 : -0.1
                    DataMotion.retarget(&x, to: max(0, min(1, x.target + d)), reduce: reduce)
                }
            }
            .aspectRatio(12.0 / 7.0, contentMode: .fit)
            .frame(maxWidth: 360)
        }
    }
}
