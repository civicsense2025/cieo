import SwiftUI

/// A reaction with how many people used it.
public struct ReactionTally: Identifiable, Equatable, Hashable, Sendable {
    public let id: String
    public let emoji: String
    public let label: String
    /// How many people used this reaction.
    public var count: Int
    /// True when the current person is one of them.
    public var mine: Bool

    public init(id: String, emoji: String, label: String, count: Int, mine: Bool = false) {
        self.id = id; self.emoji = emoji; self.label = label; self.count = count; self.mine = mine
    }
}

/// Chips under a message or comment showing who reacted with what. The host owns the list;
/// `toggleReaction` computes the next one. Chips insert and leave on the base spring, counts roll, and the
/// current person's chips take the accent tint. When `onAdd` is given an add button opens a picker popover.
public struct ReactionSummary: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    private let reactions: [ReactionTally]
    private let available: [Reaction]
    private let onToggle: (String) -> Void
    private let onAdd: ((String) -> Void)?
    @State private var picking = false

    public init(_ reactions: [ReactionTally], available: [Reaction] = ReactionPicker.defaultReactions,
                onToggle: @escaping (String) -> Void, onAdd: ((String) -> Void)? = nil) {
        self.reactions = reactions
        self.available = available
        self.onToggle = onToggle
        self.onAdd = onAdd
    }

    /// Next list after the current person toggles `id`. Off decrements and drops the chip at 0; on increments,
    /// or appends a new chip (count 1, mine). Never mutates the input.
    public static func toggleReaction(_ list: [ReactionTally], id: String, emoji: String? = nil, label: String? = nil) -> [ReactionTally] {
        guard let at = list.firstIndex(where: { $0.id == id }) else {
            return list + [ReactionTally(id: id, emoji: emoji ?? id, label: label ?? id, count: 1, mine: true)]
        }
        var next = list
        if list[at].mine {
            let count = max(0, list[at].count - 1)
            if count == 0 { next.remove(at: at) } else { next[at].count = count; next[at].mine = false }
        } else {
            next[at].count += 1
            next[at].mine = true
        }
        return next
    }

    /// Spoken name of a chip: "Love, 3 people including you".
    public static func reactionName(_ r: ReactionTally) -> String {
        let count = max(0, r.count)
        if r.mine && count <= 1 { return "\(r.label), just you" }
        let people = "\(count) \(count == 1 ? "person" : "people")"
        return "\(r.label), \(people)\(r.mine ? " including you" : "")"
    }

    /// Which ids are new since the last list, and which chips just left (with their old index).
    public static func reactionDiff(_ prev: [ReactionTally], _ next: [ReactionTally]) -> (entering: [String], leaving: [(at: Int, chip: ReactionTally)]) {
        let had = Set(prev.map(\.id)), has = Set(next.map(\.id))
        return (next.filter { !had.contains($0.id) }.map(\.id),
                prev.enumerated().compactMap { has.contains($0.element.id) ? nil : (at: $0.offset, chip: $0.element) })
    }

    private func chip(_ r: ReactionTally) -> some View {
        Button { onToggle(r.id) } label: {
            HStack(spacing: metrics.tight) {
                Text(verbatim: r.emoji).font(typography.detail)
                CompactCount(r.count, hideZero: false)
            }
            .foregroundStyle(r.mine ? theme.accent : theme.foreground)
            .padding(.horizontal, metrics.medium)
            .frame(minHeight: metrics.touchTarget)
            .background(r.mine ? theme.tint : theme.surface, in: .capsule)
            .contentShape(.capsule)
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Self.reactionName(r))
        .accessibilityAddTraits(r.mine ? [.isToggle, .isSelected] : [.isToggle])
        .transition(.scale.combined(with: .opacity))
    }

    public var body: some View {
        FlowStack(spacing: metrics.compact) {
            ForEach(reactions) { chip($0) }
            if let onAdd {
                Button { picking = true } label: {
                    InlineGlyph(font: typography.detail) { icons(.add) }
                        .font(typography.detail)
                        .foregroundStyle(theme.secondary)
                        .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                        .background(theme.surface, in: .circle)
                        .contentShape(.circle)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Add a reaction")
                .popover(isPresented: $picking) {
                    ReactionPicker(reactions: available, selected: Set(reactions.filter(\.mine).map(\.id))) { id in
                        picking = false
                        onAdd(id)
                    }
                    .padding(metrics.compact)
                    .presentationCompactAdaptation(.popover)
                }
            }
        }
        .motionAnimation(.base, value: reactions)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Reactions")
    }
}

#Preview("ReactionSummary") {
    struct Demo: View {
        @State private var list = [ReactionTally(id: "like", emoji: "👍", label: "Like", count: 4, mine: true),
                                   ReactionTally(id: "love", emoji: "❤️", label: "Love", count: 2)]
        var body: some View {
            ReactionSummary(list, onToggle: { list = ReactionSummary.toggleReaction(list, id: $0) },
                            onAdd: { id in list = ReactionSummary.toggleReaction(list, id: id, emoji: ReactionPicker.defaultReactions.first { $0.id == id }?.emoji) })
                .padding()
        }
    }
    return Demo()
}
