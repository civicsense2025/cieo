import SwiftUI
import Cieo

public struct SlashCommandMenuAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "slashmenu", category: "Writing", name: "Slash command menu",
        summary: "Typing “/” opens the menu right at the caret. Typing more filters it in place, the highlight follows with lagging edges, and Enter inserts a block that opens below. Rows carry icons you can toggle, and the menu docks left on demand.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @FocusState private var focused: Bool
    private let kinds = [("Heading", "textformat"), ("Image", "photo"), ("Quote", "quote.opening"), ("Divider", "minus"), ("Callout", "exclamationmark.bubble"), ("Table", "tablecells")]
    private let rowH = 32.0, pad = 6.0
    @State private var icons = true
    @State private var dockLeft = false
    private struct Inserted: Identifiable { let id = UUID(); let name: String }
    @State private var text = ""
    @State private var open = false
    @State private var highlight = 0
    @State private var hiTop = 6.0
    @State private var hiBottom = 38.0
    @State private var caretX = 0.0
    @State private var blocks: [Inserted] = []
    public init() {}

    private var query: String? {
        guard let r = text.range(of: #"/\w*$"#, options: .regularExpression) else { return nil }
        return String(text[r].dropFirst()).lowercased()
    }
    private var visible: [Int] { kinds.indices.filter { kinds[$0].0.lowercased().hasPrefix(query ?? "") } }
    private var panelHeight: Double { pad * 2 + Double(max(1, visible.count)) * rowH }

    public var body: some View {
        AtomStage(hint: "Type / to insert a block") {
            ZStack(alignment: .topLeading) {
                VStack(alignment: .leading, spacing: 6) {
                    TextField("Type / to insert a block", text: $text).textFieldStyle(.plain).focused($focused).padding(.vertical, 6)
                        .accessibilityLabel("Editor line")
                        .background(alignment: .leading) {
                            Text(prefix).fixedSize().hidden().background(GeometryReader { g in Color.clear.onChange(of: g.size.width) { _, w in caretX = w } })
                        }
                        .onKeyPress(.downArrow) { step(1); return .handled }
                        .onKeyPress(.upArrow) { step(-1); return .handled }
                        .onKeyPress(.escape) { setOpen(false); return .handled }
                        .onSubmit { if open, let i = visible[safe: highlight] { insert(i) } }
                    HStack {
                        Toggle("Icons", isOn: $icons)
                        Toggle("Dock left", isOn: $dockLeft)
                    }.font(.caption).foregroundStyle(.secondary).toggleStyle(.switch).controlSize(.small)
                    Divider()
                    ForEach(blocks) { b in
                        HStack { Text(b.name).fontWeight(.semibold); Text("block").foregroundStyle(.secondary) }.font(.caption)
                            .padding(.horizontal, 12).padding(.vertical, 10).frame(maxWidth: .infinity, alignment: .leading)
                            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 10))
                            .transition(reduce ? .identity : .opacity.combined(with: .scale(scale: 0.92, anchor: .top)))
                    }
                }
                .frame(width: 340).animation(reduce ? nil : .motion(.base), value: blocks.count)
                if open {
                    menu.offset(x: dockLeft ? 0 : min(caretX, 130), y: 40).motionTransition(.presence)
                }
            }
            .frame(width: 340, height: 280, alignment: .topLeading)
        }
        .onChange(of: text) { _, _ in update() }
    }

    private var prefix: String { query.map { String(text.dropLast($0.count + 1)) } ?? text }

    private var menu: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 7).fill(.quaternary).frame(height: hiBottom - hiTop).padding(.horizontal, 6).offset(y: hiTop)
            ForEach(kinds.indices, id: \.self) { i in
                let k = visible.firstIndex(of: i)
                HStack(spacing: 8) {
                    if icons {
                        Image(systemName: kinds[i].1).font(.subheadline)
                            .frame(width: 24, height: 24).background(.quaternary, in: RoundedRectangle(cornerRadius: 7))
                            .foregroundStyle(.secondary)
                    }
                    Text(kinds[i].0).font(.subheadline)
                }
                .padding(.horizontal, 10).frame(maxWidth: .infinity, minHeight: rowH, maxHeight: rowH, alignment: .leading)
                .contentShape(Rectangle()).offset(y: pad + Double(k ?? i) * rowH).opacity(k == nil ? 0 : 1).allowsHitTesting(k != nil)
                .onHover { if $0, let k { highlight = k; moveHighlight(k) } }
                .onTapGesture { insert(i) }
                .animation(reduce ? nil : .motion(.base), value: k)
                .accessibilityAddTraits(.isButton)
            }
        }
        .frame(width: 200, height: panelHeight, alignment: .top)
        .background(.background, in: RoundedRectangle(cornerRadius: 12)).background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
        .clipShape(RoundedRectangle(cornerRadius: 12)).shadow(color: .black.opacity(0.12), radius: 8, y: 3)
        .animation(reduce ? nil : .motion(.base), value: panelHeight)
    }

    private func setOpen(_ on: Bool) { withMotion(on ? .base : .snap, reduceMotion: reduce) { open = on } }

    private func update() {
        guard query != nil else { if open { setOpen(false) }; return }
        if !open { setOpen(true) }
        highlight = 0; moveHighlight(0)
    }

    private func step(_ d: Int) {
        guard open, !visible.isEmpty else { return }
        highlight = (highlight + (d > 0 ? 1 : visible.count - 1)) % visible.count
        moveHighlight(highlight)
    }

    private func insert(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) {
            blocks.insert(Inserted(name: kinds[i].0), at: 0)
            if blocks.count > 3 { blocks.removeLast() }
        }
        text = text.replacingOccurrences(of: #"/\w*$"#, with: "", options: .regularExpression)
        setOpen(false); focused = true
    }

    /// The highlight's leading edge moves first and its trailing edge follows 60 ms later.
    private func moveHighlight(_ k: Int) {
        let top = pad + Double(k) * rowH, bottom = top + rowH
        guard !reduce else { hiTop = top; hiBottom = bottom; return }
        let down = top >= hiTop
        withAnimation(.motion(.base).delay(down ? Motion.lag : 0)) { hiTop = top }
        withAnimation(.motion(.base).delay(down ? 0 : Motion.lag)) { hiBottom = bottom }
    }
}

private extension Array {
    subscript(safe i: Int) -> Element? { indices.contains(i) ? self[i] : nil }
}
