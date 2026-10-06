import SwiftUI
import Cieo

public struct DensitySwitchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "density", category: "Layout", name: "Grid density switch",
        summary: "Row height and gap ease on a soft spring while rows glide to their slots. The row measure rolls over.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cozy = true
    @State private var stagger = true
    private let rows = [("Invoice", "#4821"), ("Receipt", "#4822"), ("Contract", "#4823"), ("Brief", "#4824"), ("Memo", "#4825")]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch density and watch the rows glide") {
            VStack(spacing: 8) {
                Text("Grid density switch").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Row height and gap ease softly while rows glide to their slots.")
                    .font(.footnote).foregroundStyle(.secondary).lineSpacing(4)
                    .frame(maxWidth: 340).multilineTextAlignment(.center)
                Text("row \(cozy ? 56 : 40)px · \(cozy ? "Comfortable" : "Compact")")
                    .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                    .animation(reduce ? nil : .motion(.base), value: cozy)
                VStack(spacing: cozy ? 8 : 4) {
                    ForEach(rows.indices, id: \.self) { i in
                        HStack(spacing: 10) {
                            RoundedRectangle(cornerRadius: 3).fill(Color.primary.opacity(0.2))
                                .frame(width: 10, height: 10)
                                .frame(width: 24, height: 24)
                            Text(rows[i].0).font(.footnote.weight(.medium)).frame(maxWidth: .infinity, alignment: .leading)
                            Text(rows[i].1).font(.caption).foregroundStyle(.secondary).monospacedDigit()
                        }
                        .padding(.horizontal, 12)
                        .frame(height: cozy ? 56 : 40, alignment: .center)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                        .animation(reduce || !stagger ? nil : .motion(.base).delay(0.03 * Double(i)), value: cozy)
                    }
                }
                .frame(maxWidth: 360)
                .animation(reduce ? nil : .motion(.soft), value: cozy)
                HStack(spacing: 8) {
                    Button("Comfortable") { cozy = true }.buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    Button("Compact") { cozy = false }.buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    Toggle("Stagger", isOn: $stagger).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
            .frame(maxWidth: 560)
        }
    }
}
