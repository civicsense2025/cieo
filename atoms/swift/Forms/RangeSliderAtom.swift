import SwiftUI
import MotionKit

public struct RangeSliderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "range", category: "Forms", name: "Range slider",
        summary: "Each thumb follows its drag exactly and stops at the other thumb. Histogram bars inside the range ink in while the rest fade, each on its own spring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var lo = Track(80)
    @State private var hi = Track(320)
    @State private var held: Bool?
    private let top = 500.0, step = 10.0
    private let heights: [Double] = [3, 6, 10, 14, 18, 22, 25, 24, 20, 17, 14, 12, 10, 9, 7, 6, 5, 4, 3, 2]
    public init() {}

    private func now() -> Double { Date().timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage {
            VStack(spacing: 6) {
                HStack {
                    Text("Price").font(.footnote.weight(.semibold))
                    Spacer()
                    Text("$\(Int(lo.target)) – $\(Int(hi.target))").font(.footnote.monospacedDigit()).foregroundStyle(.secondary)
                }
                HStack(alignment: .bottom, spacing: 3) {
                    ForEach(heights.indices, id: \.self) { i in
                        let c = (Double(i) + 0.5) / Double(heights.count) * top
                        let on = c >= lo.target && c <= hi.target
                        UnevenRoundedRectangle(topLeadingRadius: 2, topTrailingRadius: 2)
                            .fill(on ? Color.primary : Color.primary.opacity(0.1))
                            .frame(height: heights[i] * 2.2).motion(.base, value: on)
                    }
                }
                .frame(height: 60, alignment: .bottom).padding(.horizontal, 9).accessibilityHidden(true)
                GeometryReader { g in
                    let w = g.size.width - 18
                    TimelineView(.animation(paused: reduce && held == nil)) { ctx in
                        let t = ctx.date.timeIntervalSinceReferenceDate
                        let a = 9 + lo.value(at: t) / top * w, b = 9 + hi.value(at: t) / top * w
                        ZStack(alignment: .leading) {
                            Capsule().fill(Color.primary.opacity(0.08)).frame(height: 4).padding(.horizontal, 9)
                            Rectangle().fill(.primary).frame(width: max(0, b - a), height: 4).offset(x: a)
                            thumb("Minimum price", value: lo.target, x: a) { lo.set(max(0, lo.target - step), at: now()) } up: { lo.set(min(hi.target - step, lo.target + step), at: now()) }
                            thumb("Maximum price", value: hi.target, x: b) { hi.set(max(lo.target + step, hi.target - step), at: now()) } up: { hi.set(min(top, hi.target + step), at: now()) }
                        }
                    }
                    .contentShape(Rectangle())
                    .gesture(DragGesture(minimumDistance: 0)
                        .onChanged { g2 in
                            let v = min(top, max(0, ((g2.location.x - 9) / w * top / step).rounded() * step))
                            if held == nil {
                                held = abs(v - lo.target) <= abs(v - hi.target)
                                apply(v, spring: true)
                            } else {
                                apply(v, spring: false)
                            }
                        }
                        .onEnded { _ in held = nil })
                }
                .frame(height: 28)
            }
            .frame(maxWidth: 520)
        }
    }

    private func apply(_ v: Double, spring: Bool) {
        let isLo = held ?? true
        let to = isLo ? min(v, hi.target - step) : max(v, lo.target + step)
        if isLo {
            if spring && !reduce { lo.set(to, at: now()) } else { lo.jump(to) }
        } else {
            if spring && !reduce { hi.set(to, at: now()) } else { hi.jump(to) }
        }
    }

    private func thumb(_ label: String, value: Double, x: Double, down: @escaping () -> Void, up: @escaping () -> Void) -> some View {
        Circle().fill(.background).overlay(Circle().strokeBorder(.primary, lineWidth: 2))
            .frame(width: 18, height: 18).position(x: x, y: 14)
            .accessibilityElement(children: .ignore).accessibilityLabel(label).accessibilityValue("$\(Int(value))")
            .accessibilityAdjustableAction { $0 == .increment ? up() : down() }
    }
}
