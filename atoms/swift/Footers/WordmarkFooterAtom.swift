import SwiftUI
import MotionKit

public struct WordmarkFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fz1-wordmark", category: "Footers", name: "Giant wordmark footer",
        summary: "The wordmark is sized to the width of the footer and rises letter by letter as the page scrolls it into view. Each letter follows the scroll position on the soft spring, starting 35ms after the one before, so p leads and l trails, and scrolling back up lowers them again. Link underlines wipe in from the left and leave to the right, and Back to top scrolls on a spring that any wheel or touch cancels.")
    public init() {}
    public var body: some View { FootPage(blocks: 2) { WordmarkFooter() } }
}

private struct WordmarkFooter: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Environment(\.footProgress) private var progress
    @Environment(\.footBackToTop) private var top
    private let letters = Array("principle")
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 16) {
                ForEach(["Product", "Company", "Contact"], id: \.self) { FootLink(title: $0) }
                Spacer()
                Button("Back to top") { top() }.buttonStyle(.plain).font(.caption).foregroundStyle(.secondary)
            }
            GeometryReader { g in
                let size = g.size.width / (CGFloat(letters.count) * 0.56)
                HStack(spacing: 0) {
                    ForEach(letters.indices, id: \.self) { i in
                        Text(String(letters[i])).font(.system(size: size, weight: .bold)).lineLimit(1).fixedSize()
                            .offset(y: (1 - progress) * size)
                            .animation(reduce ? nil : .motion(.soft).delay(Double(i) * 0.035), value: progress)
                    }
                }
                .frame(width: g.size.width, height: size * 0.95, alignment: .topLeading).clipped()
            }
            .frame(height: 78)
            .accessibilityElement(children: .ignore).accessibilityLabel("principle")
        }
        .padding(.top, 14).overlay(alignment: .top) { Divider() }
    }
}
