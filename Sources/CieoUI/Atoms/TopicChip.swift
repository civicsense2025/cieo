import SwiftUI

/// What a frame, section or story is about: an accent dot and a topic in sentence case, such as "Permitting".
/// It replaces an uppercase eyebrow label. The headline under it never repeats it.
public struct TopicChip: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let text: Text
    private let dot: Color?

    /// `dot` overrides the accent, for a chip on a dark or photo ground where the accent would vanish.
    public init(_ text: Text, dot: Color? = nil) { self.text = text; self.dot = dot }
    public init(_ text: LocalizedStringKey, dot: Color? = nil) { self.init(Text(text), dot: dot) }
    @_disfavoredOverload
    public init<S: StringProtocol>(_ text: S, dot: Color? = nil) { self.init(Text(text), dot: dot) }

    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
            InlineGlyph { Circle().fill(dot ?? theme.accent) }.accessibilityHidden(true)
            text
        }
        .font(typography.kicker)
        .foregroundStyle(theme.foreground)
        .accessibilityElement(children: .combine)
    }
}
