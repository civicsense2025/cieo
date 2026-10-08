import SwiftUI

/// Settings form row: knob edges, helper crossfade, danger/success terminals.
public struct SettingsRowAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "settingsrow", category: "Chrome", name: "Settings Row", summary: "Settings form row: knob edges, helper crossfade, danger/success terminals.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var email = "ada@"
    @State private var enabled = false
    @State private var saved = false

    public init() {}
    private var valid: Bool {
        let parts = email.split(separator: "@", omittingEmptySubsequences: false)
        guard parts.count == 2, !parts[0].isEmpty else { return false }
        return parts[1].contains(".") && parts[1].count > 2
    }
    private var state: Int { email.isEmpty ? 0 : (valid ? 2 : 1) }
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Notification email").font(.system(size: 15, weight: .semibold))
            Text("Knob rides base edges · helper crossfades · Enter validates")
                .font(.system(size: 12.5)).foregroundStyle(.secondary)
            VStack(alignment: .leading, spacing: 8) {
                Text("Email address").font(.system(size: 13.5, weight: .semibold))
                TextField("ada@x.com", text: $email).textFieldStyle(.plain).padding(10).background(.quaternary.opacity(0.5), in: .rect(cornerRadius: 10))
                    .font(.system(size: 13.5)).frame(minHeight: 36)
                    .overlay(RoundedRectangle(cornerRadius: 8)
                        .stroke(state == 1 ? .red : (state == 2 ? .green : .clear), lineWidth: 1.5))
                Group {
                    if state == 1 { Text("Enter a valid email like ada@x.com.").foregroundStyle(.red) }
                    else if state == 2 { Text(saved ? "Saved — alerts on. ✓" : "Looks good — press Save.") }
                    else { Text("We only send security alerts.").foregroundStyle(.secondary) }
                }
                .font(.system(size: 12)).transition(.opacity).id(state * 10 + (saved ? 1 : 0))
                Toggle("Email notifications", isOn: $enabled)
                    .font(.system(size: 13.5)).frame(minHeight: 40)
                    .toggleStyle(.switch)
                Button("Save") { saved = valid }
                    .frame(maxWidth: .infinity, minHeight: 32)
                    .disabled(!valid)
            }
            .padding(15)
            .frame(maxWidth: 440)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
            .animation(reduce ? nil : .spring(response: 0.3), value: state)
            .animation(reduce ? nil : .spring(response: 0.3), value: enabled)
        }
        .focusable(true)
        .escapeKey { email = ""; saved = false }
    }
}
