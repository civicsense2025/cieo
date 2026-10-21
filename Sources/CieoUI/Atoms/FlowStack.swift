import SwiftUI

/// Lays items out in rows and starts a new row when the next item doesn't fit, such as a group of choice
/// chips. At large text sizes items move down a row instead of breaking their words; an item wider than
/// the row gets the row's width. Gaps are the host's `compact` step unless the caller passes one.
public struct FlowStack<Content: View>: View {
    @Environment(\.componentMetrics) private var metrics
    private let spacing: CGFloat?
    private let content: Content

    public init(spacing: CGFloat? = nil, @ViewBuilder content: () -> Content) {
        self.spacing = spacing.flatMap { $0.isFinite && $0 >= 0 ? $0 : nil }
        self.content = content()
    }

    public var body: some View {
        FlowLayout(spacing: spacing ?? metrics.compact) { content }
    }
}

/// The row-filling layout behind `FlowStack`. Public so tests and hosts can check where items land.
public struct FlowLayout: Layout {
    public let spacing: CGFloat

    public init(spacing: CGFloat) { self.spacing = max(0, spacing.isFinite ? spacing : 0) }

    /// Where each item of the given sizes goes in a row of `width`, and the total size used.
    public static func frames(for sizes: [CGSize], width: CGFloat, spacing: CGFloat) -> (frames: [CGRect], size: CGSize) {
        var frames: [CGRect] = []
        var x: CGFloat = 0, y: CGFloat = 0, rowHeight: CGFloat = 0, usedWidth: CGFloat = 0
        for size in sizes {
            let itemWidth = min(size.width, width)
            if x > 0, x + itemWidth > width {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            frames.append(CGRect(x: x, y: y, width: itemWidth, height: size.height))
            x += itemWidth + spacing
            rowHeight = max(rowHeight, size.height)
            usedWidth = max(usedWidth, x - spacing)
        }
        return (frames, CGSize(width: usedWidth, height: sizes.isEmpty ? 0 : y + rowHeight))
    }

    public func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? .infinity
        return Self.frames(for: sizes(subviews, width: width), width: width, spacing: spacing).size
    }

    public func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let placed = Self.frames(for: sizes(subviews, width: bounds.width), width: bounds.width, spacing: spacing).frames
        for (subview, frame) in zip(subviews, placed) {
            subview.place(at: CGPoint(x: bounds.minX + frame.minX, y: bounds.minY + frame.minY),
                          proposal: ProposedViewSize(width: frame.width, height: frame.height))
        }
    }

    private func sizes(_ subviews: Subviews, width: CGFloat) -> [CGSize] {
        subviews.map { subview in
            let ideal = subview.sizeThatFits(.unspecified)
            // An item wider than the row wraps its own text within the row instead.
            return ideal.width <= width ? ideal : subview.sizeThatFits(ProposedViewSize(width: width, height: nil))
        }
    }
}
