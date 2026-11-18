import Cieo
import SwiftUI

/// Displays an agent or run's reported state as a semantic status dot plus visible words.
/// Color never stands alone: the status words always name the state.
public struct AgentStatus: View {
    public typealias State = AgentRunStatus

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentStrings) private var strings
    @Environment(\.componentMotion) private var motionConfig

    private let status: AgentRunStatus
    private let name: Text?
    private let explicitLabel: Text?

    public init(status: AgentRunStatus, name: Text? = nil, label: Text? = nil) {
        self.status = status
        self.name = name
        self.explicitLabel = label
    }

    @_disfavoredOverload
    public init(status: AgentRunStatus, name: String? = nil, label: String? = nil) {
        self.init(
            status: status,
            name: name.map { Text(verbatim: $0) },
            label: label.map { Text(verbatim: $0) }
        )
    }

    public var body: some View {
        let resolvedLabel = explicitLabel ?? Text(verbatim: strings.statusWords(for: status))
        HStack(alignment: .center, spacing: metrics.compact) {
            Circle()
                .fill(dotColor)
                .frame(width: metrics.compact, height: metrics.compact)
                .accessibilityHidden(true)
            if let name {
                name
                    .font(typography.strongDetail)
                    .foregroundStyle(theme.foreground)
            }
            resolvedLabel
                .font(typography.detail)
                .foregroundStyle(theme.secondary)
        }
        .motionAnimation(motionConfig.selection, value: status)
        .accessibilityElement(children: .combine)
    }

    private var dotColor: Color {
        switch status {
        case .starting, .running: theme.info
        case .waiting: theme.warning
        case .completed: theme.success
        case .stopped: theme.subtle
        case .failed, .interrupted, .disconnected: theme.danger
        }
    }
}
