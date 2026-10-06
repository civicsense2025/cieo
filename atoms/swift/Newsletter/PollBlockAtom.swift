import SwiftUI
import Cieo

public struct PollBlockAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pollblock", category: "Newsletter", name: "Reader poll",
        summary: "A vote morphs each option into its result bar with a short stagger. Percents ride up and the chosen row keeps its check.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var voted = -1
    private let options = [("Rivers & routes", 46), ("Winter kitchens", 31), ("Maps we kept", 23)]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Vote once") {
            VStack(alignment: .leading, spacing: 8) {
                Text("What should we cover next?").font(.callout.weight(.semibold))
                Text("One vote. Results hold.").font(.caption).foregroundStyle(.secondary)
                ForEach(options.indices, id: \.self) { i in
                    Button {
                        guard voted < 0 else { return }
                        withMotion(.base, reduceMotion: reduce) { voted = i }
                    } label: {
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                if voted >= 0 {
                                    Capsule().fill(.quaternary)
                                    Capsule().fill(.quaternary.opacity(0.9))
                                        .frame(width: geo.size.width * CGFloat(share(i)) / 100)
                                        .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.05), value: voted)
                                }
                                HStack {
                                    if voted == i {
                                        Image(systemName: "checkmark").fontWeight(.bold).font(.caption)
                                    }
                                    Text(options[i].0).font(.footnote.weight(.medium))
                                    Spacer()
                                    if voted >= 0 {
                                        Text("\(share(i))%").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                                    }
                                }.padding(.horizontal, 12)
                            }
                        }
                        .frame(height: 44)
                        .overlay(Capsule().strokeBorder(voted == i ? Color.primary : Color.secondary.opacity(0.3), lineWidth: 1))
                    }
                    .buttonStyle(.plain).disabled(voted >= 0)
                }
                Button("Reset") { withMotion(.snap, reduceMotion: reduce) { voted = -1 } }
                    .font(.caption).buttonStyle(.borderless)
            }
            .padding(16).frame(width: 340)
            .background(.background, in: RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
        }
    }

    private func share(_ i: Int) -> Int {
        options[i].1 + (voted == i ? 2 : voted >= 0 ? -1 : 0)
    }
}
