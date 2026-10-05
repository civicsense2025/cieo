import SwiftUI

/// Grows its single child from zero height to its natural height as `progress` goes 0 to 1.
/// Because it is a Layout, siblings below it spring down with it on the same animation.
struct EditorHeightReveal: Layout {
    var progress: Double
    var animatableData: Double {
        get { progress }
        set { progress = newValue }
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let s = subviews.first?.sizeThatFits(proposal) ?? .zero
        return CGSize(width: s.width, height: s.height * max(0, progress))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        subviews.first?.place(at: bounds.origin, proposal: proposal)
    }
}
