import SwiftUI
import MotionKit

public struct IconGridAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-icons", category: "Mega menus", name: "Icon grid of products",
        summary: "Tiles arrive on a diagonal: top-left first, each neighbor 30 ms later. One plate glides between tiles with lagging edges, and the hovered icon fills with the accent on the same spring. Switching from Products to Integrations morphs the panel height and swaps the grid. At phone width the grids sit inside accordions as compact tiles.")
    public init() {}
    public var body: some View {
        MegaShell(items: ["Products", "Integrations"], hint: "Hover the tiles; switch the top item") { i in
            IconGrid(tiles: i == 0
                ? [("chart.bar", "Analytics"), ("envelope", "Email"), ("lock", "Auth"), ("tray.full", "Storage"), ("bolt", "Functions"), ("globe", "Domains")]
                : [("message", "Chat"), ("calendar", "Calendar"), ("creditcard", "Payments"), ("map", "Maps"), ("doc.text", "Docs"), ("cloud", "Cloud"), ("camera", "Video"), ("bell", "Alerts"), ("person.2", "People")])
        }
    }
}

private struct IconGrid: View {
    let tiles: [(String, String)]
    @State private var hover: Int?
    @State private var frames: [AnyHashable: CGRect] = [:]
    var body: some View {
        VStack(spacing: 4) {
            ForEach(0..<(tiles.count + 2) / 3, id: \.self) { r in
                HStack(spacing: 4) {
                    ForEach(0..<3, id: \.self) { c in
                        let n = r * 3 + c
                        if n < tiles.count { tile(n, r + c) } else { Spacer() }
                    }
                }
            }
        }
        .background { MegaPlate(frame: hover.flatMap { frames[AnyHashable($0)] }) }
        .coordinateSpace(name: "icons")
        .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
    }

    private func tile(_ n: Int, _ diagonal: Int) -> some View {
        VStack(spacing: 4) {
            Image(systemName: tiles[n].0)
                .frame(width: 32, height: 32)
                .foregroundStyle(hover == n ? Color.white : Color.accentColor)
                .background(hover == n ? Color.accentColor : Color.accentColor.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                .motion(.base, value: hover)
            Text(tiles[n].1).font(.caption)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 8)
        .contentShape(Rectangle())
        .reportFrame(n, in: "icons")
        .onHover { hover = $0 ? n : (hover == n ? nil : hover) }
        .megaRise(diagonal, of: 5, lead: Motion.exit)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isLink)
    }
}
