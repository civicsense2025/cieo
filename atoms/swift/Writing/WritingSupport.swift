import SwiftUI
import Cieo
import CieoUI

/// Wraps its subviews like words in a paragraph using `CieoUI.FlowStack`.
struct WritingFlow<Content: View>: View {
    var spacing: CGFloat = 4
    var lineSpacing: CGFloat = 6
    let content: Content

    init(spacing: CGFloat = 4, lineSpacing: CGFloat = 6, @ViewBuilder content: () -> Content) {
        self.spacing = spacing
        self.lineSpacing = lineSpacing
        self.content = content()
    }

    var body: some View {
        FlowStack(spacing: spacing) {
            content
        }
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
