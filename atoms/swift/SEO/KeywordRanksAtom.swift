import SwiftUI
import MotionKit

public struct KeywordRanksAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "ranks", category: "SEO", name: "Keyword ranks",
        summary: "On refresh, rows re-sort by rank on springs, rank digits roll, and each change chip swaps to its new value in success or danger.")

    private struct Row: Identifiable { let id: String; var rank: Int; var change = 0 }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var rows = ["member pricing", "newsletter platform", "paid newsletter", "site builder", "creator store"]
        .enumerated().map { Row(id: $1, rank: [4, 7, 12, 18, 23][$0]) }
    public init() {}

    private var order: [String] { rows.sorted { $0.rank < $1.rank }.map(\.id) }

    public var body: some View {
        AtomStage(hint: "Refresh to re-rank") {
            VStack(spacing: 10) {
                VStack(spacing: 0) {
                    HStack {
                        Text("Keyword").frame(maxWidth: .infinity, alignment: .leading)
                        Text("Rank").frame(width: 50, alignment: .trailing)
                        Text("Change").frame(width: 60, alignment: .trailing)
                    }.font(.caption).foregroundStyle(.secondary).padding(.horizontal, 12).frame(height: 32)
                    Divider()
                    ZStack(alignment: .top) {
                        ForEach(rows) { row in
                            let slot = order.firstIndex(of: row.id) ?? 0
                            HStack {
                                Text(row.id).fontWeight(.medium).frame(maxWidth: .infinity, alignment: .leading)
                                RollingDigits(row.rank).frame(width: 50, alignment: .trailing)
                                chip(row.change).frame(width: 60, height: 20, alignment: .trailing)
                            }
                            .font(.footnote).padding(.horizontal, 12).frame(height: 36)
                            .offset(y: CGFloat(slot) * 36)
                            .animation(reduce ? nil : .motion(.base).delay(Double(slot) * 0.02), value: slot)
                        }
                    }.frame(height: 180, alignment: .top)
                }
                .frame(width: 340)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                Button("Refresh", action: refresh).buttonStyle(.bordered).controlSize(.small)
            }
        }
    }

    @ViewBuilder private func chip(_ d: Int) -> some View {
        ZStack {
            if d == 0 { Text("–").foregroundStyle(.secondary) }
            else { Text("\(d > 0 ? "▲" : "▼") \(abs(d))").fontWeight(.semibold).foregroundStyle(d > 0 ? Color.green : Color.red) }
        }
        .id(d).transition(reduce ? .identity : .motionSwap())
        .animation(reduce ? nil : .motion(.base), value: d)
    }

    private func refresh() {
        withMotion(.base, reduceMotion: reduce) {
            for i in rows.indices {
                let old = rows[i].rank
                let new = min(40, max(1, old + Int.random(in: -4...3)))
                rows[i].rank = new; rows[i].change = old - new
            }
        }
    }
}
