import SwiftUI
import Cieo

public struct FieldsetGroupAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fieldset", category: "Layout", name: "Fieldset grouping",
        summary: "The group height springs open with a turning chevron. An invalid group snaps its ring on.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = true
    @State private var soft = false
    @State private var mentions = true
    @State private var digest = false
    @State private var invalid = false
    @State private var valid = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Collapse the group, then validate it empty") {
            VStack(spacing: 8) {
                Text("Fieldset grouping").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text(valid ? "Group valid" : invalid ? "Needs a channel" : open ? "Open" : "Collapsed")
                    .font(.caption).foregroundStyle(.secondary)
                    .transition(.motionSwap()).id("\(valid)-\(invalid)-\(open)")
                VStack(spacing: 0) {
                    Button {
                        open.toggle()
                        if open { invalid = false }
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: "chevron.down").font(.system(size: 12, weight: .semibold))
                                .frame(width: 24, height: 24)
                                .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.12)))
                                .rotationEffect(.degrees(open ? 0 : -90))
                                .animation(reduce ? nil : .motion(.snap), value: open)
                            Text("Notifications").font(.system(size: 15, weight: .semibold))
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityValue(open ? "Expanded" : "Collapsed")
                    if open {
                        VStack(spacing: 0) {
                            Toggle("Mentions", isOn: $mentions).font(.footnote)
                                .padding(.vertical, 10)
                            Divider()
                            Toggle("Weekly digest", isOn: $digest).font(.footnote)
                                .padding(.vertical, 10)
                            Text("Pick at least one channel to continue.")
                                .font(.caption).foregroundStyle(.secondary).lineSpacing(3)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .transition(.motionSwap())
                    }
                }
                .padding(.horizontal, 16).padding(.vertical, 14)
                .frame(maxWidth: 340)
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay {
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(invalid ? Color.red : valid ? Color.green : Color.clear, lineWidth: 2)
                        .animation(reduce ? nil : .motion(.snap), value: invalid)
                        .animation(reduce ? nil : .motion(.base), value: valid)
                }
                .animation(reduce ? nil : .motion(soft ? .soft : .base), value: open)
                HStack(spacing: 8) {
                    Button(valid ? "Valid" : "Validate") { validate() }
                        .buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                        .disabled(valid)
                    Toggle("Soft height", isOn: $soft).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
            .frame(maxWidth: 560)
        }
    }

    private func validate() {
        if !open { open = true }
        if mentions || digest { invalid = false; valid = true } else { invalid = true; valid = false }
    }
}
