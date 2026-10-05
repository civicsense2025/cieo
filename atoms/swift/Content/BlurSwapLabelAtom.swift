import SwiftUI
import MotionKit

public struct BlurSwapLabelAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "chip", category: "Content", name: "Blur swap label",
        summary: "Outgoing text blurs up and out in 100ms. Incoming text starts after it, while the pill width springs to fit.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var index = 0
    private let labels = ["Upload files", "Uploading 3 files", "Processing", "Shared with 4 people"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap to advance") {
            Button { index = (index + 1) % labels.count } label: {
                ZStack {
                    Text(labels[index]).id(index)
                        .transition(reduce ? .identity : .basicsSwap())
                }
                .font(.body.weight(.medium))
                .foregroundStyle(.background)
                .padding(.horizontal, 22).frame(height: 44)
                .background(Capsule().fill(.primary))
                .motion(.base, value: index)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(labels[index])
        }
    }
}
