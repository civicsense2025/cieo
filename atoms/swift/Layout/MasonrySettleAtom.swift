import SwiftUI
import Cieo

public struct MasonrySettleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "masonry", category: "Layout", name: "Masonry settle",
        summary: "Each card drops into the shortest column. Newcomers arrive faded while the wall eases behind them.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var count = 4
    @State private var threeCol = false
    private let heights: [CGFloat] = [64, 96, 80, 112, 72, 88, 104, 68, 92]
    private let names = ["Photo", "Note", "Clip", "Chart", "Quote", "Map", "Poll", "Link", "Memo"]
    private let maxCards = 9
    public init() {}

    private var columns: [[Int]] {
        let c = threeCol ? 3 : 2
        var cols = [[Int]](repeating: [], count: c)
        var tall = [CGFloat](repeating: 0, count: c)
        for i in 0..<count {
            let k = tall.indices.min(by: { tall[$0] < tall[$1] }) ?? 0
            cols[k].append(i); tall[k] += heights[i]
        }
        return cols
    }

    public var body: some View {
        AtomStage(hint: "Add cards until the wall settles") {
            VStack(spacing: 8) {
                Text("Masonry settle").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("\(count) cards · \(count >= maxCards ? "Settled" : "Dealing")")
                    .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                HStack(alignment: .top, spacing: 8) {
                    ForEach(columns.indices, id: \.self) { c in
                        VStack(spacing: 8) {
                            ForEach(columns[c], id: \.self) { i in
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(names[i]).font(.footnote.weight(.medium))
                                    Text("tile \(i + 1)").font(.caption).foregroundStyle(.secondary)
                                }
                                .padding(.horizontal, 14).padding(.vertical, 12)
                                .frame(maxWidth: .infinity, minHeight: heights[i], alignment: .topLeading)
                                .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                                .transition(.motionSwap())
                            }
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .frame(maxWidth: 380)
                .animation(reduce ? nil : .motion(.base), value: count)
                .animation(reduce ? nil : .motion(.lazy), value: threeCol)
                HStack(spacing: 8) {
                    Button(count >= maxCards ? "Settled" : "Add card") { if count < maxCards { count += 1 } }
                        .buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                        .disabled(count >= maxCards)
                    Toggle("Three columns", isOn: $threeCol).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
            .frame(maxWidth: 560)
        }
    }
}
