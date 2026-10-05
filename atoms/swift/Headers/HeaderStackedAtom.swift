import SwiftUI
import MotionKit

public struct HeaderStackedAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-stacked", category: "Headers", name: "Header: utility bar and main row",
        summary: "Scroll past 40px and the utility row collapses in two beats: its text fades first, then its height springs to zero 60ms later, so the main row rides up to the top edge and the shadow fades in. Scrolling back to the top reverses it: height opens first, the text follows 100ms behind. The page never shifts because the header floats over it. Narrow: the utility row disappears and its links move to the bottom of the menu.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var offset: CGFloat = 0
    @State private var barOpen = true
    @State private var textOn = true
    public init() {}
    public var body: some View {
        AtomStage(hint: "Scroll the page") {
            ZStack(alignment: .top) {
                HdrScroll(offset: $offset, top: 92)
                VStack(spacing: 0) {
                    HStack {
                        Text("Free shipping over $50").font(.caption2)
                        Spacer()
                        Text("Help").font(.caption2); Text("English").font(.caption2)
                    }
                    .padding(.horizontal, 12).opacity(textOn ? 1 : 0).blur(radius: textOn ? 0 : 3)
                    .frame(height: barOpen ? 28 : 0, alignment: .center).clipped()
                    .background(.quaternary)
                    HStack { HdrLogo(); Spacer(); HStack(spacing: 14) { ForEach(hdrLinks.prefix(3), id: \.self) { Text($0).font(.caption) } }; HdrButton(title: "Start") }
                        .padding(.horizontal, 12).frame(height: 56)
                }
                .background(.background)
                .shadow(color: .black.opacity(barOpen ? 0 : 0.12), radius: 6, y: 2)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .motion(.soft, value: barOpen)
            }
            .onChange(of: offset > 40) { _, collapsed in
                if reduce { barOpen = !collapsed; textOn = !collapsed; return }
                if collapsed {
                    withAnimation(.motionExit) { textOn = false }
                    withAnimation(.motion(.soft).delay(Motion.lag)) { barOpen = false }
                } else {
                    withAnimation(.motion(.soft)) { barOpen = true }
                    withAnimation(.motion(.base).delay(Motion.exit)) { textOn = true }
                }
            }
        }
    }
}
