import SwiftUI
import Cieo

public struct HeadlineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "headline", category: "Writing", name: "Headline tester",
        summary: "Each headline swaps out before the next one swaps in. The winner plate stretches open leading edge first. The click rate rolls over like digits.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let variants = [("City hall hid the fee hike in a footnote", 12), ("Your water bill is going up. Here is why", 34), ("The 40-cent charge nobody voted on", 58)]
    @State private var index = 0
    @State private var plateTop = 0.0
    @State private var plateBottom = 0.0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Try the next variant, then test the winner") {
            VStack(spacing: 10) {
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 10).fill(.green.opacity(0.14))
                        .frame(height: max(0, plateBottom - plateTop)).offset(y: plateTop)
                    Text(variants[index].0).font(.headline).lineLimit(3).fixedSize(horizontal: false, vertical: true)
                        .id(index).motionTransition(.swap())
                        .frame(maxWidth: .infinity, alignment: .leading).padding(12)
                    HStack { Text("CTR").foregroundStyle(.secondary); RollingDigits(variants[index].1); Text("%").foregroundStyle(.secondary); Spacer(); Text(index == 2 ? "winner" : "variant \(index + 1) of 3").foregroundStyle(.secondary) }
                        .font(.caption).padding(.horizontal, 12).padding(.bottom, 10)
                        .frame(maxHeight: .infinity, alignment: .bottom)
                }
                .frame(maxWidth: 340).frame(height: 120)
                .animation(reduce ? nil : .motion(.base), value: index)
                HStack {
                    Button("Next variant") { withMotion(.base, reduceMotion: reduce) { index = (index + 1) % variants.count } }
                        .buttonStyle(.bordered)
                    Button("Test winner") { pickWinner() }.buttonStyle(.borderedProminent)
                }
            }
            .frame(maxWidth: 340)
        }
    }

    /// The plate's leading edge moves first and its trailing edge follows after the lag.
    private func pickWinner() {
        withMotion(.base, reduceMotion: reduce) { index = 2 }
        guard !reduce else { plateTop = 0; plateBottom = 120; return }
        plateTop = 120; plateBottom = 120
        withAnimation(.motion(.base)) { plateTop = 0 }
        withAnimation(.motion(.base).delay(Motion.lag)) { plateBottom = 120 }
    }
}
