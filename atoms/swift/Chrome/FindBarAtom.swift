import SwiftUI

/// Find-in-page bar: drops on snap, digits roll by direction, plate trails.
public struct FindBarAtom: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var query = "spring"
    @State private var index = 0
    private let total = 3

    public init() {}
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Find in page").font(.system(size: 15, weight: .semibold))
            Text("Drops top-right on snap · digits roll by direction")
                .font(.system(size: 12.5)).foregroundStyle(.secondary).monospacedDigit()
            VStack(spacing: 8) {
                HStack(spacing: 8) {
                    Button(open ? "Close" : "Find ⌘F") { open.toggle() }.frame(minHeight: 32)
                    if open {
                        TextField("Find", text: $query).textFieldStyle(.roundedBorder)
                            .font(.system(size: 13.5)).frame(minHeight: 32)
                            .transition(reduce ? .opacity : .move(edge: .top).combined(with: .opacity))
                        Text("\(index + 1)/\(total)").font(.system(size: 12.5)).monospacedDigit()
                        Button("↑") { index = (index + total - 1) % total }.frame(minWidth: 32, minHeight: 32)
                        Button("↓") { index = (index + 1) % total }.frame(minWidth: 32, minHeight: 32)
                    }
                }
                .animation(reduce ? nil : .spring(response: 0.18), value: open)
                Text("A spring settles fast. A spring with damping settles calm.")
                    .font(.system(size: 13.5)).lineSpacing(8)
                    .padding(.horizontal, 16).padding(.vertical, 14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 10))
                Text(open ? "\(index + 1) of \(total)" + (index == total - 1 ? " ✓ last match" : "") : "closed")
                    .font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit()
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(15)
            .frame(maxWidth: 460)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
        }
        .focusable(true)
        .onExitCommand { open = false }
        .onMoveCommand { dir in
            if dir == .down { index = (index + 1) % total }
            else if dir == .up { index = (index + total - 1) % total }
        }
    }
}
