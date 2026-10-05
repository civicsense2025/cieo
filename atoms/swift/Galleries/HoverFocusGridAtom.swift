import SwiftUI
import MotionKit

public struct HoverFocusGridAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-hover-focus", category: "Galleries", name: "Hover-focus grid",
        summary: "The photo under the pointer stays exactly as it is and gains a small caption. Every other photo quietly drains of colour, dims and settles back 3.5 percent, and it does so in a wave: the nearest neighbours go first, the far corner last, about 14ms per 100 pixels. Moving to another photo retargets the same springs, so nothing restarts. Leaving the grid returns everything on the slow spring, over about half a second. Click or tap pins the focus so touch screens and keyboards get the same state; Escape releases it. Use when a portfolio grid should direct attention without hiding the rest.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var focus: Int?
    @State private var pinned = false
    public init() {}
    private let cols = 4, count = 12

    public var body: some View {
        AtomStage(hint: "Hover or tap a photo to focus it; tap again to release") {
            GeometryReader { g in
                let cw = (g.size.width - 3 * 6) / 4, ch = (g.size.height - 2 * 6) / 3
                ZStack(alignment: .topLeading) {
                    ForEach(0..<count, id: \.self) { i in
                        let x = CGFloat(i % cols) * (cw + 6), y = CGFloat(i / cols) * (ch + 6)
                        let mine = focus == i
                        let dim = focus != nil && !mine
                        // a wave: the nearest neighbours go first, about 14 ms per 100 points
                        let dist = focus.map { f in hypot(x - CGFloat(f % cols) * (cw + 6), y - CGFloat(f / cols) * (ch + 6)) } ?? 0
                        ZStack(alignment: .bottomLeading) {
                            phPhoto(i, CGSize(width: cw, height: ch))
                            if mine { Text("Frame \(i + 1)").font(.caption2.weight(.semibold)).foregroundStyle(.white).padding(4).shadow(radius: 2).transition(.opacity) }
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                        .saturation(dim ? 0 : 1).opacity(dim ? 0.55 : 1).scaleEffect(dim ? 0.965 : 1)
                        .animation(reduce ? nil : .motion(focus == nil ? .soft : .base).delay(Double(dist) / 100 * 0.014), value: focus)
                        .offset(x: x, y: y)
                        .onContinuousHover { phase in
                            if case .active = phase, !pinned { focus = i } else if case .ended = phase, !pinned, focus == i { focus = nil }
                        }
                        .onTapGesture { if pinned && focus == i { pinned = false; focus = nil } else { pinned = true; focus = i } }
                        .accessibilityLabel("Photo \(i + 1)").accessibilityAddTraits(.isButton)
                    }
                }
            }
            .frame(height: 200)
        }
    }
}
