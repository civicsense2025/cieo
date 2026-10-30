import SwiftUI

/// A section title in the display title role, with an optional trailing action such as "See all", or a
/// trailing accessory such as a count, a value or a link.
public struct SectionHeader: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let title: Text
    private let actionTitle: Text
    private let action: (() -> Void)?
    private let accessory: AnyView?

    public init(_ title: Text, actionTitle: Text = Text("See all"), action: (() -> Void)? = nil) {
        self.title = title
        self.actionTitle = actionTitle
        self.action = action
        accessory = nil
    }

    public init(_ title: LocalizedStringKey, actionTitle: LocalizedStringKey = "See all", action: (() -> Void)? = nil) {
        self.init(Text(title), actionTitle: Text(actionTitle), action: action)
    }

    /// A title with any trailing view, such as a `Link` or a menu. The accessory takes the action's type
    /// (`strongBody`) and the accent unless it sets its own, and stacks under the title when space runs out.
    public init<Accessory: View>(_ title: Text, @ViewBuilder accessory: () -> Accessory) {
        self.title = title
        actionTitle = Text(verbatim: "")
        action = nil
        self.accessory = AnyView(accessory())
    }

    public init<Accessory: View>(_ title: LocalizedStringKey, @ViewBuilder accessory: () -> Accessory) {
        self.init(Text(title), accessory: accessory)
    }

    /// A title with a quiet trailing value, such as a count ("12") or a total, in the `value` role and the
    /// secondary colour. VoiceOver reads the title, then the value.
    public init(_ title: Text, value: Text) {
        self.init(title) { SectionHeaderValue(value: value) }
    }

    public init(_ title: LocalizedStringKey, value: Text) {
        self.init(Text(title), value: value)
    }

    public var body: some View {
        // Wraps rather than truncates, so the title stays whole at accessibility sizes.
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .firstTextBaseline, spacing: metrics.standard) {
                heading
                Spacer(minLength: 0)
                trailing
            }
            VStack(alignment: .leading, spacing: metrics.compact) {
                heading
                trailing
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var heading: some View {
        title.displayText(.title).foregroundStyle(theme.foreground)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityAddTraits(.isHeader)
    }

    @ViewBuilder private var trailing: some View {
        if let accessory {
            accessory
                .font(typography.strongBody)
                .foregroundStyle(theme.accent)
                .frame(minHeight: metrics.touchTarget)
        } else if let action {
            Button(action: action) { actionTitle.font(typography.strongBody) }
                .buttonStyle(.plain)
                .foregroundStyle(theme.accent)
                .frame(minHeight: metrics.touchTarget)
                .contentShape(Rectangle())
        }
    }
}

/// A section's trailing count or total: quiet, monospaced and read after the title.
private struct SectionHeaderValue: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    let value: Text

    var body: some View {
        value.font(typography.value).foregroundStyle(theme.secondary).monospacedDigit()
    }
}
