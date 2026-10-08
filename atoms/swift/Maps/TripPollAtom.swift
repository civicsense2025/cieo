import SwiftUI
import Cieo

public struct TripPollAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "trippoll", category: "Maps", name: "Trip polls",
        summary: "Votes stack bars soft. The leader tint slides to the front-runner. Totals roll and your vote swaps to a check.")

    @State private var votes = [5, 3, 2]
    @State private var mine: Int?
    @State private var show = true
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let names = ["Ferry Building", "Lands End", "Dolores Park"]
    public init() {}
    private var total: Int { votes.reduce(0, +) }
    private var leader: Int { votes.firstIndex(of: votes.max() ?? 0) ?? 0 }

    public var body: some View {
        AtomStage(hint: "Vote, then change your mind") {
            VStack(alignment: .leading, spacing: 2) {
                Text("Where Saturday?").font(.callout.weight(.semibold)).lineSpacing(4)
                Text("3 friends voting · ends tonight").font(.caption).foregroundStyle(.secondary).lineSpacing(4)
                ForEach(names.indices, id: \.self) { i in
                    Button {
                        withMotion(.soft, reduceMotion: reduce) {
                            if mine == i { votes[i] -= 1; mine = nil }
                            else { if let m = mine { votes[m] -= 1 }; votes[i] += 1; mine = i }
                        }
                    } label: {
                        HStack(spacing: 10) {
                            Text(names[i]).font(.subheadline).lineSpacing(4)
                            Spacer()
                            if show { RollingDigits("\(votes[i])").font(.subheadline.weight(.medium)) }
                            Circle().strokeBorder(mine == i ? .green : .secondary.opacity(0.4), lineWidth: 1.5)
                                .frame(width: 22, height: 22)
                                .overlay(SwapText(mine == i ? "✓" : "", drift: 4).font(.caption2).foregroundStyle(.green))
                        }
                        .padding(10)
                        .background(
                            GeometryReader { g in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 10).fill(.secondary.opacity(0.12))
                                    RoundedRectangle(cornerRadius: 10).fill(Color.accentColor.opacity(i == leader ? 0.35 : 0))
                                        .frame(width: g.size.width * Double(votes[i]) / Double(max(1, total)))
                                        .animation(reduce ? nil : .motion(.soft).delay(Double(i) * 0.05), value: votes[i])
                                }
                            }
                        )
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("\(names[i]), \(votes[i]) votes")
                }
                HStack { Text("Leader tint slides across").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Totals", isOn: $show).labelsHidden().controlSize(.mini) }
                    .padding(.top, 8)
            }
            .padding(14).frame(maxWidth: 380)
            .background(RoundedRectangle(cornerRadius: 14).fill(.background).shadow(radius: 4, y: 1))
        }
    }
}
