import SwiftUI
import MotionKit

public struct CommandPaletteAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "palette", category: "Admin", name: "Command palette",
        summary: "Rows spring to their new slots as the filter changes and hidden rows blur out in place. The highlight moves with lagging edges. Arrow keys and Enter work.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @FocusState private var focused: Bool
    private let commands = [("New page", "⌘N"), ("Open site settings", "⌘,"), ("Invite teammate", "⌘I"), ("Toggle theme", "⌘T"), ("Search media", "⌘P"), ("Export content", "⌘E"), ("Sign out", "⇧⌘Q")]
    private let rowH = 36.0, pad = 6.0
    @State private var query = ""
    @State private var selected = 0
    @State private var hiTop = 6.0
    @State private var hiBottom = 42.0
    @State private var status = "↑↓ to move · Enter to run"
    public init() {}

    private func fuzzy(_ name: String, _ s: String) -> Bool {
        var from = name.lowercased().startIndex
        let n = name.lowercased()
        for c in s.lowercased() {
            guard let r = n[from...].firstIndex(of: c) else { return false }
            from = n.index(after: r)
        }
        return true
    }
    private var visible: [Int] { commands.indices.filter { fuzzy(commands[$0].0, query.trimmingCharacters(in: .whitespaces)) } }
    private var listHeight: Double { pad * 2 + Double(max(1, visible.count)) * rowH }

    public var body: some View {
        AtomStage(hint: "Type to filter · arrows move · Enter runs") {
            VStack(spacing: 0) {
                TextField("Type a command…", text: $query).textFieldStyle(.plain).focused($focused)
                    .padding(.horizontal, 16).padding(.vertical, 13).accessibilityLabel("Search commands")
                    .onKeyPress(.downArrow) { move(1); return .handled }
                    .onKeyPress(.upArrow) { move(-1); return .handled }
                    .onSubmit { run(selected) }
                Divider()
                list
                Divider()
                SwapText(status).font(.caption).foregroundStyle(.secondary).padding(.horizontal, 16).frame(maxWidth: .infinity, minHeight: 32, alignment: .leading)
            }
            .frame(maxWidth: 380).background(.background, in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(.quaternary)).clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .onChange(of: query) { _, _ in selected = 0; moveHighlight(0) }
        .onAppear { focused = true }
    }

    private var list: some View {
        ZStack(alignment: .topLeading) {
            if visible.isEmpty { Text("No matching commands").font(.caption).foregroundStyle(.secondary).frame(maxWidth: .infinity).frame(height: 48) }
            RoundedRectangle(cornerRadius: 9).fill(.quaternary).padding(.horizontal, 6).frame(height: hiBottom - hiTop).offset(y: hiTop).opacity(visible.isEmpty ? 0 : 1)
            ForEach(commands.indices, id: \.self) { i in
                let k = visible.firstIndex(of: i)
                HStack { Text(commands[i].0).font(.subheadline); Spacer(); Text(commands[i].1).font(.caption.monospaced()).foregroundStyle(.tertiary) }
                    .padding(.horizontal, 18).frame(height: rowH).contentShape(Rectangle())
                    .offset(y: pad + Double(k ?? i) * rowH)
                    .opacity(k == nil ? 0 : 1).blur(radius: k == nil ? 4 : 0).allowsHitTesting(k != nil)
                    .onHover { if $0, let k, k != selected { selected = k; moveHighlight(k) } }
                    .onTapGesture { if let k { selected = k; run(k) } }
                    .animation(reduce ? nil : .motion(.base), value: k)
                    .accessibilityAddTraits(.isButton).accessibilityHidden(k == nil)
            }
        }
        .frame(height: listHeight, alignment: .top).clipped()
        .animation(reduce ? nil : .motion(.base), value: listHeight)
    }

    private func move(_ d: Int) {
        guard !visible.isEmpty else { return }
        selected = (selected + (d > 0 ? 1 : visible.count - 1)) % visible.count
        moveHighlight(selected)
    }

    private func run(_ k: Int) {
        guard let i = visible[safe: k] else { return }
        withMotion(.base, reduceMotion: reduce) { status = "Ran “\(commands[i].0)”" }
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
