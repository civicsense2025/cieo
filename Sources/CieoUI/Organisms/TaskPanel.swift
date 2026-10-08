import SwiftUI

/// A progress composition with host-owned actions and state, usable for local or remote work.
public struct TaskPanel<Actions: View>: View {
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    private let progress: Double
    private let actions: Actions

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, progress: Double, @ViewBuilder actions: () -> Actions) {
        self.title = title
        self.detail = detail
        self.progress = progress
        self.actions = actions()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: Metrics.standard) {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: Metrics.section) { ProgressRing(value: progress); heading }
                VStack(alignment: .leading, spacing: Metrics.standard) { ProgressRing(value: progress); heading }
            }
            actions.buttonStyle(ActionButtonStyle())
        }
    }

    private var heading: some View {
        VStack(alignment: .leading, spacing: Metrics.compact) {
            Text(title).font(.title3.bold()).accessibilityAddTraits(.isHeader)
            Text(detail).foregroundStyle(.secondary)
        }
    }
}
