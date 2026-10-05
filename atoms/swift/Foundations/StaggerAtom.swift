import SwiftUI
import Cieo

public struct StaggerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stagger", category: "Foundations", name: "Stagger",
        summary: "The same spring started 40ms apart per item. Order reads left to right without any keyframes.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private static let sets: [[Double]] = [[0.3, 0.55, 0.8, 0.45, 0.95, 0.6, 0.7], [0.85, 0.4, 0.25, 0.7, 0.35, 0.9, 0.5]]
    @State private var tracks = StaggerAtom.sets[0].map { Track($0) }
    @State private var k = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap to reshuffle") {
            TimelineView(.animation(paused: reduce)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                HStack(alignment: .bottom, spacing: 10) {
                    ForEach(tracks.indices, id: \.self) { i in
                        RoundedRectangle(cornerRadius: 6).fill(.primary)
                            .frame(width: 22, height: max(0, tracks[i].value(at: t) * 140))
                    }
                }
                .frame(height: 140, alignment: .bottom)
            }
            .contentShape(Rectangle())
            .onTapGesture { reshuffle() }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Seven bars")
            .accessibilityAddTraits(.isButton)
            .accessibilityAction { reshuffle() }
        }
    }

    private func reshuffle() {
        k ^= 1
        let t0 = Date().timeIntervalSinceReferenceDate
        for i in tracks.indices {
            let to = Self.sets[k][i]
            if reduce { tracks[i].jump(to) } else { tracks[i].set(to, preset: .base, at: t0 + Motion.stagger(i, of: tracks.count)) }
        }
    }
}
