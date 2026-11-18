import SwiftUI

/// Displays an agent run's authoritative status alongside optional pause, resume, and stop controls.
/// Controls never change `run.status` optimistically; status updates only when the host reports them.
public struct RunControls: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentStrings) private var strings

    private let run: RunView
    private let phase: AsyncActionPhase
    private let onPause: (() -> Void)?
    private let onResume: (() -> Void)?
    private let onStop: (() -> Void)?

    public init(
        run: RunView,
        phase: AsyncActionPhase = .idle,
        onPause: (() -> Void)? = nil,
        onResume: (() -> Void)? = nil,
        onStop: (() -> Void)? = nil
    ) {
        self.run = run
        self.phase = phase
        self.onPause = onPause
        self.onResume = onResume
        self.onStop = onStop
    }

    public var body: some View {
        let isLive = !run.status.isSettled
        VStack(alignment: .leading, spacing: metrics.compact) {
            FlowStack(spacing: metrics.compact) {
                AgentStatus(status: run.status)
                if let reason = run.reason {
                    Text(verbatim: reason)
                        .font(typography.detail)
                        .foregroundStyle(theme.secondary)
                }
                if isLive {
                    if run.status == .waiting, let onResume {
                        ActionButton(LocalizedStringKey(strings.runResume), isBusy: phase.isLocked, emphasis: .quiet, sizing: .fitted, action: onResume)
                    } else if let onPause {
                        ActionButton(LocalizedStringKey(strings.runPause), isBusy: phase.isLocked, emphasis: .quiet, sizing: .fitted, action: onPause)
                    }
                    if let onStop {
                        ActionButton(LocalizedStringKey(strings.runStop), isBusy: phase.isLocked, role: .destructive, emphasis: .quiet, sizing: .fitted, action: onStop)
                    }
                }
            }
            if let message = phase.failureMessage {
                StatusLabel(message, icon: .error, tone: .danger)
            }
        }
        .padding(metrics.medium)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(theme.surface, in: .rect(cornerRadius: metrics.corner))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(verbatim: strings.runControlsLabel))
    }
}
