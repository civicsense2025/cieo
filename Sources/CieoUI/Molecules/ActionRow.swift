import SwiftUI

public struct ActionRow: View {
    @Environment(\.componentMetrics) private var metrics
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    private let actionTitle: LocalizedStringKey
    private let action: () -> Void

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey,
                actionTitle: LocalizedStringKey, action: @escaping () -> Void)
    {
        self.title = title; self.detail = detail; self.actionTitle = actionTitle; self.action = action
    }

    public var body: some View {
        // A vertical arrangement stays readable at accessibility text sizes and narrow widths.
        VStack(alignment: .leading, spacing: metrics.compact) {
            Heading(title, detail: detail, level: .heading)
            Button(actionTitle, action: action).buttonStyle(ActionButtonStyle(.quiet))
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}
