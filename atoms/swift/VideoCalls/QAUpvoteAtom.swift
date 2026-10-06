import SwiftUI
import Cieo

public struct QAUpvoteAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "qaupvote", category: "Forms", name: "Live Q&A upvote",
        summary: "Voting springs each row to its new rank on base while the counts roll digits. Resolving swaps a row to answered; the last one swaps in an empty terminal.")

    private struct Item: Identifiable {
        let id: Int
        let text: String
        var votes: Int
        var done = false
    }

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var items = [
        Item(id: 0, text: "Will there be recordings?", votes: 12),
        Item(id: 1, text: "How do breakouts get assigned?", votes: 8),
        Item(id: 2, text: "Can guests join by phone?", votes: 5),
        Item(id: 3, text: "Is the recap emailed?", votes: 3)
    ]
    @State private var autoSort = true
    public init() {}

    private var ranked: [Item] {
        autoSort ? items.sorted { $0.votes > $1.votes } : items
    }

    public var body: some View {
        AtomStage(hint: "Resolve every question to close the queue") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Live Q&A").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Vote the best questions up.").font(.system(size: 12)).foregroundStyle(.secondary)
                VStack(spacing: 8) {
                    ForEach(ranked) { item in
                        HStack(spacing: 10) {
                            RollingDigits(String(format: "%2d", item.votes))
                                .font(.system(size: 13)).frame(width: 22, alignment: .trailing)
                            Text(item.text).font(.system(size: 13.5)).lineSpacing(3)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .opacity(item.done ? 0.55 : 1)
                            if item.done {
                                Text("✓ Answered").font(.system(size: 12.5, weight: .semibold))
                                    .foregroundStyle(.green).frame(width: 74)
                                    .motionTransition(.swap(drift: 0))
                            } else {
                                Button("Upvote") {
                                    withMotion(.base, reduceMotion: reduce) {
                                        items[item.id].votes += 1
                                    }
                                }
                                .buttonStyle(.bordered).controlSize(.small).frame(width: 74)
                                Button("✓") {
                                    withMotion(.base, reduceMotion: reduce) {
                                        items[item.id].done = true
                                    }
                                }
                                .buttonStyle(.bordered).controlSize(.small)
                                .accessibilityLabel("Resolve: \(item.text)")
                            }
                        }
                        .padding(8)
                        .background(RoundedRectangle(cornerRadius: 10).stroke(.quaternary))
                        .id(item.id)
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: ranked.map(\.id))
                if items.allSatisfy(\.done) {
                    Text("✓ Queue clear — great session").font(.system(size: 12.5, weight: .semibold))
                        .foregroundStyle(.green).padding(.horizontal, 10).padding(.vertical, 5)
                        .background(Capsule().fill(.green.opacity(0.12)))
                        .motionTransition(.swap(drift: 0))
                }
                Toggle("Auto-sort by votes", isOn: $autoSort)
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .padding(14)
        }
    }
}
