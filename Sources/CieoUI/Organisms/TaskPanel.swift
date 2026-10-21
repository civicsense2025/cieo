import SwiftUI

/// A progress composition with host-owned actions and state, usable for local or remote work.
public struct TaskPanel<Actions: View>: View {
    @Environment(\.componentMetrics) private var metrics
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
        VStack(alignment: .leading, spacing: metrics.standard) {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: metrics.section) { ProgressRing(value: progress); heading }
                VStack(alignment: .leading, spacing: metrics.standard) { ProgressRing(value: progress); heading }
            }
            actions.buttonStyle(ActionButtonStyle())
        }
    }

    private var heading: some View {
        Heading(title, detail: detail, level: .subtitle)
    }
}
