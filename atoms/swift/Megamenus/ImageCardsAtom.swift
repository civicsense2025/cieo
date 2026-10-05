import SwiftUI
import MotionKit

public struct ImageCardsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-cards", category: "Mega menus", name: "Full-width image cards",
        summary: "The panel unrolls from the header edge on one spring. Cards then arrive left to right: each picture rises first, its words follow 60 ms later. One plate trails the pointer between cards, and the picture under it eases up. Moving to another top item swaps the cards in place. At phone width the cards become a swipeable row inside each accordion.")
    private let sets = [["Field notes", "Case studies", "Open source", "Talks"], ["Brand", "Product", "Research", "Careers"]]
    public init() {}
    public var body: some View {
        MegaShell(items: ["Work", "Studio"], hint: "Hover the cards; scroll the row") { i in
            CardRow(titles: sets[i], seedBase: i * 4)
        }
    }
}

private struct CardRow: View {
    let titles: [String]
    let seedBase: Int
    @State private var hover: Int?
    @State private var frames: [AnyHashable: CGRect] = [:]
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(titles.indices, id: \.self) { n in
                    VStack(alignment: .leading, spacing: 4) {
                        AtomPhoto(seed: seedBase + n, goldenHour: Double(n) * 0.25)
                            .frame(width: 110, height: 70).clipShape(RoundedRectangle(cornerRadius: 8))
                            .scaleEffect(hover == n ? 1.04 : 1).offset(y: hover == n ? -3 : 0)
                            .motion(.base, value: hover)
                            .megaRise(n, of: 4)
                        Text(titles[n]).font(.callout.weight(.medium)).megaRise(n, of: 4, lead: Motion.exit + 0.06)
                    }
                    .padding(6)
                    .contentShape(Rectangle())
                    .reportFrame(n, in: "cards")
                    .onHover { hover = $0 ? n : (hover == n ? nil : hover) }
                    .accessibilityElement(children: .combine)
                    .accessibilityAddTraits(.isLink)
                }
            }
            .background { MegaPlate(frame: hover.flatMap { frames[AnyHashable($0)] }) }
            .coordinateSpace(name: "cards")
            .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
        }
    }
}
