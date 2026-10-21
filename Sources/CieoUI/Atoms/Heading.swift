import SwiftUI

/// A heading with optional supporting text below it: the title-and-detail pair that rows, notices,
/// panels and sections share. The level picks the typography role, so a host restyles every heading
/// of that level at once. Pass `isHeader: false` inside a row, button or toggle: there the text labels
/// the control, and VoiceOver should not announce every row as a heading.
public struct Heading: View {
    public enum Level: Sendable, CaseIterable { case title, subtitle, heading, strongHeading }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let title: Text
    private let detail: Text?
    private let level: Level
    private let isHeader: Bool

    public init(_ title: Text, detail: Text? = nil, level: Level = .heading, isHeader: Bool = true) {
        self.title = title
        self.detail = detail
        self.level = level
        self.isHeader = isHeader
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey? = nil, level: Level = .heading,
                isHeader: Bool = true) {
        self.init(Text(title), detail: detail.map { Text($0) }, level: level, isHeader: isHeader)
    }

    @_disfavoredOverload
    public init<S: StringProtocol>(_ title: S, detail: S? = nil, level: Level = .heading, isHeader: Bool = true) {
        self.init(Text(title), detail: detail.map { Text($0) }, level: level, isHeader: isHeader)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.tight) {
            title.font(font).foregroundStyle(theme.foreground)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityAddTraits(Self.traits(isHeader: isHeader))
            if let detail {
                detail.font(typography.detail).foregroundStyle(theme.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    /// The traits the title carries: a heading on its own, nothing extra inside a control or row.
    public static func traits(isHeader: Bool) -> AccessibilityTraits {
        isHeader ? .isHeader : []
    }

    private var font: Font {
        switch level {
        case .title: typography.title
        case .subtitle: typography.subtitle
        case .heading: typography.heading
        case .strongHeading: typography.strongHeading
        }
    }
}
