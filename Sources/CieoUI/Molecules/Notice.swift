import SwiftUI

/// A heading with a supporting line and a glyph. The glyph comes from the host's `componentIcons`
/// through `icon:`; `symbol:` takes an SF Symbol name for callers that need one the glyph set lacks.
public struct Notice: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    private let glyph: Glyph

    private enum Glyph {
        case icon(ComponentIcon)
        case symbol(String)
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, icon: ComponentIcon = .info) {
        self.title = title; self.detail = detail; glyph = .icon(icon)
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, symbol: String) {
        self.title = title; self.detail = detail; glyph = .symbol(symbol)
    }

    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
            glyphView
                .font(typography.heading)
                .foregroundStyle(theme.foreground)
                .accessibilityHidden(true)
            Heading(title, detail: detail, level: .heading, isHeader: false)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
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
