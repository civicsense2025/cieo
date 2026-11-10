import SwiftUI

/// A key for a chart: a square swatch and the meaning in words, such as "Republican". Colour never stands alone.
public struct LegendItem: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let text: Text
    private let color: Color

    public init(_ text: Text, color: Color) { self.text = text; self.color = color }
    public init(_ text: LocalizedStringKey, color: Color) { self.init(Text(text), color: color) }
    @_disfavoredOverload
    public init<S: StringProtocol>(_ text: S, color: Color) { self.init(Text(text), color: color) }

    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.tight) {
            InlineGlyph { Rectangle().fill(color) }.accessibilityHidden(true)
            text
        }
        .font(typography.detail)
        .foregroundStyle(theme.secondary)
        .accessibilityElement(children: .combine)
    }
}
