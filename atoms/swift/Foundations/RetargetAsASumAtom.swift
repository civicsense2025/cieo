import SwiftUI
import Cieo

public struct RetargetAsASumAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "retarget", category: "Foundations", name: "Retarget as a sum",
        summary: "Each new target adds one spring from its own start time. The value stays a pure sum you can scrub or render offline.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var track = Track(0.5, preset: .soft)
    @State private var taps: [Double] = []
    private let settle = SpringPreset.soft.settleTime()
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap quickly in different places") {
            TimelineView(.animation(paused: reduce)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let live = taps.filter { t - $0 < settle }.count
                GeometryReader { g in
                    let w = g.size.width, mid = g.size.height / 2
                    ZStack {
                        Capsule().fill(.quaternary).frame(width: w * 0.84, height: 2).position(x: w / 2, y: mid)
                        Circle().fill(.primary).frame(width: 26, height: 26)
                            .position(x: w * 0.08 + track.value(at: t) * w * 0.84, y: mid)
                        Text("springs in sum: \(live)").font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                            .position(x: w / 2, y: mid + 40)
                    }
                    .contentShape(Rectangle())
                    .gesture(SpatialTapGesture().onEnded { retarget(x: $0.location.x, width: w) })
                }
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Track. Tap to move the puck.")
        }
    }

    private func retarget(x: CGFloat, width: CGFloat) {
        let to = min(1, max(0, (Double(x / width) - 0.08) / 0.84))
        if reduce {
            track.jump(to)
        } else {
            let t = Date().timeIntervalSinceReferenceDate
            track.set(to, at: t)
            taps = taps.filter { t - $0 < settle } + [t]
        }
    }
}
