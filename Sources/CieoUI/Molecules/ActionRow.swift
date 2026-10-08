import SwiftUI

public struct ActionRow: View {
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
        VStack(alignment: .leading, spacing: Metrics.compact) {
            Text(title).font(.headline).accessibilityAddTraits(.isHeader)
            Text(detail).foregroundStyle(.secondary)
            Button(actionTitle, action: action).buttonStyle(ActionButtonStyle(.quiet))
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}
