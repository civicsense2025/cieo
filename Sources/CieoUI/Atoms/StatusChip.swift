import SwiftUI

/// A small rounded label that says where something stands: "Open", "In progress", "Done". It is sized to
/// its content, wraps instead of truncating at large text sizes, and is not interactive (wrap it in a
/// Button or a Menu label when it should be). Tone picks the colour from the host's theme; the title
/// carries the meaning, so the glyph is optional and decorative.
///
/// VoiceOver reads the title and nothing else, so a chip in a row reads as the status word.
public struct StatusChip: View {
    /// How the chip is coloured. Every tone reads a theme role, so a host restyles all chips at once.
    public enum Tone: Sendable, CaseIterable {
        /// Nothing special: not started, or no state worth stressing.
        case neutral
        /// In progress, selected or current.
        case active
        /// Finished or confirmed.
        case done
        /// Needs a look soon, but is not broken.
        case attention
        /// Failed, blocked or overdue.
        case danger
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    private let title: Text
    private let tone: Tone
    private let symbol: ComponentIcon?

    /// `symbol` is one of the host's component glyphs, so a host's own icon set draws it.
    public init(_ title: Text, tone: Tone = .neutral, symbol: ComponentIcon? = nil) {
        self.title = title
        self.tone = tone
        self.symbol = symbol
    }

    public init(_ title: LocalizedStringKey, tone: Tone = .neutral, symbol: ComponentIcon? = nil) {
        self.init(Text(title), tone: tone, symbol: symbol)
    }

    @_disfavoredOverload
    public init<S: StringProtocol>(_ title: S, tone: Tone = .neutral, symbol: ComponentIcon? = nil) {
        self.init(Text(title), tone: tone, symbol: symbol)
    }

    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.tight) {
            if let symbol {
                InlineGlyph { icons(symbol) }.accessibilityHidden(true)
            }
            title.fixedSize(horizontal: false, vertical: true)
        }
        .font(typography.strongDetail)
        .foregroundStyle(Self.foreground(tone, in: theme))
        .padding(.horizontal, metrics.compact)
        .padding(.vertical, metrics.tight)
        .background(Self.fill(tone, in: theme), in: .capsule)
        .motionAnimation(.snap, value: tone)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title)
    }

    /// The text and glyph colour a tone uses.
    static func foreground(_ tone: Tone, in theme: Theme) -> Color {
        switch tone {
        case .neutral: theme.foreground
        case .active: theme.accent
        case .done: theme.success
        case .attention: theme.warning
        case .danger: theme.danger
        }
    }

    /// The background a tone uses: the quiet accent for the current state, the surface for the rest.
    static func fill(_ tone: Tone, in theme: Theme) -> Color {
        tone == .active ? theme.tint : theme.surface
    }
}

#Preview("StatusChip") {
    FlowStack {
        ForEach(StatusChip.Tone.allCases, id: \.self) { tone in
            StatusChip("\(String(describing: tone).capitalized)", tone: tone, symbol: tone == .done ? .check : nil)
        }
    }
    .padding()
}
