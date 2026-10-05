import SwiftUI
import MotionKit

public struct StatusChipAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "statuschip", category: "Admin kit", name: "Status chip",
        summary: "One chip morphs through Draft, Scheduled, Live and Error: the background and dot colours cross-fade through weighted state colours, the label swaps (exit, then enter) and the chip width springs to the measured new label. Error grows a Retry button to its left, so the chip itself never moves; Retry goes to Scheduled and, a moment later, Live.")

    private let states: [(String, Color, CGFloat)] = [("Draft", .gray, 74), ("Scheduled", .orange, 108), ("Live", .green, 66), ("Error", .red, 74)]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Step through the states") {
            VStack(spacing: 16) {
                HStack(spacing: 8) {
                    if cur == 3 { Button("Retry", action: retry).buttonStyle(.bordered).controlSize(.small).motionTransition(.presence) }
                    HStack(spacing: 6) {
                        Circle().fill(states[cur].1).frame(width: 7, height: 7)
                        SwapText(states[cur].0).font(.footnote.weight(.medium)).frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(.horizontal, 10).frame(width: states[cur].2, height: 28).background(Capsule().fill(states[cur].1.opacity(0.18)))
                    .accessibilityElement().accessibilityLabel("Status").accessibilityValue(states[cur].0)
                }
                .frame(width: 220, alignment: .trailing).animation(reduce ? nil : .motion(.base), value: cur)
                Button("Next state") { withMotion(.base, reduceMotion: reduce) { cur = (cur + 1) % states.count } }.buttonStyle(.bordered).controlSize(.small)
            }
        }
    }

    private func retry() {
        withMotion(.base, reduceMotion: reduce) { cur = 1 }
        Task { try? await Task.sleep(for: .seconds(1.2)); withMotion(.base, reduceMotion: reduce) { cur = 2 } }
    }
}
