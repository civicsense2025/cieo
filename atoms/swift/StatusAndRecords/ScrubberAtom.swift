import SwiftUI
import MotionKit

public struct ScrubberAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "scrubber", category: "Status and records", name: "Timeline scrubber",
        summary: "The playhead follows the pointer 1:1. The record panel above always shows the latest step on or before the playhead date: when the playhead passes a step, the panel copy swaps (exit, then enter) and the two counters roll. Release projects the throw forward by the release velocity and springs to the nearest dated step. Arrow keys step between dates.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Step { let day: Double; let short: String; let title: String; let text: String; let co: Int }
    private let span = 180.0
    private let steps = [
        Step(day: 0, short: "", title: "Nothing on record yet", text: "H-218 has not been filed. Drag the playhead forward.", co: 0),
        Step(day: 11, short: "Introduced", title: "Introduced", text: "Rep. Delgado files H-218. It is referred to committee.", co: 11),
        Step(day: 39, short: "Hearing", title: "Committee hearing", text: "Forty-one people testify. The committee advances the bill 9 to 4.", co: 14),
        Step(day: 61, short: "Amended", title: "Amended", text: "The formula moves from per-pupil to tiered by district size.", co: 16),
        Step(day: 86, short: "House", title: "Passed House", text: "The House passes the bill 71 to 29.", co: 19),
    ]
    @State private var track = Track(0, preset: .base)
    @State private var dragU: Double?
    @State private var moving = false
    public init() {}

    private func u(at t: Double) -> Double { min(1, max(0, dragU ?? track.value(at: t))) }
    private func step(for u: Double) -> Step { steps.last { $0.day <= u * span } ?? steps[0] }

    public var body: some View {
        AtomStage(hint: "Drag the playhead. It snaps on release.") {
            TimelineView(.animation(paused: !moving && dragU == nil)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let s = step(for: u(at: t))
                VStack(alignment: .leading, spacing: 12) {
                    AgCard {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Co-sponsors").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                            SwapText(s.title).font(.callout.weight(.semibold))
                            SwapText(s.text).font(.caption).frame(minHeight: 34, alignment: .topLeading)
                            HStack(spacing: 4) { RollingDigits(s.co); Text("co-sponsors ·"); RollingDigits(Int(u(at: t) * span)); Text("days since filing") }.font(.caption).foregroundStyle(.secondary)
                        }.frame(maxWidth: .infinity, alignment: .leading)
                    }
                    bar(t)
                }
            }
            .frame(maxWidth: 420)
        }
    }

    private func bar(_ t: Double) -> some View {
        GeometryReader { g in
            let w = g.size.width
            ZStack(alignment: .leading) {
                Capsule().fill(.quaternary).frame(height: 4)
                ForEach(steps.indices.dropFirst(), id: \.self) { i in
                    Circle().fill(Color.accentColor.opacity(0.6)).frame(width: 8, height: 8).offset(x: steps[i].day / span * w - 4)
                }
                Circle().fill(Color.accentColor).frame(width: 18, height: 18).shadow(radius: 2)
                    .offset(x: u(at: t) * w - 9)
                    .accessibilityElement().accessibilityLabel("Playhead").accessibilityValue(step(for: u(at: t)).title)
                    .accessibilityAdjustableAction { dir in
                        let cur = steps.lastIndex { $0.day <= u(at: Date().timeIntervalSinceReferenceDate) * span } ?? 0
                        let n = min(steps.count - 1, max(0, cur + (dir == .increment ? 1 : -1)))
                        settle(to: steps[n].day / span, velocity: 0)
                    }
            }
            .frame(height: 24).contentShape(Rectangle())
            .gesture(DragGesture(minimumDistance: 0)
                .onChanged { v in dragU = min(1, max(0, v.location.x / w)); moving = false }
                .onEnded { v in
                    let start = min(1, max(0, v.location.x / w))
                    let vel = v.velocity.width / w
                    track.jump(start)
                    dragU = nil
                    settle(to: nearest(start + vel * 0.15), velocity: vel, from: start)
                })
        }
        .frame(height: 24)
    }

    private func nearest(_ u: Double) -> Double {
        let c = min(1, max(0, u))
        return steps.map { $0.day / span }.min { abs($0 - c) < abs($1 - c) } ?? 0
    }
    private func settle(to target: Double, velocity: Double, from: Double? = nil) {
        let now = Date().timeIntervalSinceReferenceDate
        if reduce { track.jump(target); moving = false; return }
        track.release(from: from ?? track.value(at: now), velocity: velocity, to: target, preset: .base, at: now)
        moving = true
        Task { @MainActor in try? await Task.sleep(nanoseconds: 900_000_000); moving = false }
    }
}
