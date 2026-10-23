import SwiftUI

/// One reaction a person can pick.
public struct Reaction: Identifiable, Equatable, Hashable, Sendable {
    /// Stable id the host stores (never the emoji itself).
    public let id: String
    /// The emoji character shown.
    public let emoji: String
    /// Plain-words name; the spoken name of the button.
    public let label: String

    public init(id: String, emoji: String, label: String) {
        self.id = id; self.emoji = emoji; self.label = label
    }
}

/// A row of emoji buttons that reports one pick. The host owns where it sits (inline, or inside a popover
/// it presents) and what a pick means. The buttons rise in with a 30 ms stagger; under Reduce Motion they
/// are simply there.
public struct ReactionPicker: View {
    /// The default set, in the order people reach for them.
    public static let defaultReactions: [Reaction] = [
        Reaction(id: "like", emoji: "👍", label: "Like"),
        Reaction(id: "love", emoji: "❤️", label: "Love"),
        Reaction(id: "laugh", emoji: "😂", label: "Funny"),
        Reaction(id: "wow", emoji: "😮", label: "Wow"),
        Reaction(id: "sad", emoji: "😢", label: "Sad"),
        Reaction(id: "thanks", emoji: "🙏", label: "Thanks"),
    ]

    /// Gap between button entrances, in seconds.
    public static let staggerSeconds = 0.03
    /// Opacity a button starts from as it rises in.
    static let startOpacity = 0.45 // literal-ok: shared entrance contract with the web

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.renderPolicy) private var policy
    private let reactions: [Reaction]
    private let selected: Set<String>
    private let label: Text
    private let onPick: (String) -> Void
    @State private var risen = false

    /// `selected` are the ids this person already chose; those buttons read as selected.
    public init(reactions: [Reaction] = ReactionPicker.defaultReactions, selected: Set<String> = [],
                label: Text = Text("Add a reaction"), onPick: @escaping (String) -> Void) {
        self.reactions = reactions
        self.selected = selected
        self.label = label
        self.onPick = onPick
    }

    /// Index that holds the first focus: the first selected reaction, else the first.
    public static func pickerStartIndex(_ reactions: [Reaction], selected: Set<String> = []) -> Int {
        reactions.firstIndex { selected.contains($0.id) } ?? 0
    }

    private var animates: Bool { policy.allowsMotion && !reduceMotion }

    public var body: some View {
        FlowStack(spacing: metrics.tight) {
            ForEach(Array(reactions.enumerated()), id: \.element.id) { index, reaction in
                let isSelected = selected.contains(reaction.id)
                Button { onPick(reaction.id) } label: {
                    Text(verbatim: reaction.emoji)
                        .font(typography.prominentGlyph)
                        .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                        .background(isSelected ? theme.tint : Color.clear, in: .circle)
                        .contentShape(.circle)
                        .accessibilityHidden(true)
                }
                .buttonStyle(.plain)
                .opacity(risen || !animates ? 1 : Self.startOpacity)
                .offset(y: risen || !animates ? 0 : metrics.compact)
                .animation(animates ? .motion(.base).delay(Self.staggerSeconds * Double(index)) : nil, value: risen)
                .accessibilityLabel(reaction.label)
                .accessibilityAddTraits(isSelected ? [.isSelected] : [])
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(label)
        .onAppear { risen = true }
    }
}

#Preview("ReactionPicker") {
    ReactionPicker(selected: ["love"]) { _ in }.padding()
}
