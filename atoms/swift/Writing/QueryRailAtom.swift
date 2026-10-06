import SwiftUI
import Cieo

public struct QueryRailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "queryrail", category: "Writing", name: "Query rail",
        summary: "The rail slides in on a calm spring. New query chips swap in one after another. Resolving one shrinks it away, then the gap closes on the same spring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let pool = ["who voted for the hike", "when does it start", "what streets flood first", "who pays the fee"]
    private struct Chip: Identifiable { let id = UUID(); let text: String; var done = false }
    @State private var chips: [Chip] = []
    @State private var railIn = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Add a query, tap a chip to resolve it") {
            VStack(spacing: 10) {
                Button("Add query") { add() }.buttonStyle(.borderedProminent).frame(maxWidth: 340, alignment: .leading)
                VStack(spacing: 6) {
                    ForEach(chips) { c in
                        if !c.done {
                            Button { resolve(c) } label: {
                                HStack { Text(c.text).font(.callout); Spacer(); Image(systemName: "checkmark.circle").foregroundStyle(.secondary) }
                                    .padding(.horizontal, 12).padding(.vertical, 9)
                                    .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 10))
                            }
                            .buttonStyle(.plain)
                            .transition(reduce ? .identity : .opacity.combined(with: .scale(scale: 0.92, anchor: .leading)))
                        }
                    }
                }
                .frame(maxWidth: 340, alignment: .leading)
                .offset(x: railIn ? 0 : -16).opacity(railIn ? 1 : 0)
                .animation(reduce ? nil : .motion(.base), value: railIn)
                .animation(reduce ? nil : .motion(.base), value: chips.map(\.done))
            }
        }
        .onAppear { if !railIn { withMotion(.base, reduceMotion: reduce) { railIn = true }; add(); add() } }
    }

    private func add() {
        guard chips.count < pool.count else { return }
        let next = Chip(text: pool[chips.count])
        if reduce { chips.append(next); return }
        withAnimation(.motion(.base).delay(Double(chips.count) * 0.04)) { chips.append(next) }
    }

    private func resolve(_ c: Chip) {
        guard let i = chips.firstIndex(where: { $0.id == c.id }) else { return }
        withMotion(.base, reduceMotion: reduce) { chips[i].done = true }
    }
}
