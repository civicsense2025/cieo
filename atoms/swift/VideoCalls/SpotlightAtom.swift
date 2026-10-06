import SwiftUI
import Cieo

public struct SpotlightAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "spotlight", category: "Video calls", name: "Stage spotlight",
        summary: "The active tile widens on a soft spring while the previous one shrinks on base. A ring follows the speaker and the label swaps. Once everyone has spoken, a success terminal holds.")

    private let names = ["You", "Maya", "Theo"]
    private let tints: [Color] = [.green, .orange, .blue]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var speaker = 0
    @State private var spoken: Set<Int> = [0]
    @State private var auto = false
    public init() {}

    private var done: Bool { spoken.count == names.count }

    public var body: some View {
        AtomStage(hint: "Advance the speaker; everyone speaks once to finish") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Stage spotlight").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("The speaker grows; the rest make room.").font(.system(size: 12)).foregroundStyle(.secondary)
                HStack(spacing: 6) {
                    ForEach(0..<names.count, id: \.self) { i in
                        ZStack(alignment: .bottomLeading) {
                            tints[i].opacity(0.55)
                            Text(String(names[i].prefix(1)))
                                .font(.callout.weight(.semibold)).frame(width: 40, height: 40)
                                .background(Circle().fill(.white.opacity(0.2)))
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                            Text(names[i]).font(.system(size: 12)).padding(.leading, 12).padding(.bottom, 8)
                            RoundedRectangle(cornerRadius: 10)
                                .strokeBorder(Color.green, lineWidth: 2.5)
                                .opacity(speaker == i ? 1 : 0)
                        }
                        .foregroundStyle(.white)
                        .frame(width: speaker == i ? 150 : 84, height: 134)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                }
                .frame(height: 134)
                .animation(reduce ? nil : .motion(.soft), value: speaker)
                HStack {
                    SwapText(names[speaker] + " is speaking").font(.system(size: 13))
                    Spacer()
                    Button(done ? "Start over" : "Next speaker") {
                        withMotion(.soft, reduceMotion: reduce) {
                            if done { spoken = []; speaker = 0; spoken = [0] }
                            else { speaker = (speaker + 1) % names.count; spoken.insert(speaker) }
                        }
                    }
                    .buttonStyle(.bordered).controlSize(.small)
                }
                if done {
                    Text("✓ Everyone spoke — nice round").font(.system(size: 12.5, weight: .semibold))
                        .foregroundStyle(.green).padding(.horizontal, 10).padding(.vertical, 5)
                        .background(Capsule().fill(.green.opacity(0.12)))
                        .motionTransition(.swap(drift: 0))
                }
                Toggle("Auto-advance", isOn: $auto)
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .padding(14)
        }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(2.2))
                if auto, !done {
                    withMotion(.soft, reduceMotion: reduce) {
                        speaker = (speaker + 1) % names.count; spoken.insert(speaker)
                    }
                }
            }
        }
    }
}
