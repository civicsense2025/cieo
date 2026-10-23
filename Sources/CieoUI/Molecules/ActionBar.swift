import SwiftUI

/// A horizontal row of action buttons under a post, such as like, reply and share. The host owns the
/// buttons; the bar lays them out and reads as one labelled group to VoiceOver.
public struct ActionBar<Content: View>: View {
    /// Where the buttons sit in the row.
    public enum Arrangement: Sendable, CaseIterable {
        /// Packed at the leading edge.
        case start
        /// Spread across the row with equal gaps.
        case spread
    }

    private let label: Text
    private let alignment: Arrangement
    private let content: Content

    /// `label` names the group for VoiceOver ("Post actions").
    public init(label: Text, alignment: Arrangement = .start, @ViewBuilder content: () -> Content) {
        self.label = label
        self.alignment = alignment
        self.content = content()
    }

    public init(_ label: LocalizedStringKey, alignment: Arrangement = .start, @ViewBuilder content: () -> Content) {
        self.init(label: Text(label), alignment: alignment, content: content)
    }

    /// Index a horizontal toolbar moves to for a key name, or nil when the key does nothing. Arrows wrap at both
    /// ends; Home and End jump. Hosts with hardware-keyboard focus handling use it to match the web.
    public static func actionBarIndex(_ key: String, current: Int, count: Int) -> Int? {
        guard count > 0 else { return nil }
        switch key {
        case "Home": return 0
        case "End": return count - 1
        case "ArrowRight":
            guard current >= 0 else { return 0 }
            return current + 1 >= count ? 0 : current + 1
        case "ArrowLeft":
            guard current >= 0 else { return count - 1 }
            return current - 1 < 0 ? count - 1 : current - 1
        default: return nil
        }
    }

    public var body: some View {
        ActionBarLayout(spread: alignment == .spread) { content }
            .frame(maxWidth: .infinity, alignment: .leading)
            .accessibilityElement(children: .contain)
            .accessibilityLabel(label)
    }
}

/// The layout behind `ActionBar`: children side by side, packed or spread across the proposed width.
struct ActionBarLayout: Layout {
    let spread: Bool

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let sizes = subviews.map { $0.sizeThatFits(.unspecified) }
        let natural = sizes.reduce(0) { $0 + $1.width }
        let width = spread ? max(proposal.width ?? natural, natural) : natural
        return CGSize(width: width, height: sizes.map(\.height).max() ?? 0)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let sizes = subviews.map { $0.sizeThatFits(.unspecified) }
        let natural = sizes.reduce(0) { $0 + $1.width }
        let gap = spread && subviews.count > 1 ? max(0, (bounds.width - natural) / CGFloat(subviews.count - 1)) : 0
        var x = bounds.minX
        for (subview, size) in zip(subviews, sizes) {
            subview.place(at: CGPoint(x: x, y: bounds.midY), anchor: .leading, proposal: ProposedViewSize(size))
            x += size.width + gap
        }
    }
}

#Preview("ActionBar") {
    ActionBar("Post actions", alignment: .spread) {
        IconButton(.share, label: "Share") {}
        IconButton(.bell, label: "Notify") {}
        IconButton(.star, label: "Save") {}
    }
    .padding()
}
