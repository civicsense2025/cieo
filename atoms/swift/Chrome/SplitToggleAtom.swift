import SwiftUI

/// Split-view toggle: 1:1 drag, spring release, pill trails edges.
public struct SplitToggleAtom: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var split: CGFloat = 0.5
    @State private var preset = "50 / 50"

    public init() {}
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Split view").font(.system(size: 15, weight: .semibold))
            Text("Drag 1:1 · release springs · ←→ nudges")
                .font(.system(size: 12.5)).foregroundStyle(.secondary).monospacedDigit()
            VStack(spacing: 8) {
                HStack(spacing: 0) {
                    Button("50 / 50") { split = 0.5; preset = "50 / 50 ✓" }
                        .frame(maxWidth: .infinity, minHeight: 32)
                    Button("70 / 30") { split = 0.7; preset = "70 / 30 ✓" }
                        .frame(maxWidth: .infinity, minHeight: 32)
                }
                .buttonStyle(.plain).font(.system(size: 13))
                GeometryReader { geo in
                    HStack(spacing: 0) {
                        Text("A").frame(width: geo.size.width * split, height: 120)
                            .background(Color.primary.opacity(0.05))
                        Rectangle().fill(Color.primary.opacity(0.28))
                            .frame(width: 4, height: 44).cornerRadius(2)
                            .frame(width: 14, height: 120)
                            .gesture(DragGesture().onChanged { v in
                                split = min(0.85, max(0.2, v.location.x / geo.size.width))
                                preset = "\(Int(split * 100)) / \(Int((1 - split) * 100))"
                            }.onEnded { _ in
                                split = abs(split - 0.5) < abs(split - 0.7) ? 0.5 : 0.7
                                preset = split < 0.6 ? "50 / 50 ✓" : "70 / 30 ✓"
                            })
                            .accessibilityLabel("Divider")
                        Text("B").frame(maxWidth: .infinity, maxHeight: 120)
                            .background(Color.primary.opacity(0.09))
                    }
                    .font(.system(size: 13))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .frame(height: 120)
                .animation(reduce ? nil : .spring(response: 0.3), value: split)
                Text(preset).font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit()
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(15)
            .frame(maxWidth: 460)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
        }
        .focusable(true)
        .onMoveCommand { dir in
            if dir == .left { split = max(0.2, split - 0.05) }
            else if dir == .right { split = min(0.85, split + 0.05) }
        }
        .onExitCommand { split = 0.5; preset = "50 / 50 ✓" }
    }
}
