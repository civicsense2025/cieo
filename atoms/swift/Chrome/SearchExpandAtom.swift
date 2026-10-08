import SwiftUI
import Cieo

public struct SearchExpandAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "search", category: "Chrome", name: "Search expand",
        summary: "The icon button widens into the field while the brand fades, and the input appears once the shape has mostly opened. As you type, results open below. Matching rows spring into place with the match in bold, misses blur out, and the highlight follows the arrow keys.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @FocusState private var focused: Bool
    private let posts = [("On member pricing", "Essay · Sep 21"), ("The yearly pricing toggle, explained", "Guide · Sep 18"), ("Fog notes from the mill", "Notes · Sep 28"),
                         ("A smaller homepage", "Essay · Sep 14"), ("Fixing the font flash", "Notes · Sep 9"), ("Harbor at 6am", "Photos · Sep 30"), ("Why we sunset comments", "Essay · Aug 30")]
    private let rowH = 52.0, pad = 6.0
    @State private var open = false
    @State private var showInput = false
    @State private var query = ""
    @State private var highlight = 0
    @State private var hiTop = 6.0
    @State private var hiBottom = 58.0
    public init() {}

    private var q: String { query.trimmingCharacters(in: .whitespaces).lowercased() }
    private var visible: [Int] { q.isEmpty ? [] : Array(posts.indices.filter { posts[$0].0.lowercased().contains(q) }.prefix(4)) }
    private var panelHeight: Double { visible.isEmpty ? 52 : pad * 2 + Double(visible.count) * rowH }

    public var body: some View {
        AtomStage(hint: "Tap the magnifier, type “pri” or “fog”, Esc closes") {
            ZStack(alignment: .top) {
                bar
                if open && !q.isEmpty { results.motionTransition(.presence).offset(y: 58) }
            }
            .frame(maxWidth: 340).frame(maxHeight: .infinity, alignment: .top).padding(.top, 8)
            .animation(reduce ? nil : .motion(.base), value: q.isEmpty)
        }
        .onChange(of: query) { old, _ in
            highlight = 0; moveHighlight(0, instant: old.isEmpty)
        }
    }

    private var bar: some View {
        HStack {
            Text("Paper Trail").fontWeight(.bold).opacity(open ? 0 : 1)
            Spacer()
            HStack(spacing: 0) {
                Button { setOpen(!open) } label: { Image(systemName: "magnifyingglass").frame(width: 36, height: 36) }
                    .buttonStyle(.plain).accessibilityLabel("Search")
                if open {
                    TextField("Search posts", text: $query).textFieldStyle(.plain).focused($focused)
                        .frame(width: 170).opacity(showInput ? 1 : 0).accessibilityLabel("Search posts")
                        .onKeyPress(.escape) { query = ""; setOpen(false); return .handled }
                        .onKeyPress(.downArrow) { step(1); return .handled }
                        .onKeyPress(.upArrow) { step(-1); return .handled }
                        .onSubmit { if let i = visible[safe: highlight] { query = posts[i].0 } }
                }
            }
            .frame(width: open ? 220 : 36, height: 36, alignment: .leading)
            .background(.quaternary, in: Capsule()).clipShape(Capsule())
        }
        .padding(.leading, 16).padding(.trailing, 8).frame(height: 52)
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.05)))
        .animation(reduce ? nil : .motion(.base), value: open)
        .animation(reduce ? nil : .motion(.base).delay(0.12), value: showInput)
    }

    private var results: some View {
        ZStack(alignment: .topLeading) {
            if visible.isEmpty { Text("No posts match “\(query)”").font(.caption).foregroundStyle(.secondary).frame(maxWidth: .infinity).frame(height: 52) }
            RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(height: hiBottom - hiTop).padding(.horizontal, 6).offset(y: hiTop).opacity(visible.isEmpty ? 0 : 1)
            ForEach(posts.indices, id: \.self) { i in
                let k = visible.firstIndex(of: i)
                VStack(alignment: .leading, spacing: 1) {
                    Text(styled(posts[i].0)).font(.caption.weight(.medium))
                    Text(posts[i].1).font(.caption).foregroundStyle(.secondary)
                }
                .padding(.horizontal, 16).frame(maxWidth: .infinity, minHeight: rowH, maxHeight: rowH, alignment: .leading)
                .offset(y: pad + Double(k ?? 0) * rowH)
                .opacity(k == nil ? 0 : 1).blur(radius: k == nil ? 4 : 0).allowsHitTesting(k != nil)
                .onHover { if $0, let k { highlight = k; moveHighlight(k) } }
                .animation(reduce ? nil : (k == nil ? .motion(.snap) : .motion(.base)), value: k)
            }
        }
        .frame(height: panelHeight, alignment: .top)
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.05))).clipShape(RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.1), radius: 8, y: 3)
        .animation(reduce ? nil : .motion(.base), value: panelHeight)
        .accessibilityElement(children: .contain)
    }

    private func styled(_ title: String) -> AttributedString {
        var s = AttributedString(title)
        if !q.isEmpty, let r = s.range(of: q, options: .caseInsensitive) { s[r].font = .caption.weight(.bold) }
        return s
    }

    private func setOpen(_ on: Bool) {
        open = on
        if on { Task { try? await Task.sleep(for: .milliseconds(120)); showInput = true; focused = true } }
        else { showInput = false; focused = false }
    }

    private func step(_ d: Int) {
        guard !visible.isEmpty else { return }
        highlight = (highlight + (d > 0 ? 1 : visible.count - 1)) % visible.count
        moveHighlight(highlight)
    }

    /// The highlight's leading edge moves first and its trailing edge follows 60 ms later.
    private func moveHighlight(_ k: Int, instant: Bool = false) {
        let top = pad + Double(k) * rowH, bottom = top + rowH
        if instant || reduce { hiTop = top; hiBottom = bottom; return }
        let down = top >= hiTop
        withAnimation(.motion(.base).delay(down ? Motion.lag : 0)) { hiTop = top }
        withAnimation(.motion(.base).delay(down ? 0 : Motion.lag)) { hiBottom = bottom }
    }
}

private extension Array {
    subscript(safe i: Int) -> Element? { indices.contains(i) ? self[i] : nil }
}
