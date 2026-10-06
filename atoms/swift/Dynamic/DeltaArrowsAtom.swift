import SwiftUI
import Cieo

public struct DeltaArrowsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "deltaarrows", category: "Dynamic", name: "Delta arrows",
        summary: "The arrow turns through base as the chip swaps sign, the tint cross-fades success to danger, and the pill width springs to fit. The flat state holds as terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let steps = ["+2.4% today", "−1.1% today", "+0.6% today", "−3.2% today", "Flat · settled"]
    private let signs = [1, -1, 1, -1, 0]
    @State private var i = 0
    @State private var loop = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Arrow turns as the chip swaps sign") {
            VStack(spacing: 8) {
                Text("Today vs yesterday").font(.headline)
                Button {
                    if i == steps.count - 1, !loop { i = 0 }
                    else { i = (i + 1) % steps.count }
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: signs[i] == 0 ? "circle.fill" : "arrowtriangle.up.fill")
                            .font(.system(size: 12)).rotationEffect(.degrees(signs[i] < 0 ? 180 : 0))
                            .animation(reduce ? nil : .motion(.base), value: i)
                        Text(steps[i]).font(.subheadline.weight(.semibold)).monospacedDigit()
                    }
                    .padding(.horizontal, 22).frame(height: 44)
                    .foregroundStyle(.white)
                    .background(Capsule().fill(tint))
                    .animation(reduce ? nil : .motion(.base), value: i)
                }
                .buttonStyle(.plain)
                Text(i == steps.count - 1 ? "Settled · no drift" : "Step \(i + 1) of \(steps.count) · tap the chip")
                    .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                Toggle("loop", isOn: $loop).font(.caption).foregroundStyle(.secondary).toggleStyle(.checkbox)
            }
            .frame(maxWidth: 400)
        }
    }

    private var tint: Color {
        if signs[i] > 0 { return .green }
        if signs[i] < 0 { return .red }
        return .primary
    }
}
