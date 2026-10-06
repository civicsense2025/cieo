import SwiftUI
import Cieo

public struct DeckStackAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "deckstack", category: "Writing", name: "Deck stacker",
        summary: "Kicker, deck and headline trade places on soft springs with a short trailing edge. The search-result bar fills and inks from green to amber to red as it nears the cut.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Card: Identifiable { let id = UUID(); let kind: String; let text: String }
    @State private var cards = [
        Card(kind: "Kicker", text: "City hall"),
        Card(kind: "Headline", text: "Water bills rise 40 cents in July"),
        Card(kind: "Deck", text: "The fee hid in a footnote; low streets flood first when the pumps stop.")
    ]
    @State private var moved: Set<UUID> = []
    private let limit = 120
    public init() {}
    private var total: Int { cards.reduce(0) { $0 + $1.text.count } }
    private var barColor: Color { let p = Double(total) / Double(limit); return p < 0.6 ? .green : p < 0.85 ? .yellow : .red }

    public var body: some View {
        AtomStage(hint: "Long stacks ink the bar toward red") {
            VStack(spacing: 10) {
                VStack(spacing: 6) {
                    ForEach(cards) { c in
                        VStack(alignment: .leading, spacing: 2) {
                            Text(c.kind).font(.caption).foregroundStyle(.secondary)
                            Text(c.text).font(.callout.weight(.semibold))
                        }
                        .padding(.horizontal, 12).padding(.vertical, 8).frame(maxWidth: .infinity, alignment: .leading)
                        .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 10))
                        .overlay(alignment: .bottomLeading) {
                            if moved.contains(c.id) { RoundedRectangle(cornerRadius: 1).fill(.secondary).frame(height: 2).padding(.horizontal, 12).transition(.opacity) }
                        }
                        .id(c.id)
                    }
                }
                .frame(maxWidth: 340)
                .animation(reduce ? nil : .motion(.soft), value: cards.map(\.id))
                HStack(spacing: 8) {
                    Text("SERP").font(.caption).foregroundStyle(.secondary)
                    GeometryReader { g in
                        RoundedRectangle(cornerRadius: 3).fill(.quaternary)
                            .overlay(alignment: .leading) { RoundedRectangle(cornerRadius: 3).fill(barColor).frame(width: g.size.width * min(1, Double(total) / Double(limit))) }
                    }
                    .frame(height: 6)
                    Text("\(total)/\(limit)").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                }
                .frame(maxWidth: 340)
                .animation(reduce ? nil : .motion(.base), value: total)
                Button("Shuffle") { shuffle() }.buttonStyle(.bordered)
            }
        }
    }

    private func shuffle() {
        let before = cards.map(\.id)
        let next = cards.shuffled()
        guard !reduce else { cards = next; return }
        withAnimation(.motion(.soft)) { cards = next }
        let diff = Set(zip(before, next.map(\.id)).filter { $0.0 != $0.1 }.flatMap { [$0.0, $0.1] })
        withAnimation(.motion(.soft).delay(0.06)) { moved = diff }
        Task { try? await Task.sleep(for: .milliseconds(700)); withAnimation(.motion(.soft)) { moved = [] } }
    }
}
