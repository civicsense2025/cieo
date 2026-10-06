import SwiftUI
import Cieo

public struct EmptyColumnAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "emptycol", category: "Layout", name: "Empty-column collapse",
        summary: "Hiding the middle column springs its width to zero while the siblings expand to fill. Refill reverses the same path.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var hidden = false
    @State private var animate = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Collapse the empty column, then refill it") {
            VStack(spacing: 8) {
                Text("Empty-column collapse").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text(hidden ? "Preview hidden · siblings expanded" : "Preview open")
                    .font(.caption).foregroundStyle(.secondary)
                    .transition(.motionSwap()).id(hidden)
                GeometryReader { g in
                    let gap: CGFloat = 8
                    let total = g.size.width
                    let share = hidden ? [total / 2, 0, total / 2] : [total * 0.3, total * 0.4 - gap, total * 0.3]
                    HStack(spacing: gap) {
                        col("Files", "Plan\nDraft", width: share[0])
                        col("Preview", "Empty — hide me", width: share[1], ghost: true)
                        col("Details", "Size\nEdited", width: share[2])
                    }
                }
                .frame(maxWidth: 560).frame(height: 170)
                .padding(14)
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .animation(reduce || !animate ? nil : .motion(.base), value: hidden)
                HStack(spacing: 8) {
                    Button(hidden ? "Refill preview" : "Hide preview") { hidden.toggle() }
                        .buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    Toggle("Animate", isOn: $animate).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
            .frame(maxWidth: 560)
        }
    }

    private func col(_ title: String, _ body: String, width: CGFloat, ghost: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.footnote.weight(.medium))
            Text(body).font(.caption).foregroundStyle(.secondary)
        }
        .padding(.horizontal, 14).padding(.vertical, 12)
        .frame(width: max(0, width), alignment: .leading).clipped()
        .opacity(ghost ? Double(min(1, max(0, width) / 60)) : 1)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
    }
}
