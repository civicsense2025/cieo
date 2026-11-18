import SwiftUI

/// Non-optimistic human-in-the-loop approval card.
/// While `approval.status == .pending`, status text remains `"Waiting for your decision"` even while a command
/// is in flight (`approvePhase` / `denyPhase == .pending`); both buttons lock until the host resolves or errors.
public struct ApprovalRequest: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentStrings) private var strings

    private let approval: ApprovalView
    private let approvePhase: AsyncActionPhase
    private let denyPhase: AsyncActionPhase
    private let onApprove: (() -> Void)?
    private let onDeny: (() -> Void)?

    public init(
        approval: ApprovalView,
        approvePhase: AsyncActionPhase = .idle,
        denyPhase: AsyncActionPhase = .idle,
        onApprove: (() -> Void)? = nil,
        onDeny: (() -> Void)? = nil
    ) {
        self.approval = approval
        self.approvePhase = approvePhase
        self.denyPhase = denyPhase
        self.onApprove = onApprove
        self.onDeny = onDeny
    }

    public var body: some View {
        let isPending = approval.status == .pending
        let isLocked = approvePhase.isLocked || denyPhase.isLocked
        let titleText = approval.title ?? strings.approvalFallbackTitle

        VStack(alignment: .leading, spacing: metrics.medium) {
            HStack(alignment: .center, spacing: metrics.compact) {
                AgentIcon(isPending ? .asking : resolvedIcon, size: metrics.ring)
                Heading(
                    Text(verbatim: titleText),
                    detail: approval.detail.map { Text(verbatim: $0) },
                    level: .heading,
                    isHeader: false
                )
            }
            StatusChip(strings.approvalWords(for: approval.status), tone: chipTone)
            if isPending {
                HStack(spacing: metrics.compact) {
                    if let onApprove {
                        ActionButton(
                            LocalizedStringKey(strings.approvalApprove),
                            isBusy: approvePhase.isLocked,
                            emphasis: .prominent,
                            sizing: .flexible,
                            action: onApprove
                        )
                        .disabled(isLocked)
                    }
                    if let onDeny {
                        ActionButton(
                            LocalizedStringKey(strings.approvalDeny),
                            isBusy: denyPhase.isLocked,
                            role: .destructive,
                            emphasis: .quiet,
                            sizing: .flexible,
                            action: onDeny
                        )
                        .disabled(isLocked)
                    }
                }
                if let errorMsg = approvePhase.failureMessage ?? denyPhase.failureMessage {
                    StatusLabel(errorMsg, icon: .error, tone: .danger)
                }
            }
        }
        .padding(metrics.standard)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(isPending ? theme.warningSoft : theme.surface, in: .rect(cornerRadius: metrics.cornerSurface))
        .componentBorder(isPending ? theme.warning : theme.border, width: metrics.hairline, cornerRadius: metrics.cornerSurface)
        .accessibilityElement(children: .contain)
    }

    private var resolvedIcon: AgentIconRole {
        switch approval.status {
        case .pending: .asking
        case .approved: .done
        case .denied: .failed
        case .expired: .blocked
        }
    }

    private var chipTone: StatusChip.Tone {
        switch approval.status {
        case .pending: .attention
        case .approved: .done
        case .denied, .expired: .danger
        }
    }
}
