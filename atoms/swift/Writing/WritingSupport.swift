import SwiftUI
import Cieo

/// Wraps its subviews like words in a paragraph. Shared by the Writing atoms that need word positions.
struct WritingFlow: Layout {
    var spacing: CGFloat = 4
    var lineSpacing: CGFloat = 6

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrange(width: proposal.width ?? 320, subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let placed = arrange(width: bounds.width, subviews)
        for (i, f) in placed.frames.enumerated() { subviews[i].place(at: CGPoint(x: bounds.minX + f.minX, y: bounds.minY + f.minY), proposal: ProposedViewSize(f.size)) }
    }

    private func arrange(width: CGFloat, _ subviews: Subviews) -> (size: CGSize, frames: [CGRect]) {
        var x = 0.0, y = 0.0, rowH = 0.0, frames: [CGRect] = []
        for s in subviews {
            let size = s.sizeThatFits(.unspecified)
            if x > 0 && x + size.width > width { x = 0; y += rowH + lineSpacing; rowH = 0 }
            frames.append(CGRect(origin: CGPoint(x: x, y: y), size: size))
            x += size.width + spacing; rowH = max(rowH, size.height)
        }
        return (CGSize(width: width, height: y + rowH), frames)
    }
}

/// Splits a sentence into words and reports each word's frame in `space`, indexed by position.
struct WritingWords: View {
    let words: [String]
    let space: String
    var font: Font = .callout
    var highlighted: ClosedRange<Int>?

    var body: some View {
        WritingFlow {
            ForEach(words.indices, id: \.self) { i in
                Text(words[i]).font(font)
                    .background(highlighted?.contains(i) == true ? Color.accentColor.opacity(0.3) : .clear)
                    .reportFrame(i, in: space)
            }
        }
    }
}
