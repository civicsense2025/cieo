import SwiftUI

/// A heading with a supporting line and a glyph. The glyph comes from the host's `componentIcons`
/// through `icon:`; `symbol:` takes an SF Symbol name for callers that need one the glyph set lacks.
/// An optional action ("Try again", "Undo") sits under the text as its own button.
public struct Notice: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    private let glyph: Glyph
    private let actionTitle: LocalizedStringKey?
    private let action: (() -> Void)?

    private enum Glyph {
        case icon(ComponentIcon)
        case symbol(String)
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, icon: ComponentIcon = .info) {
        self.title = title; self.detail = detail; glyph = .icon(icon)
        actionTitle = nil; action = nil
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, symbol: String) {
        self.title = title; self.detail = detail; glyph = .symbol(symbol)
        actionTitle = nil; action = nil
    }

    /// A notice with one action under its text, such as "Try again". The host owns what the action does.
    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, icon: ComponentIcon = .info,
                actionTitle: LocalizedStringKey, action: @escaping () -> Void) {
        self.title = title; self.detail = detail; glyph = .icon(icon)
        self.actionTitle = actionTitle; self.action = action
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, symbol: String,
                actionTitle: LocalizedStringKey, action: @escaping () -> Void) {
        self.title = title; self.detail = detail; glyph = .symbol(symbol)
        self.actionTitle = actionTitle; self.action = action
    }

    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
            InlineGlyph { glyphView }
                .font(typography.heading)
                .foregroundStyle(theme.foreground)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: metrics.tight) {
                // The text reads as one element; the action stays a separate button after it.
                Heading(title, detail: detail, level: .heading, isHeader: false)
                    .accessibilityElement(children: .combine)
                if let actionTitle, let action {
                    Button(action: action) { Text(actionTitle).font(typography.strongBody) }
                        .buttonStyle(.plain)
                        .foregroundStyle(theme.accent)
                        .frame(minHeight: metrics.touchTarget)
                        .contentShape(Rectangle())
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        // Without an action the notice reads as one element; with one, the button stays findable.
        .accessibilityElement(children: action == nil ? .combine : .contain)
    }

    @ViewBuilder
    private var glyphView: some View {
        switch glyph {
        case .icon(let icon):
            icons(icon)
        case .symbol(let symbol):
            Image(systemName: symbol) // literal-ok: caller-supplied SF Symbol name; the glyph set has no role for arbitrary symbols
        }
    }
}
