import SwiftUI

/// A section title in the display title role, with an optional trailing action such as "See all".
public struct SectionHeader: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let title: Text
    private let actionTitle: Text
    private let action: (() -> Void)?

    public init(_ title: Text, actionTitle: Text = Text("See all"), action: (() -> Void)? = nil) {
        self.title = title
        self.actionTitle = actionTitle
        self.action = action
    }

    public init(_ title: LocalizedStringKey, actionTitle: LocalizedStringKey = "See all", action: (() -> Void)? = nil) {
        self.init(Text(title), actionTitle: Text(actionTitle), action: action)
    }

    public var body: some View {
        // Wraps rather than truncates, so the title stays whole at accessibility sizes.
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .firstTextBaseline, spacing: metrics.standard) {
                heading
                Spacer(minLength: 0)
                button
            }
            VStack(alignment: .leading, spacing: metrics.compact) {
                heading
                button
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var heading: some View {
        title.displayText(.title).foregroundStyle(theme.foreground)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityAddTraits(.isHeader)
    }

    @ViewBuilder private var button: some View {
        if let action {
            Button(action: action) { actionTitle.font(typography.strongBody) }
                .buttonStyle(.plain)
                .foregroundStyle(theme.accent)
                .frame(minHeight: metrics.touchTarget)
                .contentShape(Rectangle())
        }
    }
}
