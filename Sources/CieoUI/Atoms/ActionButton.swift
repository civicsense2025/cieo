import SwiftUI

/// The host owns work and cancellation; the control prevents duplicate submissions while busy.
public struct ActionButton: View {
    public enum Sizing: Sendable, CaseIterable { case flexible, fitted }

    @Environment(\.componentIcons) private var icons
    @Environment(\.componentStrings) private var strings
    @Environment(\.componentMotion) private var motionConfig

    private let title: LocalizedStringKey?
    private let isBusy: Bool
    private let phase: AsyncActionPhase?
    private let role: ButtonRole?
    private let emphasis: ActionButtonStyle.Emphasis
    private let sizing: Sizing
    private let appearance: ControlAppearance?
    private let readyAccessibilityValue: LocalizedStringKey?
    private let busyAccessibilityValue: LocalizedStringKey?
    private let action: () -> Void
    private let customIcon: AnyView?
    private let customLabel: AnyView?

    public init(
        _ title: LocalizedStringKey,
        isBusy: Bool = false,
        role: ButtonRole? = nil,
        emphasis: ActionButtonStyle.Emphasis = .prominent,
        sizing: Sizing = .flexible,
        appearance: ControlAppearance? = nil,
        readyAccessibilityValue: LocalizedStringKey = "Ready",
        busyAccessibilityValue: LocalizedStringKey = "In progress",
        action: @escaping () -> Void
    ) {
        self.title = title
        self.isBusy = isBusy
        self.phase = nil
        self.role = role
        self.emphasis = emphasis
        self.sizing = sizing
        self.appearance = appearance
        self.readyAccessibilityValue = readyAccessibilityValue
        self.busyAccessibilityValue = busyAccessibilityValue
        self.action = action
        self.customIcon = nil
        self.customLabel = nil
    }

    public init(
        _ title: LocalizedStringKey,
        phase: AsyncActionPhase,
        role: ButtonRole? = nil,
        emphasis: ActionButtonStyle.Emphasis = .prominent,
        sizing: Sizing = .flexible,
        appearance: ControlAppearance? = nil,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.isBusy = phase.isPending
        self.phase = phase
        self.role = role
        self.emphasis = emphasis
        self.sizing = sizing
        self.appearance = appearance
        self.readyAccessibilityValue = nil
        self.busyAccessibilityValue = nil
        self.action = action
        self.customIcon = nil
        self.customLabel = nil
    }

    public init<Icon: View>(
        _ title: LocalizedStringKey,
        phase: AsyncActionPhase = .idle,
        role: ButtonRole? = nil,
        emphasis: ActionButtonStyle.Emphasis = .prominent,
        sizing: Sizing = .flexible,
        appearance: ControlAppearance? = nil,
        action: @escaping () -> Void,
        @ViewBuilder icon: () -> Icon
    ) {
        self.title = title
        self.isBusy = phase.isPending
        self.phase = phase
        self.role = role
        self.emphasis = emphasis
        self.sizing = sizing
        self.appearance = appearance
        self.readyAccessibilityValue = nil
        self.busyAccessibilityValue = nil
        self.action = action
        self.customIcon = AnyView(icon())
        self.customLabel = nil
    }

    public init<Label: View>(
        phase: AsyncActionPhase = .idle,
        role: ButtonRole? = nil,
        emphasis: ActionButtonStyle.Emphasis = .prominent,
        sizing: Sizing = .flexible,
        appearance: ControlAppearance? = nil,
        action: @escaping () -> Void,
        @ViewBuilder label: () -> Label
    ) {
        self.title = nil
        self.isBusy = phase.isPending
        self.phase = phase
        self.role = role
        self.emphasis = emphasis
        self.sizing = sizing
        self.appearance = appearance
        self.readyAccessibilityValue = nil
        self.busyAccessibilityValue = nil
        self.action = action
        self.customIcon = nil
        self.customLabel = AnyView(label())
    }

    public var body: some View {
        Button(role: role, action: {
            guard !isLocked else { return }
            action()
        }) {
            labelContent
        }
        .buttonStyle(ActionButtonStyle(emphasis, appearance: appearance))
        .disabled(isLocked)
        .motionAnimation(motionConfig.press, value: phase)
        .motionHaptic(trigger: phase) { _, new in new?.haptic }
        .accessibilityValue(spokenStatus)
    }

    private var isLocked: Bool { phase?.isLocked ?? isBusy }

    private var spokenStatus: Text {
        if let phase {
            switch phase {
            case .idle, .canceled: return Text(verbatim: strings.actionReady)
            case .pending: return Text(verbatim: strings.actionInProgress)
            case .succeeded: return Text(verbatim: strings.actionCompleted)
            case .failed(let msg): return Text(verbatim: msg)
            case .uncertain(let msg): return Text(verbatim: msg.isEmpty ? strings.actionUncertain : msg)
            }
        }
        if isBusy {
            return busyAccessibilityValue.map { Text($0) } ?? Text(verbatim: strings.actionInProgress)
        }
        return readyAccessibilityValue.map { Text($0) } ?? Text(verbatim: strings.actionReady)
    }

    @ViewBuilder
    private var labelContent: some View {
        let content = HStack {
            if let phase {
                phaseGlyph(phase)
            } else if isBusy {
                ProgressView().controlSize(.small).accessibilityHidden(true)
            }
            if let customIcon {
                customIcon
            }
            if let customLabel {
                customLabel
            } else if let title {
                Text(title)
            }
        }
        if sizing == .flexible {
            content.frame(maxWidth: .infinity)
        } else {
            content.fixedSize(horizontal: true, vertical: false)
        }
    }

    @ViewBuilder
    private func phaseGlyph(_ phase: AsyncActionPhase) -> some View {
        switch phase {
        case .pending:
            ProgressView().controlSize(.small).accessibilityHidden(true)
        case .succeeded:
            InlineGlyph { icons(.check) }.accessibilityHidden(true)
        case .failed:
            InlineGlyph { icons(.error) }.accessibilityHidden(true)
        case .uncertain:
            InlineGlyph { icons(.warning) }.accessibilityHidden(true)
        case .idle, .canceled:
            EmptyView()
        }
    }
}
