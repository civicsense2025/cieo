import SwiftUI
import MotionKit

public struct DonationAmountAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "donation", category: "Commerce", name: "Donation amount",
        summary: "The amount indicator stretches between chips. “Other” opens a field below on a height spring, and the button’s amount rolls digit by digit.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @FocusState private var focused: Bool
    private let chips = ["$10", "$25", "$50", "$100", "Other"]
    @State private var chip = 1
    @State private var custom = ""
    public init() {}

    private var amount: String {
        chip == 4 ? String(Int(custom) ?? 0) : String(chips[chip].dropFirst())
    }

    public var body: some View {
        AtomStage(hint: "Choose an amount, or Other") {
            VStack(alignment: .leading, spacing: 12) {
                Text("Support the newsroom").fontWeight(.semibold)
                DataSegmented(labels: chips, selection: $chip, spread: true)
                HStack(spacing: 6) {
                    Text("$").foregroundStyle(.secondary)
                    TextField("Amount", text: $custom).textFieldStyle(.plain).focused($focused).accessibilityLabel("Custom amount")
                        .onChange(of: custom) { _, v in custom = String(v.filter(\.isNumber).prefix(4)) }
                }
                .font(.subheadline).padding(.horizontal, 10).padding(.vertical, 8)
                .overlay(RoundedRectangle(cornerRadius: 9).stroke(.quaternary, lineWidth: 1.5))
                .opacity(chip == 4 ? 1 : 0).offset(y: chip == 4 ? 0 : -4)
                .frame(height: chip == 4 ? 40 : 0, alignment: .top).clipped()
                .accessibilityHidden(chip != 4)
                Button {} label: {
                    HStack(spacing: 4) { Text("Give $"); RollingDigits(amount) }
                        .fontWeight(.medium).foregroundStyle(.background)
                        .frame(maxWidth: .infinity).frame(height: 40).background(.primary, in: RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain)
            }
            .padding(16).frame(maxWidth: 320)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            .animation(reduce ? nil : .motion(.base), value: chip == 4)
        }
        .onChange(of: chip) { _, c in if c == 4 { focused = true } else { focused = false } }
    }
}
