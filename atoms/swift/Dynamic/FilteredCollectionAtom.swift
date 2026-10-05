import SwiftUI
import MotionKit

public struct FilteredCollectionAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "facets", category: "Dynamic", name: "Filtered collection",
        summary: "Cards that leave the filter blur out in place. Cards that stay spring to their new grid slot, staggered by slot, and the grid height follows.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let cards = [("Essays", "A smaller homepage"), ("Photos", "Harbor, 6am"), ("Notes", "Fixing the font flash"), ("Essays", "On member pricing"),
                         ("Photos", "Fog bank"), ("Notes", "Three CSS habits"), ("Essays", "Why we sunset comments"), ("Photos", "Concrete stair")]
    private let filters = ["All", "Essays", "Notes", "Photos"]
    @State private var filter = 0
    @State private var slots = Array(0..<8)

    private func visible(_ i: Int) -> Bool { filter == 0 || cards[i].0 == filters[filter] }
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a filter") {
            VStack(alignment: .leading, spacing: 12) {
                DataSegmented(labels: filters, selection: $filter)
                GeometryReader { g in
                    let cols = g.size.width > 480 ? 4 : 2
                    let cw = (g.size.width - Double(cols - 1) * 10) / Double(cols)
                    ZStack(alignment: .topLeading) {
                        ForEach(cards.indices, id: \.self) { i in
                            let on = visible(i)
                            VStack(alignment: .leading) {
                                Text(cards[i].0).font(.caption).foregroundStyle(.secondary)
                                Spacer()
                                Text(cards[i].1).font(.caption.weight(.semibold))
                            }
                            .padding(12).frame(width: cw, height: 78, alignment: .topLeading)
                            .background(.quaternary.opacity(0.6), in: RoundedRectangle(cornerRadius: 12))
                            .offset(x: Double(slots[i] % cols) * (cw + 10), y: Double(slots[i] / cols) * 88)
                            .opacity(on ? 1 : 0).blur(radius: on ? 0 : 4).allowsHitTesting(on)
                            .animation(reduce ? nil : .motion(.base).delay(Double(slots[i]) * 0.03), value: slots[i])
                            .animation(reduce ? nil : (on ? .motion(.base).delay(Motion.exit) : .motion(.snap)), value: on)
                            .accessibilityHidden(!on)
                        }
                    }
                    .frame(height: gridHeight(cols), alignment: .topLeading)
                    .animation(reduce ? nil : .motion(.base), value: filter)
                }
                .frame(height: 4 * 88 - 10 + 0, alignment: .top)
            }
            .frame(maxWidth: 620)
        }
        .onChange(of: filter) { _, _ in assignSlots() }
        .onAppear(perform: assignSlots)
    }

    private func gridHeight(_ cols: Int) -> Double {
        let n = cards.indices.filter(visible).count
        return Double((n + cols - 1) / cols) * 88 - 10
    }

    /// Visible cards take consecutive slots; hidden cards stay where they were.
    private func assignSlots() {
        var n = 0
        var next = slots
        for i in cards.indices where visible(i) { next[i] = n; n += 1 }
        slots = next
    }
}
