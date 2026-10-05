import SwiftUI
import Cieo

public struct MasonryRowCarouselAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-mason", category: "Carousels", name: "Masonry row carousel",
        summary: "Photos keep their exact aspect ratios: tall ones span both rows and wide ones pair up in a column whose width makes both fit exactly. The rail free-scrolls with momentum and snaps to column edges; selecting shrinks the photo inside its frame and fills the check. Tab walks every photo and the rail follows focus. Inspired by Google Photos’ justified grid; changed: packed by column so it scrolls sideways. Use when portrait and landscape photos must be picked quickly without cropping them.")
    @State private var picked: Set<Int> = []
    public init() {}
    /// Each column: one tall photo spanning both rows, or two wide photos stacked.
    private let columns: [[Int]] = [[0], [1, 2], [3], [4, 5], [6], [7, 8]]

    public var body: some View {
        AtomStage(hint: "Scroll sideways, tap to pick: nothing is cropped") {
            PhPager(count: columns.count, itemFraction: 0.5, maxStep: 3) { pos, size, item in
                let rowH = (size.height - 8) / 2
                let widths = columns.map { $0.count == 1 ? rowH * 0.62 * 2 : rowH * 1.5 }
                let lefts = widths.reduce(into: [CGFloat(0)]) { $0.append($0.last! + $1 + 8) }
                let c = min(max(pos, 0), Double(columns.count - 1)), i = Int(c)
                let lead = lefts[i] + (lefts[i + 1] - lefts[i]) * CGFloat(c - Double(i))
                ZStack(alignment: .topLeading) {
                    ForEach(columns.indices, id: \.self) { col in
                        VStack(spacing: 8) {
                            ForEach(columns[col], id: \.self) { id in
                                let h = columns[col].count == 1 ? size.height : rowH
                                let on = picked.contains(id)
                                ZStack(alignment: .topTrailing) {
                                    phPhoto(id, CGSize(width: widths[col], height: h)).clipShape(RoundedRectangle(cornerRadius: on ? 12 : 6))
                                        .scaleEffect(on ? 0.92 : 1)
                                    if on { Image(systemName: "checkmark.circle.fill").foregroundStyle(.white, Color.accentColor).padding(8) }
                                }
                                .frame(width: widths[col], height: h)
                                .motion(.snap, value: on)
                                .onTapGesture { if on { picked.remove(id) } else { picked.insert(id) } }
                                .accessibilityLabel("Photo \(id + 1)").accessibilityAddTraits(on ? [.isButton, .isSelected] : .isButton)
                            }
                        }
                        .offset(x: lefts[col] - lead + 8)
                    }
                }.frame(width: size.width, height: size.height, alignment: .topLeading).clipped()
            }
            .frame(height: 190)
        }
    }
}
