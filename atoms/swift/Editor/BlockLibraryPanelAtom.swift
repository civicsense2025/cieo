import SwiftUI
import MotionKit

public struct BlockLibraryPanelAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "blocklibrary", category: "Editor", name: "Block library panel",
        summary: "Typing filters the tiles in place: misses fade out while the matches spring into the freed slots. Dragging a tile lifts a ghost that stays exactly under the pointer. Over the page, one accent line slides between blocks to show where it will land. On release the ghost settles into the slot and the new block opens to full height while the blocks below slide down.")

    private struct Block: Identifiable { let id = UUID(); let name: String; var shown = true }
    private let tiles = [("Hero", "rectangle.tophalf.filled"), ("Text", "text.alignleft"), ("Image", "photo"), ("Pricing", "rectangle.split.2x1"), ("Footer", "rectangle.bottomhalf.filled"), ("Quote", "quote.opening")]
    private let tw: CGFloat = 64, th: CGFloat = 56
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var query = ""
    @State private var blocks = [Block(name: "Header"), Block(name: "Text")]
    @State private var dragging: Int?
    @State private var ghost = CGPoint.zero
    @State private var lineSlot: Int?
    public init() {}

    private func rank(_ i: Int) -> Int? {
        let ok = tiles.indices.filter { query.isEmpty || tiles[$0].0.localizedCaseInsensitiveContains(query) }
        return ok.firstIndex(of: i)
    }

    public var body: some View {
        AtomStage(hint: "Filter, then drag a tile onto the page") {
            ZStack(alignment: .topLeading) {
                HStack(alignment: .top, spacing: 0) {
                    VStack(alignment: .leading, spacing: 8) {
                        TextField("Search blocks", text: $query).textFieldStyle(.roundedBorder).font(.footnote)
                        ZStack(alignment: .topLeading) { ForEach(tiles.indices, id: \.self) { i in tile(i) } }.frame(height: 130, alignment: .topLeading)
                        Spacer()
                    }.padding(10).frame(width: 216)
                    Divider()
                    ZStack(alignment: .topLeading) {
                        VStack(spacing: 8) { ForEach(blocks) { b in
                            HeightReveal(progress: b.shown ? 1 : 0) { Text(b.name).font(.footnote).frame(maxWidth: .infinity, minHeight: 44).background(.quaternary.opacity(0.6), in: RoundedRectangle(cornerRadius: 8)) }.clipped()
                        } }.padding(10)
                        if let s = lineSlot { Capsule().fill(Color.accentColor).frame(width: 140, height: 3).offset(x: 10, y: 6 + CGFloat(s) * 52) }
                    }.frame(width: 160, height: 250, alignment: .topLeading).animation(reduce ? nil : .motion(.base), value: lineSlot)
                }
                if let d = dragging {
                    Label(tiles[d].0, systemImage: tiles[d].1).font(.caption).padding(8).background(.background, in: RoundedRectangle(cornerRadius: 8)).shadow(radius: 6)
                        .position(ghost).allowsHitTesting(false)
                }
            }
            .coordinateSpace(name: "bl").frame(width: 377, height: 250, alignment: .topLeading).clipped()
            .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }

    private func tile(_ i: Int) -> some View {
        let r = rank(i), slot = r ?? i
        return VStack(spacing: 4) { Image(systemName: tiles[i].1); Text(tiles[i].0).font(.caption2) }
            .frame(width: tw, height: th).background(.background, in: RoundedRectangle(cornerRadius: 8))
            .offset(x: CGFloat(slot % 3) * (tw + 6), y: CGFloat(slot / 3) * (th + 6))
            .opacity(r == nil || dragging == i ? (dragging == i ? 0.4 : 0) : 1).allowsHitTesting(r != nil)
            .animation(reduce ? nil : .motion(.base), value: query)
            .gesture(DragGesture(minimumDistance: 2, coordinateSpace: .named("bl"))
                .onChanged { g in
                    dragging = i; ghost = g.location
                    let over = g.location.x > 216
                    let s = min(blocks.count, max(0, Int(((g.location.y - 10) / 52).rounded())))
                    if over { if lineSlot != s { lineSlot = s } } else if lineSlot != nil { lineSlot = nil }
                }
                .onEnded { _ in drop(i) })
            .accessibilityLabel("\(tiles[i].0) block")
    }

    private func drop(_ i: Int) {
        defer { dragging = nil; lineSlot = nil }
        guard let s = lineSlot else { return }
        var b = Block(name: tiles[i].0); b.shown = false
        withMotion(.base, reduceMotion: reduce) { blocks.insert(b, at: s) }
        DispatchQueue.main.async { withMotion(.base, reduceMotion: reduce) { if let k = blocks.firstIndex(where: { $0.id == b.id }) { blocks[k].shown = true } } }
    }
}
