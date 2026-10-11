import SwiftUI

/// The host owns work and cancellation; the control prevents duplicate submissions while busy.
public struct ActionButton: View {
    private let title: LocalizedStringKey
    private let isBusy: Bool
    private let role: ButtonRole?
    private let emphasis: ActionButtonStyle.Emphasis
    private let appearance: ControlAppearance
    private let readyAccessibilityValue: LocalizedStringKey
    private let busyAccessibilityValue: LocalizedStringKey
    private let action: () -> Void

    public init(_ title: LocalizedStringKey, isBusy: Bool = false, role: ButtonRole? = nil,
                emphasis: ActionButtonStyle.Emphasis = .prominent, appearance: ControlAppearance = .init(),
                readyAccessibilityValue: LocalizedStringKey = "Ready",
                busyAccessibilityValue: LocalizedStringKey = "In progress", action: @escaping () -> Void) {
        self.title = title
        self.isBusy = isBusy
        self.role = role
        self.action = action
        self.emphasis = emphasis; self.appearance = appearance
        self.readyAccessibilityValue = readyAccessibilityValue
        self.busyAccessibilityValue = busyAccessibilityValue
    }

    public var body: some View {
        Button(role: role, action: action) {
            HStack {
                if isBusy { ProgressView().controlSize(.small).accessibilityHidden(true) }
                Text(title)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(ActionButtonStyle(emphasis, appearance: appearance))
        .disabled(isBusy)
        .accessibilityValue(isBusy ? Text(busyAccessibilityValue) : Text(readyAccessibilityValue))
    }
}
