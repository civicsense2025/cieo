import SwiftUI
import Cieo

public struct TimelineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "timeline", category: "Data", name: "Timeline",
        summary: "The spine fills to the current milestone first and ends at the last node, never past it. The node inks in after the lag, then its row brightens. Reaching the final milestone turns its node into a success check.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let steps = [("Jan 2026", "Private beta with 40 studios"), ("Mar 2026", "Custom domains and SSL"), ("May 2026", "Member areas and paywalls"),
                         ("Jul 2026", "Commerce blocks"), ("Sep 2026", "Public launch")]
    private let rowHeight = 52.0
    @State private var spine = Track(0, preset: .base)
    @State private var ink = Array(repeating: Track(0, preset: .base), count: 5)
    @State private var glow = Array(repeating: Track(0.4, preset: .base), count: 5)
    @State private var current = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Advance to the next milestone") {
            VStack(spacing: 16) {
                TimelineView(.motion(spine, ink, glow)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    ZStack(alignment: .topLeading) {
                        Capsule().fill(.quaternary).frame(width: 2, height: rowHeight * Double(steps.count - 1) + 8).offset(x: 7, y: 6)
                        Capsule().fill(.primary).frame(width: 2, height: max(0, spine.value(at: t) - 6)).offset(x: 7, y: 6)
                        VStack(alignment: .leading, spacing: 0) {
                            ForEach(steps.indices, id: \.self) { i in
                                let k = max(0, min(1, ink[i].value(at: t)))
                                let done = current == steps.count - 1 && i == steps.count - 1
                                ZStack(alignment: .topLeading) {
                                    Circle().fill(k > 0.5 ? (done ? Color.green : Color.primary) : Color.clear).overlay(Circle().stroke(k > 0.5 ? (done ? Color.green : Color.primary) : Color.primary.opacity(0.2), lineWidth: 2))
                                        .opacity(0.4 + 0.6 * k).frame(width: 14, height: 14).offset(x: 0, y: 7)
                                    if done {
                                        Image(systemName: "checkmark").font(.system(size: 8, weight: .bold))
                                            .foregroundStyle(.background)
                                            .frame(width: 14, height: 14).offset(x: 0, y: 7)
                                            .motionTransition(.swap(drift: 0))
                                    }
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(steps[i].0).font(.caption).foregroundStyle(.secondary)
                                        Text(steps[i].1).fontWeight(.medium)
                                    }
                                    .padding(.leading, 28).opacity(glow[i].value(at: t))
                                }
                                .frame(height: rowHeight, alignment: .topLeading)
                                .accessibilityElement(children: .combine)
                                .accessibilityValue(i <= current ? "reached" : "upcoming")
                            }
                        }
                    }
                }
                .frame(maxWidth: 340, alignment: .leading)
                Button("Next milestone") { go((current + 1) % steps.count, instant: false) }.buttonStyle(.bordered)
            }
        }
        .onAppear { go(0, instant: true) }
    }

    private func go(_ i: Int, instant: Bool) {
        current = i
        let y = Double(i) * rowHeight + 14
        DataMotion.retarget(&spine, to: y, reduce: reduce || instant)
        for j in steps.indices {
            let on = j <= i
            DataMotion.retarget(&ink[j], to: on ? 1 : 0, delay: Motion.lag * 2, reduce: reduce || instant)
            DataMotion.retarget(&glow[j], to: on ? 1 : 0.4, delay: Motion.lag * 3, reduce: reduce || instant)
        }
    }
}
