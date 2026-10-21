import SwiftUI

/// A heading with optional supporting text below it: the title-and-detail pair that rows, notices,
/// panels and sections share. The level picks the typography role, so a host restyles every heading
/// of that level at once.
public struct Heading: View {
    public enum Level: Sendable, CaseIterable { case title, subtitle, heading, strongHeading }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let title: Text
    private let detail: Text?
    private let level: Level

    public init(_ title: Text, detail: Text? = nil, level: Level = .heading) {
        self.title = title
        self.detail = detail
        self.level = level
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey? = nil, level: Level = .heading) {
        self.init(Text(title), detail: detail.map { Text($0) }, level: level)
    }

    @_disfavoredOverload
    public init<S: StringProtocol>(_ title: S, detail: S? = nil, level: Level = .heading) {
        self.init(Text(title), detail: detail.map { Text($0) }, level: level)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.tight) {
            title.font(font).foregroundStyle(theme.foreground)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityAddTraits(.isHeader)
            if let detail {
                detail.font(typography.detail).foregroundStyle(theme.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
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
