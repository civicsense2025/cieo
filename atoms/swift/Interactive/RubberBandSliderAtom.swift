import SwiftUI
import Cieo

public struct RubberBandSliderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "slider", category: "Interactive", name: "Rubber-band slider",
        summary: "While held, the value is the pointer. Past the ends the pill stretches with rising resistance, then springs back from release velocity.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var value = Track(0.6, preset: .base)
    @State private var over = Track(0, preset: .base)
    @State private var held = false
    @State private var hv = 0.6
    @State private var ho = 0.0
    @State private var vel = DataVelocity()
    public init() {}

    /// d·(1 − 1/(0.55x/d + 1)): rising resistance, never more than d.
    private func band(_ x: Double, _ d: Double = 60) -> Double { (x < 0 ? -1 : 1) * d * (1 - 1 / (0.55 * abs(x) / d + 1)) }

    public var body: some View {
        AtomStage(hint: "Drag past either end") {
            VStack(spacing: 8) {
                HStack(spacing: 12) {
                    Image(systemName: "speaker.fill")
                    track
                    Image(systemName: "speaker.wave.3.fill")
                }
                .frame(maxWidth: 320)
                TimelineView(.motion(value)) { ctx in
                    let v = held ? hv : value.value(at: ctx.date.timeIntervalSinceReferenceDate)
                    Text("\(Int((max(0, min(1, v)) * 100).rounded()))%").font(.title3).monospacedDigit()
                }
            }
        }
    }

    private var track: some View {
        GeometryReader { g in
            TimelineView(.motion(value, over)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let val = max(0, min(1, held ? hv : value.value(at: t))), o = held ? ho : over.value(at: t)
                let w = g.size.width + abs(o), h = 10 - min(3.5, abs(o) * 0.07)
                ZStack(alignment: .leading) {
                    Capsule().fill(.quaternary)
                    Capsule().fill(.primary).frame(width: val * w)
                }
                .frame(width: w, height: h)
                .offset(x: min(0, o), y: (g.size.height - h) / 2)
                .accessibilityElement()
                .accessibilityLabel("Volume")
                .accessibilityValue("\(Int(val * 100)) percent")
                .accessibilityAdjustableAction { dir in
                    DataMotion.retarget(&value, to: max(0, min(1, value.target + (dir == .increment ? 0.1 : -0.1))), reduce: reduce)
                }
            }
            .contentShape(Rectangle())
            .gesture(DragGesture(minimumDistance: 0)
                .onChanged { d in
                    if !held { held = true; vel.reset() }
                    let x = d.location.x, W = g.size.width
                    if x > W { hv = 1; ho = band(x - W) } else if x < 0 { hv = 0; ho = band(x) } else { hv = x / W; ho = 0 }
                    vel.add(ho, at: d.time.timeIntervalSinceReferenceDate)
                }
                .onEnded { _ in
                    held = false
                    value.jump(hv)
                    if reduce { over.jump(0) } else { over.release(from: ho, velocity: ho == 0 ? 0 : vel.v * 0.3, to: 0, at: DataMotion.now) }
                })
        }
        .frame(height: 36)
    }
}
