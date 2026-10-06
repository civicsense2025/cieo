import SwiftUI
import Cieo

public struct EmailPollAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "emailpoll", category: "Email", name: "Poll by email",
        summary: "Vote bars fill with a base stagger while percents fade in lazy. The pick keeps its check, the tally rolls its digits, and votes can move.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var votes = [5, 3, 2]
    @State private var mine: Int?
    @State private var allowChange = true
    public init() {}
    private let names = ["Cabin weekend", "City day", "Stay remote"]
    private var total: Int { votes.reduce(0, +) }
    private var leader: Int {
        var best = 0
        for i in votes.indices { if votes[i] > votes[best] { best = i } }
        return best
    }
    private func pct(_ i: Int) -> Int {
        let denom: Double = total > 0 ? Double(total) : 1
        return Int((Double(votes[i]) / denom * 100).rounded())
    }

    public var body: some View {
        AtomStage(hint: "Tap an option to vote") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    HStack(alignment: .firstTextBaseline) {
                        Text("Team offsite?").font(.callout.weight(.semibold))
                        Spacer()
                        HStack(spacing: 2) {
                            RollingDigits(total)
                            Text("votes")
                        }.font(.caption).foregroundStyle(.secondary)
                    }
                    ForEach(names.indices, id: \.self) { i in
                        Button { vote(i) } label: {
                            HStack(spacing: 10) {
                                Circle()
                                    .strokeBorder(mine == i ? Color.green : Color.secondary.opacity(0.4), lineWidth: 1.5)
                                    .frame(width: 22, height: 22)
                                    .overlay(SwapText(mine == i ? "✓" : "").font(.caption2).foregroundStyle(Color.green))
                                Text(names[i]).font(.caption.weight(.medium))
                                Spacer()
                                Text("\(pct(i))%").font(.caption).foregroundStyle(.secondary)
                                    .opacity(mine == nil ? 0.45 : 1)
                                    .animation(reduce ? nil : .motion(.lazy).delay(0.15 + Double(i) * 0.06), value: mine)
                            }
                            .padding(10)
                            .background(
                                GeometryReader { g in
                                    ZStack(alignment: .leading) {
                                        RoundedRectangle(cornerRadius: 10).fill(Color.secondary.opacity(0.12))
                                        RoundedRectangle(cornerRadius: 10)
                                            .fill(Color.accentColor.opacity(i == leader ? 0.35 : 0.15))
                                            .frame(width: g.size.width * Double(votes[i]) / (total > 0 ? Double(total) : 1))
                                            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.06), value: votes[i])
                                    }
                                }
                            )
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("\(names[i]), \(votes[i]) votes")
                    }
                    HStack { Text("Votes can move when allowed").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Allow change vote", isOn: $allowChange).labelsHidden().controlSize(.mini) }
                        .padding(.top, 8)
                }
                .padding(14).frame(width: 300)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
            }
        }
    }

    private func vote(_ i: Int) {
        if mine == i { return }
        if mine != nil && !allowChange { return }
        withMotion(.base, reduceMotion: reduce) {
            if let m = mine { votes[m] -= 1 }
            votes[i] += 1
            mine = i
        }
    }
}
