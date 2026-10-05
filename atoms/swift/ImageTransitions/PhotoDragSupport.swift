import SwiftUI
import MotionKit

/// A 2D drag that follows the finger 1:1. On release `decide(offset, projectedExtra)` picks the resting offset
/// and the offset springs there carrying the flick's velocity.
struct PhDrag<Content: View>: View {
    var preset: SpringPreset = .base
    var enabled = true
    /// A resting offset commanded from outside (undo, buttons). The offset springs there from wherever it is.
    var rest: CGSize = .zero
    var decide: (CGSize, CGSize) -> CGSize = { _, _ in .zero }
    var onRelease: (CGSize) -> Void = { _ in }
    @ViewBuilder var content: (CGSize, Bool) -> Content
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cx = PhClock(0, .base)
    @State private var cy = PhClock(0, .base)
    @State private var live: CGSize?
    @State private var base = CGSize.zero
    @State private var idle = true
    @State private var key = 0

    var body: some View {
        TimelineView(.animation(paused: idle && live == nil)) { _ in
            content(live ?? CGSize(width: cx.value, height: cy.value), live != nil)
        }
        .gesture(DragGesture(minimumDistance: 3)
            .onChanged { v in
                if live == nil { base = CGSize(width: cx.value, height: cy.value) }
                live = CGSize(width: base.width + v.translation.width, height: base.height + v.translation.height)
            }
            .onEnded { v in
                let raw = live ?? base
                let extra = CGSize(width: v.predictedEndTranslation.width - v.translation.width, height: v.predictedEndTranslation.height - v.translation.height)
                let to = decide(raw, extra)
                live = nil
                cx.release(from: raw.width, velocity: extra.width * 2.5, to: to.width, reduce: reduce, preset: preset)
                cy.release(from: raw.height, velocity: extra.height * 2.5, to: to.height, reduce: reduce, preset: preset)
                key += 1
                onRelease(to)
            }, including: enabled ? .all : .none)
        .onChange(of: rest) { _, r in
            if cx.track.target == r.width && cy.track.target == r.height { return }
            cx.release(from: cx.value, velocity: 0, to: r.width, reduce: reduce, preset: preset)
            cy.release(from: cy.value, velocity: 0, to: r.height, reduce: reduce, preset: preset)
            key += 1
        }
        .task(id: key) {
            idle = false
            try? await Task.sleep(nanoseconds: UInt64((preset.settleTime() + 0.2) * 1_000_000_000))
            idle = true
        }
    }
}
