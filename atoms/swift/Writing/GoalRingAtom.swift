import SwiftUI
import Cieo

public struct GoalRingAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "goalring", category: "Writing", name: "Goal ring",
        summary: "A ring and its count climb to the daily target on a lazy spring, then snap-pulse and swap to Done, with Reset to start over.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var words = 0
    @State private var tweak = true
    public init() {}
    private var goal: Int { tweak ? 500 : 250 }
    private var done: Bool { words >= goal }

    public var body: some View {
        AtomStage(hint: "\(goal) words target") {
            VStack(spacing: 8) {
                HStack(spacing: 16) {
                    ZStack {
                        Circle().stroke(Color.gray.opacity(0.25), lineWidth: 8)
                        Circle().trim(from: 0, to: min(1, CGFloat(words) / CGFloat(goal)))
                            .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                    }
                    .frame(width: 76, height: 76)
                    .scaleEffect(done ? 1.1 : 1)
                    .animation(reduce ? nil : .motion(.lazy), value: words)
                    .animation(reduce ? nil : .motion(.lazy), value: tweak)
                    .animation(reduce ? nil : .motion(.snap), value: done)
                    ZStack {
                        Text("\(words)").font(.system(size: 20, weight: .semibold)).monospacedDigit().opacity(done ? 0 : 1)
                        Text("Done ✓").font(.system(size: 15, weight: .semibold)).opacity(done ? 1 : 0)
                    }
                    .frame(width: 96)
                    .animation(reduce ? nil : .motion(.base), value: done)
                }
                HStack {
                    Button("Write +125") {
                        if reduce { words = min(goal, words + 125) }
                        else { withMotion(.lazy, reduceMotion: reduce) { words = min(goal, words + 125) } }
                    }.buttonStyle(.borderedProminent).frame(minHeight: 32).disabled(done)
                    Button("Reset") {
                        if reduce { words = 0 }
                        else { withMotion(.base, reduceMotion: reduce) { words = 0 } }
                    }.buttonStyle(.bordered).frame(minHeight: 32)
                }
                Toggle("Daily goal", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
        }
    }
}
