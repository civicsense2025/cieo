import SwiftUI

/// Extension popover: grows from icon, snaps shut faster, danger tinted.
public struct ExtPopoverAtom: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var chosen: String? = nil

    public init() {}
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Extension popover").font(.system(size: 15, weight: .semibold))
            Text("Grows from the icon · snaps shut faster · Esc closes")
                .font(.system(size: 12.5)).foregroundStyle(.secondary)
            VStack(spacing: 8) {
                HStack { Spacer(); Button("◉") { open.toggle() }.frame(width: 36, height: 36) }
                if open {
                    VStack(spacing: 0) {
                        popRow("Block trackers", danger: false, delay: 0)
                        Divider()
                        popRow("Save to reading list", danger: false, delay: 0.025)
                        Divider()
                        popRow("Remove extension", danger: true, delay: 0.05)
                    }
                    .transition(reduce ? .opacity : .scale(scale: 0.92, anchor: .topTrailing).combined(with: .opacity))
                }
                Text(chosen.map { "“\($0)” ✓" } ?? "closed")
                    .font(.system(size: 12)).foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(15)
            .frame(maxWidth: 360)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
            .animation(reduce ? nil : .spring(response: 0.3), value: open)
        }
        .focusable(true)
        .onExitCommand { open = false }
    }

    private func popRow(_ title: String, danger: Bool, delay: Double) -> some View {
        Button { chosen = title; open = false } label: {
            Text(title).font(.system(size: 13.5))
                .frame(maxWidth: .infinity, minHeight: 40, alignment: .leading)
                .padding(.horizontal, 10)
        }
        .buttonStyle(.plain)
        .foregroundStyle(danger ? .red : .primary)
        .background(danger ? Color.red.opacity(0.12) : .clear, in: RoundedRectangle(cornerRadius: 8))
        .transition(.opacity)
        .animation(reduce ? nil : .easeOut(duration: 0.12).delay(delay), value: open)
    }
}
