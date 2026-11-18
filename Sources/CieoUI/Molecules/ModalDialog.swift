import Cieo
import SwiftUI

/// Accessible modal and destructive confirmation dialog card (`Dialog` / `AlertDialog` parity).
/// Dismissal locks automatically while `confirmPhase.isLocked` so in-flight operations cannot be orphaned.
public struct ModalDialog<Content: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentMotion) private var motionConfig

    @Binding private var isPresented: Bool
    private let title: Text
    private let message: Text?
    private let confirmTitle: LocalizedStringKey
    private let cancelTitle: LocalizedStringKey
    private let confirmRole: ButtonRole?
    private let confirmPhase: AsyncActionPhase
    private let onConfirm: () -> Void
    private let onCancel: (() -> Void)?
    private let content: Content

    public init(
        isPresented: Binding<Bool>,
        title: LocalizedStringKey,
        message: LocalizedStringKey? = nil,
        confirmTitle: LocalizedStringKey,
        cancelTitle: LocalizedStringKey = "Cancel",
        confirmRole: ButtonRole? = nil,
        confirmPhase: AsyncActionPhase = .idle,
        onConfirm: @escaping () -> Void,
        onCancel: (() -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        _isPresented = isPresented
        self.title = Text(title)
        self.message = message.map { Text($0) }
        self.confirmTitle = confirmTitle
        self.cancelTitle = cancelTitle
        self.confirmRole = confirmRole
        self.confirmPhase = confirmPhase
        self.onConfirm = onConfirm
        self.onCancel = onCancel
        self.content = content()
    }

    public var body: some View {
        if isPresented {
            VStack(alignment: .leading, spacing: metrics.standard) {
                Heading(title, detail: message, level: .subtitle)
                if Content.self != EmptyView.self {
                    content
                        .font(typography.body)
                        .foregroundStyle(theme.foreground)
                }
                if let failure = confirmPhase.failureMessage {
                    StatusLabel(failure, icon: .error, tone: .danger)
                }
                HStack(spacing: metrics.compact) {
                    ActionButton(
                        cancelTitle,
                        emphasis: .quiet,
                        sizing: .flexible,
                        action: dismissIfUnlocked
                    )
                    .disabled(confirmPhase.isLocked)

                    ActionButton(
                        confirmTitle,
                        phase: confirmPhase,
                        role: confirmRole,
                        emphasis: .prominent,
                        sizing: .flexible,
                        action: onConfirm
                    )
                }
            }
            .padding(metrics.loose)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(theme.raised, in: .rect(cornerRadius: metrics.cornerSurface))
            .componentBorder(
                confirmRole == .destructive ? theme.danger : theme.border,
                width: metrics.hairline,
                cornerRadius: metrics.cornerSurface
            )
            .floatingShadow()
            .onKeyPress(.escape) {
                guard !confirmPhase.isLocked else { return .handled }
                dismissIfUnlocked()
                return .handled
            }
            .motionAnimation(motionConfig.layout, value: confirmPhase)
            .accessibilityElement(children: .contain)
            .accessibilityAddTraits(.isModal)
        }
    }

    private func dismissIfUnlocked() {
        guard !confirmPhase.isLocked else { return }
        onCancel?()
        isPresented = false
    }
}

public extension ModalDialog where Content == EmptyView {
    init(
        isPresented: Binding<Bool>,
        title: LocalizedStringKey,
        message: LocalizedStringKey? = nil,
        confirmTitle: LocalizedStringKey,
        cancelTitle: LocalizedStringKey = "Cancel",
        confirmRole: ButtonRole? = nil,
        confirmPhase: AsyncActionPhase = .idle,
        onConfirm: @escaping () -> Void,
        onCancel: (() -> Void)? = nil
    ) {
        self.init(
            isPresented: isPresented,
            title: title,
            message: message,
            confirmTitle: confirmTitle,
            cancelTitle: cancelTitle,
            confirmRole: confirmRole,
            confirmPhase: confirmPhase,
            onConfirm: onConfirm,
            onCancel: onCancel
        ) {
            EmptyView()
        }
    }
}
