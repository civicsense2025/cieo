import SwiftUI

/// A glyph that sits on a line of text: centred on that line and sized from its font, whether the glyph
/// is an SF Symbol or a shape the host draws.
///
/// A view with no text has no baseline, so a bare glyph in a `.firstTextBaseline` stack rests its bottom
/// edge on the text's baseline and floats above the letters. This view carries the baseline of one line
/// in `font`, so in such a stack it lines up with the text's first line, and the glyph sits centred on
/// that line. A drawn shape fills a square of `glyphScale` times the line height, so it grows with
/// Dynamic Type and follows the text role; an SF Symbol keeps the size its own font gives it.
public struct InlineGlyph<Glyph: View>: View {
    @Environment(\.componentMetrics) private var metrics
    private let font: Font?
    private let glyph: Glyph

    /// `font` is the text the glyph sits beside; nil uses the font already in the environment.
    public init(font: Font? = nil, @ViewBuilder glyph: () -> Glyph) {
        self.font = font
        self.glyph = glyph()
    }

    public var body: some View {
        InlineGlyphLayout(scale: metrics.glyphScale) {
            // One line of the text's font: it supplies the line height and the baseline, never ink.
            // `.font(nil)` would clear the inherited font, so the line only sets one when it is given.
            reference.hidden().accessibilityHidden(true)
            glyph
        }
    }

    private var reference: Text {
        let line = Text(verbatim: "X")
        return font.map { line.font($0) } ?? line
    }
}

/// Places the glyph (second subview) centred on the line box of the reference text (first subview), and
/// reports the reference text's baselines as its own.
struct InlineGlyphLayout: Layout {
    let scale: CGFloat

    struct Measure {
        let line: CGSize
        let glyph: CGSize
        let side: CGFloat
        var size: CGSize { CGSize(width: max(side, glyph.width), height: max(line.height, glyph.height)) }
    }

    func measure(_ subviews: Subviews) -> Measure? {
        guard subviews.count == 2 else { return nil }
        let line = subviews[0].sizeThatFits(.unspecified)
        let side = line.height * scale
        let glyph = subviews[1].sizeThatFits(ProposedViewSize(width: side, height: side))
        return Measure(line: line, glyph: glyph, side: side)
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        measure(subviews)?.size ?? .zero
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        guard let measure = measure(subviews) else { return }
        let centre = CGPoint(x: bounds.midX, y: bounds.midY)
        subviews[0].place(at: centre, anchor: .center, proposal: .unspecified)
        subviews[1].place(at: centre, anchor: .center,
                          proposal: ProposedViewSize(width: measure.side, height: measure.side))
    }

    func explicitAlignment(of guide: VerticalAlignment, in bounds: CGRect, proposal: ProposedViewSize,
                           subviews: Subviews, cache: inout ()) -> CGFloat? {
        guard guide == .firstTextBaseline || guide == .lastTextBaseline, let measure = measure(subviews) else {
            return nil
        }
        let lineTop = (measure.size.height - measure.line.height) / 2
        return bounds.minY + lineTop + subviews[0].dimensions(in: .unspecified)[guide]
    }
}
