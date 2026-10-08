import SwiftUI
import Cieo

public struct LivePollAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "livepoll", category: "Forms", name: "Live poll",
        summary: "A vote morphs each option into its result bar with stagger. Percentages roll up together, and the chosen row keeps its check. It ends counted and settled.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let options = [("Booking calendar", 38), ("Course player", 27), ("Job board", 21)]
    @State private var voted = -1
    @State private var total = 0
    @State private var changeable = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Options morph into result bars") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Which block should ship next?").font(.headline)
                Text(voted < 0 ? "Tap to vote · \(total) of 128 in" : "Vote counted · \(total) of 128 in · settled")
                    .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                ForEach(options.indices, id: \.self) { i in
                    Button {
                        guard voted < 0 || changeable else { return }
                        voted = i; total += 1
                    } label: {
                        HStack {
                            if voted == i {
                                Image(systemName: "checkmark").font(.caption.weight(.bold))
                            }
                            Text(options[i].0).font(.subheadline)
                            Spacer()
                            if voted >= 0 {
                                RollingDigits(pct(i)).font(.caption).monospacedDigit()
                                Text("%").font(.caption).foregroundStyle(.secondary)
                            }
                        }
                        .padding(.horizontal, 12).frame(minHeight: 40, alignment: .leading)
                        .background(
                            GeometryReader { g in
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(Color.primary.opacity(voted >= 0 ? 0.08 : 0))
                                    .frame(width: voted >= 0 ? g.size.width * Double(pct(i)) / 100 : 0)
                                    .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.06), value: voted)
                            },
                            alignment: .leading
                        )
                        .overlay(RoundedRectangle(cornerRadius: 10)
                            .stroke(voted == i ? .primary : .quaternary))
                    }
                    .buttonStyle(.plain)
                    .disabled(voted >= 0 && !changeable)
                    .accessibilityLabel("\(options[i].0)\(voted >= 0 ? ", \(pct(i)) percent" : "")")
                }
                HStack {
                    Button("Reset") { voted = -1 }
                        .buttonStyle(.bordered).controlSize(.regular)
                    Spacer()
                    Toggle("let me change my vote", isOn: $changeable)
                        .font(.caption).foregroundStyle(.secondary).nativeToggleStyle()
                }
            }
            .frame(maxWidth: 360)
        }
    }

    private func pct(_ i: Int) -> Int { options[i].1 + (voted == i ? 2 : 0) }
}
