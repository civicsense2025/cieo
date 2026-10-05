import SwiftUI
import MotionKit

public struct HeaderOverlayAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-overlay", category: "Headers", name: "Header: transparent over hero",
        summary: "Over the dark hero the header has no background, no border, and light ink. Scrolling 24px fills the background, fades in the border and shadow, and turns the logo, links and button ink from light to dark, all as one blend on one spring. Opening the narrow menu forces the solid state first so the panel never opens against a transparent bar. The button’s fill and text colors invert with the same blend.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var offset: CGFloat = 0
    @State private var menu = false
    public init() {}
    public var body: some View {
        let solid = offset > 24 || menu
        let ink: Color = solid ? .primary : .white
        AtomStage(hint: "Scroll the page, or open the menu") {
            ZStack(alignment: .top) {
                HdrScroll(offset: $offset, top: 52, hero: true)
                VStack(spacing: 0) {
                    HStack(spacing: 12) {
                        HStack(spacing: 6) { Image(systemName: "hexagon.fill"); Text("Studio").font(.callout.weight(.bold)) }
                        Spacer()
                        ForEach(hdrLinks.prefix(2), id: \.self) { Text($0).font(.caption) }
                        Text("Start").font(.caption.weight(.semibold)).padding(.horizontal, 12).padding(.vertical, 6)
                            .foregroundStyle(solid ? Color(white: 1) : Color.black)
                            .background(solid ? Color.accentColor : .white, in: Capsule())
                        Button { menu.toggle() } label: { Image(systemName: menu ? "xmark" : "line.3.horizontal") }.buttonStyle(.plain).accessibilityLabel(menu ? "Close menu" : "Open menu")
                    }
                    .foregroundStyle(ink)
                    .padding(.horizontal, 14).frame(height: 52)
                    if menu {
                        VStack(alignment: .leading, spacing: 8) { ForEach(hdrLinks, id: \.self) { Text($0).font(.callout) } }
                            .frame(maxWidth: .infinity, alignment: .leading).padding(14).transition(.motionPresence)
                    }
                }
                .background(.background.opacity(solid ? 1 : 0))
                .overlay(alignment: .bottom) { Rectangle().fill(.quaternary).frame(height: 1).opacity(solid ? 1 : 0) }
                .shadow(color: .black.opacity(solid ? 0.1 : 0), radius: 6, y: 2)
                .animation(reduce ? nil : .motion(.soft), value: solid)
            }
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }
}
