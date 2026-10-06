import SwiftUI
import Cieo

public struct BreakpointMorphAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "breakpoint", category: "Layout", name: "Breakpoint morph",
        summary: "Cards retarget their slots with a stagger when the breakpoint flips, and the wall follows the tallest column.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var wide = true
    @State private var stagger = true
    private let cards = ["Home", "About", "Journal", "Shop"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Flip the breakpoint and watch the slots retarget") {
            VStack(spacing: 8) {
                Text("Breakpoint morph").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Cards retarget their slots with a stagger when the breakpoint flips.")
                    .font(.footnote).foregroundStyle(.secondary).lineSpacing(4)
                    .frame(maxWidth: 340).multilineTextAlignment(.center)
                Text(wide ? "2-col · grid" : "1-col · stacked")
                    .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                wall
                HStack(spacing: 8) {
                    Button("Narrow") { wide = false }.buttonStyle(.bordered).controlSize(.small)
                        .frame(minHeight: 32)
                    Button("Wide") { wide = true }.buttonStyle(.bordered).controlSize(.small)
                        .frame(minHeight: 32)
                    Toggle("Stagger", isOn: $stagger).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
            .frame(maxWidth: 560)
        }
    }

    private var wall: some View {
        Group {
            if wide {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                    ForEach(cards.indices, id: \.self) { tile($0) }
                }
            } else {
                VStack(spacing: 8) {
                    ForEach(cards.indices, id: \.self) { tile($0) }
                }
            }
        }
        .frame(maxWidth: 360)
        .animation(reduce ? nil : .motion(.base), value: wide)
    }

    private func tile(_ i: Int) -> some View {
        Text(cards[i]).font(.footnote.weight(.medium))
            .padding(.horizontal, 14).padding(.vertical, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
            .animation(reduce || !stagger ? nil : .motion(.base).delay(0.03 * Double(i)), value: wide)
    }
}
