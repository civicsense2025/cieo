import SwiftUI
import Cieo

public struct BlurSwapLabelAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "chip", category: "Content", name: "Blur swap label",
        summary: "Outgoing text blurs up and out in 100ms. Incoming text starts after it, while the pill width springs to fit. The last state holds as a success terminal instead of wrapping; tapping it starts over.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var index = 0
    @State private var loop = false
    private let labels = ["Upload files", "Uploading 3 files", "Processing", "Shared with 4 people"]
    private var done: Bool { index == labels.count - 1 }
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap to advance") {
            VStack(spacing: 10) {
                Button {
                    if done && !loop { index = 0 } else { index = (index + 1) % labels.count }
                } label: {
                    ZStack {
                        Text(labels[index]).id(index)
                            .transition(reduce ? .identity : .basicsSwap())
                    }
                    .font(.body.weight(.medium))
                    .foregroundStyle(.background)
                    .padding(.horizontal, 22).frame(height: 44)
                    .background(Capsule().fill(done ? Color.green : Color.primary))
                    .motion(.base, value: index)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(labels[index])
                Toggle("Loop", isOn: $loop).font(.caption).foregroundStyle(.secondary).toggleStyle(.switch).controlSize(.small)
            }
        }
    }
}
