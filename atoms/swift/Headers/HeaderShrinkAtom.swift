import SwiftUI
import Cieo

public struct HeaderShrinkAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-shrink", category: "Headers", name: "Header: shrinks on scroll",
        summary: "Past 16px of scroll the header compacts on a single spring: the bar goes from 88px to 56px, the logo scales from 1.18 to 1, the tagline folds away, the button height eases down, and the border and shadow fade in together. Back at the top it reverses on the same spring. Narrow: starts at 64px and shrinks to 52px, and the menu drops from beneath whichever height it is at.")
    @State private var offset: CGFloat = 0
    public init() {}
    public var body: some View {
        let compact = offset > 16
        AtomStage(hint: "Scroll the page") {
            ZStack(alignment: .top) {
                HdrScroll(offset: $offset, top: 96)
                HStack {
                    HdrLogo(tagline: compact ? nil : "Make things calmly")
                        .scaleEffect(compact ? 1 : 1.18, anchor: .leading)
                    Spacer()
                    HdrButton(title: "Get started").scaleEffect(compact ? 1 : 1.12, anchor: .trailing)
                }
                .padding(.horizontal, 14)
                .frame(height: compact ? 56 : 88)
                .background(.background)
                .overlay(alignment: .bottom) { Rectangle().fill(.quaternary).frame(height: 1).opacity(compact ? 1 : 0) }
                .shadow(color: .black.opacity(compact ? 0.1 : 0), radius: 6, y: 2)
                .motion(.soft, value: compact)
            }
        }
    }
}
