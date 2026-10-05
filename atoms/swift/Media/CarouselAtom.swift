import SwiftUI
import Cieo

public struct CarouselAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "carousel", category: "Media", name: "Carousel",
        summary: "Drag follows the pointer 1:1 with rubber-banding at the ends. Release projects the velocity forward to pick a slide, then settles from that velocity.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let quotes = [("“The editor gets out of the way.”", "Priya, Field Notes"), ("“We shipped the redesign in a week.”", "Jonas, North Studio"),
                          ("“Members pay without a second tool.”", "Ada, The Ledger"), ("“Our pages finally load instantly.”", "Sam, Loop Press")]
    @State private var x = Track(0, preset: .base)
    @State private var dotLo = Track(0, preset: .base)
    @State private var dotHi = Track(7, preset: .base)
    @State private var held = false
    @State private var hx = 0.0
    @State private var startX = 0.0
    @State private var vel = DataVelocity()
    @State private var current = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag, or use the arrow keys") {
            VStack(spacing: 14) {
                GeometryReader { g in
                    let step = g.size.width + 12
                    TimelineView(.motion(x)) { ctx in
                        let t = ctx.date.timeIntervalSinceReferenceDate
                        HStack(spacing: 12) {
                            ForEach(quotes.indices, id: \.self) { i in
                                VStack(alignment: .leading) {
                                    Text(quotes[i].0).font(.headline)
                                    Spacer()
                                    Text(quotes[i].1).font(.caption).foregroundStyle(.secondary)
                                }
                                .padding(18).frame(width: g.size.width, height: 140, alignment: .topLeading)
                                .background(.quaternary, in: RoundedRectangle(cornerRadius: 14))
                            }
                        }
                        .offset(x: -(held ? hx : x.value(at: t)))
                        .frame(width: g.size.width, alignment: .leading)
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .gesture(DragGesture(minimumDistance: 4)
                        .onChanged { d in
                            if !held { held = true; startX = x.value(at: DataMotion.now); vel.reset() }
                            var v = startX - d.translation.width
                            let maxV = Double(quotes.count - 1) * step
                            if v < 0 { v = DataMotion.rubber(v) }
                            if v > maxV { v = maxV + DataMotion.rubber(v - maxV) }
                            hx = v
                            vel.add(-d.translation.width, at: d.time.timeIntervalSinceReferenceDate)
                        }
                        .onEnded { _ in
                            let v = vel.v
                            go(Int(((hx + v * 0.2) / step).rounded()), step: step, velocity: v, from: hx)
                            held = false
                        })
                    .onAppear { go(0, step: step, velocity: 0, from: 0) }
                    .focusable()
                    .onKeyPress(.rightArrow) { go(current + 1, step: step, velocity: 0, from: x.value(at: DataMotion.now)); return .handled }
                    .onKeyPress(.leftArrow) { go(current - 1, step: step, velocity: 0, from: x.value(at: DataMotion.now)); return .handled }
                }
                .frame(height: 140).frame(maxWidth: 320)
                dots
            }
        }
    }

    private var dots: some View {
        TimelineView(.motion(dotLo, dotHi)) { ctx in
            let t = ctx.date.timeIntervalSinceReferenceDate
            ZStack(alignment: .leading) {
                HStack(spacing: 8) { ForEach(quotes.indices, id: \.self) { _ in Circle().fill(.quaternary).frame(width: 7, height: 7) } }
                Capsule().fill(.primary).frame(width: max(7, dotHi.value(at: t) - dotLo.value(at: t)), height: 7).offset(x: dotLo.value(at: t))
            }
        }
        .frame(width: CGFloat(quotes.count) * 15 - 8, height: 7)
        .accessibilityLabel("Slide \(current + 1) of \(quotes.count)")
    }

    private func go(_ i: Int, step: Double, velocity: Double, from: Double) {
        let prev = current
        current = max(0, min(quotes.count - 1, i))
        if reduce { x.jump(Double(current) * step) } else { x.release(from: from, velocity: velocity, to: Double(current) * step, at: DataMotion.now) }
        let lo = Double(current) * 15, hi = lo + 7, right = current >= prev
        DataMotion.retarget(&dotLo, to: lo, delay: right ? Motion.lag : 0, reduce: reduce)
        DataMotion.retarget(&dotHi, to: hi, delay: right ? 0 : Motion.lag, reduce: reduce)
    }
}
