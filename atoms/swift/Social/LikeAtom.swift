import SwiftUI
import Cieo

public struct LikeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "like", category: "Social", name: "Like",
        summary: "The heart presses to 80% and settles back as it fills. The count rolls up on like and down on unlike, so the direction of change is visible.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var on = false
    @State private var count = 1283
    @State private var press = Track(0, preset: .snap)
    public init() {}

    public var body: some View {
        AtomStage(hint: "No particles, just a fill and a roll") {
            Button(action: toggle) {
                HStack(spacing: 8) {
                    TimelineView(.animation(paused: !press.isMoving)) { tl in
                        let p = min(1, max(0, press.value(at: tl.date.timeIntervalSinceReferenceDate)))
                        ZStack {
                            Image(systemName: "heart").foregroundStyle(on ? Color.red : .primary)
                            Image(systemName: "heart.fill").foregroundStyle(.red).opacity(on ? 1 : 0)
                        }
                        .font(.title3).scaleEffect(1 - 0.2 * p).motion(.base, value: on)
                    }
                    RollingDigits(count).font(.body.weight(.semibold))
                }
                .padding(.vertical, 8).padding(.leading, 12).padding(.trailing, 14)
                .background(Capsule().fill(.quaternary).opacity(0.10))
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Like").accessibilityValue("\(count)")
            .accessibilityAddTraits(on ? .isSelected : [])
        }
    }

    private func toggle() {
        let t = Date.timeIntervalSinceReferenceDate
        if !reduce { press.jump(1); press.set(0, at: t) }
        withMotion(.base, reduceMotion: reduce) { on.toggle(); count += on ? 1 : -1 }
    }
}
