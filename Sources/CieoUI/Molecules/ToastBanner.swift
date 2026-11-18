import SwiftUI

/// Individual toast banner view driven by a single `ToastQueueModel.Item`.
public struct ToastBanner: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentStrings) private var strings

    private let item: ToastQueueModel.Item
    private let onDismiss: () -> Void
    private let onAction: (() -> Void)?

    public init(item: ToastQueueModel.Item, onDismiss: @escaping () -> Void, onAction: (() -> Void)? = nil) {
        self.item = item
        self.onDismiss = onDismiss
        self.onAction = onAction
    }

    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
            InlineGlyph { icons(iconForPriority) }
                .font(typography.heading)
                .foregroundStyle(toneColor)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: metrics.tight) {
                Text(verbatim: item.title)
                    .font(typography.strongBody)
                    .foregroundStyle(theme.foreground)
                if let detail = item.detail {
                    Text(verbatim: detail)
                        .font(typography.detail)
                        .foregroundStyle(theme.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            if let actionTitle = item.actionTitle, let onAction {
                Button(action: onAction) {
                    Text(verbatim: actionTitle)
                        .font(typography.strongBody)
                        .foregroundStyle(theme.accent)
                        .frame(minHeight: metrics.touchTarget)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
            Button(action: onDismiss) {
                InlineGlyph { icons(.dismiss) }
                    .font(typography.glyph)
                    .foregroundStyle(theme.secondary)
                    .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(Text(verbatim: strings.dismissLabel))
        }
        .padding(.leading, metrics.standard)
        .padding(.trailing, metrics.compact)
        .padding(.vertical, metrics.compact)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(toneSoftColor, in: .rect(cornerRadius: metrics.corner))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
        .floatingShadow()
        .accessibilityElement(children: .contain)
    }

    private var iconForPriority: ComponentIcon {
        switch item.priority {
        case .neutral, .info: .info
        case .success: .check
        case .warning: .warning
        case .danger: .error
        }
    }

    private var toneColor: Color {
        switch item.priority {
        case .neutral: theme.foreground
        case .info: theme.info
        case .success: theme.success
        case .warning: theme.warning
        case .danger: theme.danger
        }
    }

    private var toneSoftColor: Color {
        switch item.priority {
        case .neutral: theme.surface
        case .info: theme.infoSoft
        case .success: theme.successSoft
        case .warning: theme.warningSoft
        case .danger: theme.dangerSoft
        }
    }
}
