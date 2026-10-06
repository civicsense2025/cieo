import SwiftUI
import Cieo

public struct RecallAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "recall", category: "Writing", name: "Recall flip",
        summary: "The card turns over with a small dip at the halfway point. The answer only swaps in once the question has left. Each grade button trails its edge behind it. The next interval rolls its digits forward.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = false
    @State private var tweak = true
    @State private var interval = "1d"
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap the card, then grade it") {
            VStack(spacing: 16) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12).stroke(.quaternary)
                        .background(.quaternary.opacity(0.15), in: RoundedRectangle(cornerRadius: 12))
                    Text(shown ? "The market bell at dawn" : "What opens the spring essay?")
                        .font(.system(size: 15, weight: .semibold)).multilineTextAlignment(.center).padding()
                        .id(shown).motionTransition(.swap())
                }
                .frame(maxWidth: 300, minHeight: 120)
                .rotation3DEffect(.degrees(reduce ? 0 : (shown ? 180 : 0)), axis: (x: 0, y: 1, z: 0))
                .offset(y: reduce ? 0 : 0)
                .animation(reduce ? nil : .motion(.soft), value: shown)
                .onTapGesture { withMotion(.soft, reduceMotion: reduce) { shown = true } }
                .accessibilityLabel(shown ? "Answer: The market bell at dawn" : "Question: What opens the spring essay?")
                Toggle("Trail grade edge", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
                HStack(spacing: 8) {
                    ForEach([("Again", "1d"), ("Hard", "3d"), ("Easy", "7d")], id: \.0) { label, days in
                        Button(label) {
                            withMotion(.base, reduceMotion: reduce) {
                                interval = days
                                shown = false
                            }
                        }
                        .buttonStyle(.bordered).frame(minHeight: 32)
                        .animation(reduce ? nil : .motion(.base).delay(0.06), value: interval)
                    }
                    Text("in").font(.system(size: 12.5)).foregroundStyle(.secondary)
                    Text(interval).font(.headline.monospacedDigit())
                        .id(interval).motionTransition(.swap())
                        .animation(reduce ? nil : .motion(.base), value: interval)
                }
            }
        }
    }
}
