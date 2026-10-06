import SwiftUI
import Cieo

public struct CaptionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "captions", category: "Video calls", name: "Captions roll",
        summary: "Each new caption rises on base while the oldest swaps out; the speaker name swaps with it. At the end of the segment a success terminal holds the saved transcript.")

    private let lines: [(who: String, text: String)] = [
        ("Maya", "Welcome back — quick round of updates."),
        ("Theo", "Design is ready for review."),
        ("Maya", "Love it. Shipping after lunch?"),
        ("Theo", "Yes — merging right after this.")
    ]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var count = 1
    @State private var showNames = true
    public init() {}

    private var done: Bool { count >= lines.count }

    public var body: some View {
        AtomStage(hint: "Run the segment to save the transcript") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Captions roll").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Lines rise as they are spoken.").font(.system(size: 12)).foregroundStyle(.secondary)
                HStack(spacing: 8) {
                    Text("Now").font(.system(size: 12)).foregroundStyle(.secondary)
                    SwapText(lines[min(count - 1, lines.count - 1)].who).font(.system(size: 13, weight: .semibold))
                }
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(max(0, count - 2)..<count, id: \.self) { i in
                        HStack(alignment: .firstTextBaseline, spacing: 8) {
                            if showNames {
                                Text(lines[i].who).font(.system(size: 12, weight: .bold)).foregroundStyle(.green)
                            }
                            Text(lines[i].text).font(.system(size: 13.5)).foregroundStyle(.white).lineSpacing(4)
                        }
                        .id("\(i)-\(lines[i].text)")
                        .motionTransition(.presence)
                    }
                }
                .frame(maxWidth: .infinity, minHeight: 96, alignment: .leading)
                .padding(12).background(RoundedRectangle(cornerRadius: 12).fill(Color(white: 0.06)))
                .animation(reduce ? nil : .motion(.base), value: count)
                HStack {
                    if done {
                        Text("✓ Saved to transcript").font(.system(size: 12.5, weight: .semibold))
                            .foregroundStyle(.green).padding(.horizontal, 10).padding(.vertical, 5)
                            .background(Capsule().fill(.green.opacity(0.12)))
                            .motionTransition(.swap(drift: 0))
                    }
                    Spacer()
                    Button(done ? "Replay" : "Next line") {
                        withMotion(.base, reduceMotion: reduce) {
                            count = done ? 1 : count + 1
                        }
                    }
                    .buttonStyle(.bordered).controlSize(.small)
                }
                Toggle("Speaker names", isOn: $showNames)
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .padding(14)
        }
    }
}
