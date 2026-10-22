import SwiftUI

/// A glyph and a short line of text in one tone, for an error under a field or a notice's heading.
/// The glyph is decorative; the text carries the meaning. It sits centred on the first line of text and
/// takes its size from the label's font, so it follows the text role and Dynamic Type.
public struct StatusLabel: View {
    public enum Tone: Sendable, CaseIterable { case neutral, accent, danger }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    private let text: Text
    private let icon: ComponentIcon
    private let tone: Tone
    private let font: KeyPath<ComponentTypography, Font>

    public init(_ text: Text, icon: ComponentIcon, tone: Tone = .neutral,
                font: KeyPath<ComponentTypography, Font> = \.detail) {
        self.text = text
        self.icon = icon
        self.tone = tone
        self.font = font
    }

    public init(_ text: LocalizedStringKey, icon: ComponentIcon, tone: Tone = .neutral,
                font: KeyPath<ComponentTypography, Font> = \.detail) {
        self.init(Text(text), icon: icon, tone: tone, font: font)
    }

    @_disfavoredOverload
    public init<S: StringProtocol>(_ text: S, icon: ComponentIcon, tone: Tone = .neutral,
                                   font: KeyPath<ComponentTypography, Font> = \.detail) {
        self.init(Text(text), icon: icon, tone: tone, font: font)
    }

    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
            InlineGlyph { icons(icon) }.accessibilityHidden(true)
            text.fixedSize(horizontal: false, vertical: true)
        }
        .font(typography[keyPath: font])
        .foregroundStyle(color)
        .accessibilityElement(children: .combine)
    }

    private var color: Color {
        switch tone {
        case .neutral: theme.foreground
        case .accent: theme.accent
        case .danger: theme.danger
        }
    }
}
