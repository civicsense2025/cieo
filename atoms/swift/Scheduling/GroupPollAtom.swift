import SwiftUI
import Cieo

public struct GroupPollAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "grouppoll", category: "Scheduling", name: "Group-poll tally",
        summary: "Voting morphs rows into result bars. Fills stagger down the list, counts roll, and the leader inks a success tint that holds.")

    private let names = ["Tue 9:00 AM", "Wed 2:00 PM", "Thu 11:00 AM"]
    private let base = [4, 6, 5]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var votes = [4, 6, 5]
    @State private var voted = false
    @State private var fills: [Track] = [Track(0), Track(0), Track(0)]
    @State private var lead: [Track] = [Track(0), Track(0), Track(0)]
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Vote — the leader inks green") {
            TimelineView(.motion(fills, lead)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                let total = Double(votes.reduce(0, +))
                let top = votes.indices.max(by: { votes[$0] < votes[$1] }) ?? 0
                VStack(spacing: 8) {
                    ForEach(names.indices, id: \.self) { i in
                        Button { cast(i) } label: {
                            HStack {
                                Text(names[i]).font(.system(size: 13))
                                Spacer()
                                Text("\(votes[i])").font(.system(size: 13)).monospacedDigit()
                            }
                            .padding(.horizontal, 12).frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                            .background {
                                GeometryReader { g in
                                    RoundedRectangle(cornerRadius: 10).fill(.quaternary)
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(voted && i == top ? Color.green.opacity(0.25) : .secondary.opacity(0.15))
                                        .frame(width: g.size.width * fills[i].value(at: t) / 100)
                                }
                            }
                            .overlay(RoundedRectangle(cornerRadius: 10)
                                .strokeBorder(voted && i == top ? Color.green : Color.secondary.opacity(0.25)))
                        }
                        .buttonStyle(.plain)
                        .disabled(voted)
                        .accessibilityLabel("\(names[i]), \(votes[i]) votes")
                    }
                    Text(voted ? "\(Int(total)) votes · \(names[top]) leads" : "Tap an option to vote")
                        .font(.system(size: 12)).foregroundStyle(.secondary)
                }
                .frame(width: 300)
            }
        }
    }

    private func cast(_ i: Int) {
        guard !voted else { return }
        voted = true; votes[i] += 1
        let total = Double(votes.reduce(0, +)), t = now()
        for j in votes.indices {
            if reduce { fills[j].jump(Double(votes[j]) / total * 100); lead[j].jump(j == i ? 1 : 0) }
            else {
                fills[j].set(Double(votes[j]) / total * 100, at: t + Double(j) * 0.05)
                lead[j].set(j == i ? 1 : 0, at: t + 0.1 + Double(j) * 0.05)
            }
        }
    }
}
