import SwiftUI
import Cieo

public struct SliderHistogramAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sliderhist", category: "Dynamic", name: "Slider with histogram",
        summary: "The thumb follows the pointer exactly. Bars at or under the value snap to ink, the rest fade, and the number rolls. Release settles on a set terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let heights = [22, 38, 30, 52, 44, 64, 58, 74, 66, 80, 72, 60]
    @State private var value = 264.0
    @State private var snapping = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the thumb · bars ink as they enter range") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .firstTextBaseline) {
                    Text("Team size").font(.headline)
                    Spacer()
                    RollingDigits(Int(value)).font(.subheadline.weight(.semibold)).monospacedDigit()
                }
                HStack(alignment: .bottom, spacing: 4) {
                    ForEach(heights.indices, id: \.self) { i in
                        RoundedRectangle(cornerRadius: 4)
                            .fill(.primary)
                            .opacity(threshold(i) <= value ? 1 : 0.25)
                            .frame(height: CGFloat(heights[i]))
                            .animation(reduce ? nil : .motion(.snap), value: value)
                            .accessibilityHidden(true)
                    }
                }
                .frame(height: 84)
                Slider(value: $value, in: 0...500, step: snapping ? 25 : 1)
                    .tint(.primary)
                    .accessibilityLabel("Team size")
                Text("Set · \(Int(value)) of 500").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                Toggle("snap to 25", isOn: $snapping).font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.checkbox)
            }
            .frame(maxWidth: 420)
        }
        .onChange(of: snapping) { _, on in
            guard on else { return }
            value = (value / 25).rounded() * 25
        }
    }

    private func threshold(_ i: Int) -> Double { Double(heights[i]) / 80 * 500 }
}
