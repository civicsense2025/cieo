import SwiftUI
import Cieo

public struct LedeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "lede", category: "Writing", name: "Lede optimizer",
        summary: "Variants swap exit-then-enter while the grade bar eases on base and the score rolls with the direction of travel. Prev and Next walk the list.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var index = 0
    private let variants = [
        ("Harbor opens its doors to first-time founders.", 72),
        ("Twelve founders, one harbor, zero pitch decks.", 86),
        ("The harbor where first-time founders ship first.", 94)
    ]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Grade bar runs on base") {
            VStack(spacing: 10) {
                VStack(spacing: 2) {
                    Text(variants[index].0)
                        .font(.headline).multilineTextAlignment(.center).lineLimit(3)
                        .id(index).motionTransition(.swap())
                    Text("Variant \(index + 1) of \(variants.count)").font(.caption).foregroundStyle(.secondary)
                }
                .frame(maxWidth: 360, minHeight: 96)
                .animation(reduce ? nil : .motion(.base), value: index)
                HStack(spacing: 8) {
                    Button("Prev") { go(index - 1) }.buttonStyle(.bordered).disabled(index == 0)
                    Button("Next") { go(index + 1) }.buttonStyle(.bordered).disabled(index == variants.count - 1)
                    GeometryReader { g in
                        Capsule().fill(.green)
                            .frame(width: g.size.width * Double(variants[index].1) / 100)
                            .animation(reduce ? nil : .motion(.base), value: index)
                    }
                    .frame(height: 6)
                    Text("\(variants[index].1)").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                        .contentTransition(.numericText())
                        .animation(reduce ? nil : .motion(.base), value: index)
                        .frame(width: 30, alignment: .trailing)
                }
            }
            .frame(maxWidth: 360)
        }
    }

    private func go(_ k: Int) {
        let next = min(max(k, 0), variants.count - 1)
        guard next != index else { return }
        withMotion(.base, reduceMotion: reduce) { index = next }
    }
}
