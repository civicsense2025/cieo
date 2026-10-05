import SwiftUI
import Cieo

public struct BetweenBlocksInsertAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "betweeninsert", category: "Editor", name: "Between-blocks insert",
        summary: "Hovering the gap draws a thin line with a plus. Clicking morphs the plus into a row of block choices, and the gap opens to make room. Picking one grows the new block from zero height at that gap while everything below slides down on the same spring.")

    private struct Item: Identifiable { let id = UUID(); let kind: String; var shown = true }
    private let kinds = [("Text", "text.alignleft"), ("Image", "photo"), ("Button", "capsule")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var items = [Item(kind: "Hero"), Item(kind: "Text"), Item(kind: "Pricing")]
    @State private var open: Int?
    @State private var hover: Int?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover between blocks and click the plus") {
            VStack(spacing: 0) {
                gap(0)
                ForEach(Array(items.enumerated()), id: \.element.id) { i, item in
                    EditorHeightReveal(progress: item.shown ? 1 : 0) {
                        Text(item.kind).font(.footnote.weight(.medium)).frame(maxWidth: .infinity, minHeight: 40, alignment: .leading).padding(.horizontal, 14)
                            .background(.quaternary.opacity(0.6), in: RoundedRectangle(cornerRadius: 8))
                    }.clipped()
                    gap(i + 1)
                }
            }
            .padding(12).frame(width: 360, alignment: .top)
        }
    }

    private func gap(_ g: Int) -> some View {
        let isOpen = open == g, hot = hover == g || isOpen
        return ZStack {
            Rectangle().fill(Color.accentColor).frame(height: 1.5).opacity(hot ? 1 : 0)
            ZStack {
                if isOpen {
                    HStack(spacing: 6) {
                        ForEach(kinds, id: \.0) { k in
                            Button { insert(k.0, at: g) } label: { Label(k.0, systemImage: k.1).font(.caption.weight(.medium)).padding(.horizontal, 10).padding(.vertical, 6).background(.background, in: Capsule()).overlay(Capsule().strokeBorder(Color.accentColor)) }.buttonStyle(.plain)
                        }
                    }.motionTransition(.swap())
                } else {
                    Button { withMotion(.base, reduceMotion: reduce) { open = g } } label: { Image(systemName: "plus").font(.caption2.weight(.bold)).foregroundStyle(.white).frame(width: 18, height: 18).background(Circle().fill(Color.accentColor)) }
                        .buttonStyle(.plain).opacity(hot ? 1 : 0).accessibilityLabel("Insert block here").motionTransition(.swap())
                }
            }
        }
        .frame(height: isOpen ? 54 : 18).contentShape(Rectangle())
        .onHover { h in withMotion(.snap, reduceMotion: reduce) { hover = h ? g : (hover == g ? nil : hover) } }
        .animation(reduce ? nil : .motion(.base), value: open)
    }

    private func insert(_ kind: String, at g: Int) {
        var new = Item(kind: kind); new.shown = false
        withMotion(.base, reduceMotion: reduce) { open = nil; items.insert(new, at: g) }
        DispatchQueue.main.async { withMotion(.base, reduceMotion: reduce) { if let i = items.firstIndex(where: { $0.id == new.id }) { items[i].shown = true } } }
    }
}
