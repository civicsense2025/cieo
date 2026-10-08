import SwiftUI

/// The host owns work and cancellation; the control prevents duplicate submissions while busy.
public struct ActionButton: View {
    private let title: LocalizedStringKey
    private let isBusy: Bool
    private let role: ButtonRole?
    private let action: () -> Void

    public init(_ title: LocalizedStringKey, isBusy: Bool = false, role: ButtonRole? = nil, action: @escaping () -> Void) {
        self.title = title
        self.isBusy = isBusy
        self.role = role
        self.action = action
    }

    public var body: some View {
        Button(role: role, action: action) {
            HStack {
                if isBusy { ProgressView().controlSize(.small).accessibilityHidden(true) }
                Text(title)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(ActionButtonStyle())
        .disabled(isBusy)
        .accessibilityValue(isBusy ? Text("In progress") : Text("Ready"))
    }
}
