import SwiftUI
import Cieo

public struct PageEditorAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pageeditor", category: "Editor", name: "Page editor",
        summary: "The first click on a block springs a selection ring onto it, lights the outline plate and slides the inspector in from the right (a bottom sheet when narrow), without swapping fields. After that the ring morphs between blocks with x, y, width and height springs, the outline plate follows with lagging edges, and the inspector fields blur-swap to the new block. Typing in Heading edits the canvas live; a Background swatch recolors the block.")

    private struct Block { let name: String; var heading: String; var bg: Int; let height: CGFloat }
    private let swatches: [(String, Color)] = [("Paper", Color(white: 0.97)), ("Sage", .green.opacity(0.2)), ("Sand", .orange.opacity(0.2)), ("Mist", .gray.opacity(0.2)), ("Ink", Color(white: 0.12))]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var blocks = [Block(name: "Hero", heading: "Build the page, not the plumbing", bg: 0, height: 86), Block(name: "Text", heading: "Why we built it", bg: 0, height: 60),
                                 Block(name: "Pricing", heading: "Simple pricing", bg: 3, height: 60), Block(name: "Footer", heading: "© 2026 Harbor Studio", bg: 4, height: 40)]
    @State private var selected: Int?
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Select blocks; Esc clears") {
            HStack(spacing: 0) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Outline").font(.caption).foregroundStyle(.secondary).padding(.leading, 8).padding(.bottom, 4)
                    ZStack(alignment: .topLeading) {
                        RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(height: 30).offset(y: 32 * CGFloat(selected ?? 0)).opacity(selected == nil ? 0 : 1)
                        VStack(spacing: 2) { ForEach(blocks.indices, id: \.self) { i in
                            Button { pick(i) } label: { Text(blocks[i].name).font(.footnote.weight(.medium)).padding(.leading, 8).frame(maxWidth: .infinity, minHeight: 30, alignment: .leading) }.buttonStyle(.plain)
                        } }
                    }
                    Spacer()
                }.padding(8).frame(width: 96)
                Divider()
                ZStack(alignment: .topLeading) {
                    VStack(spacing: 0) { ForEach(blocks.indices, id: \.self) { i in block(i) } }
                    if let s = selected, let f = frames[s] {
                        RoundedRectangle(cornerRadius: 4).strokeBorder(Color.accentColor, lineWidth: 2).frame(width: f.width, height: f.height).position(x: f.midX, y: f.midY).allowsHitTesting(false)
                    }
                }
                .coordinateSpace(name: "pe").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top).onTapGesture { deselect() }
                if let s = selected { inspector(s).transition(reduce ? .identity : .move(edge: .trailing)) }
            }
            .frame(width: 520, height: 270).clipped()
            .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
            .onKeyPress(.escape) { deselect(); return .handled }
        }
    }

    private func block(_ i: Int) -> some View {
        let dark = blocks[i].bg == 4
        return VStack(alignment: .leading, spacing: 4) {
            Text(blocks[i].heading).font(i == 0 ? .title3.weight(.semibold) : .footnote.weight(.semibold))
            if i < 3 { Text("Drag blocks, edit text and publish in one click.").font(.caption).opacity(0.7) }
        }
        .foregroundStyle(dark ? Color(white: 0.94) : .primary)
        .padding(.horizontal, 16).frame(maxWidth: .infinity, minHeight: blocks[i].height, maxHeight: blocks[i].height, alignment: .leading)
        .background(swatches[blocks[i].bg].1).motion(.base, value: blocks[i].bg)
        .reportFrame(i, in: "pe").contentShape(Rectangle()).onTapGesture { pick(i) }
        .accessibilityLabel("\(blocks[i].name) block").accessibilityAddTraits(.isButton)
    }

    private func inspector(_ s: Int) -> some View {
        ZStack(alignment: .topLeading) {
            VStack(alignment: .leading, spacing: 8) {
                Text(blocks[s].name).font(.footnote.weight(.semibold))
                Text("Heading").font(.caption).foregroundStyle(.secondary)
                TextField("Heading", text: $blocks[s].heading).textFieldStyle(.roundedBorder).font(.footnote)
                Text("Background").font(.caption).foregroundStyle(.secondary)
                HStack(spacing: 6) { ForEach(swatches.indices, id: \.self) { k in
                    Button { blocks[s].bg = k } label: { Circle().fill(swatches[k].1).overlay(Circle().strokeBorder(blocks[s].bg == k ? Color.accentColor : Color.secondary.opacity(0.4), lineWidth: 2)).frame(width: 22, height: 22) }
                        .buttonStyle(.plain).accessibilityLabel(swatches[k].0)
                } }
            }.id(s).motionTransition(.swap())
        }
        .animation(reduce ? nil : .motion(.base), value: s)
        .padding(12).frame(width: 190, alignment: .topLeading).frame(maxHeight: .infinity, alignment: .top).background(.background)
    }

    private func pick(_ i: Int) { withMotion(.base, reduceMotion: reduce) { selected = i } }
    private func deselect() { withMotion(.snap, reduceMotion: reduce) { selected = nil } }
}
