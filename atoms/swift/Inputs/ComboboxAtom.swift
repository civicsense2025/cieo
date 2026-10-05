import SwiftUI
import MotionKit

public struct ComboboxAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "combobox", category: "Inputs", name: "Combobox",
        summary: "Typing filters in place. Matches spring into their new rows, misses blur out, and the matched letters bold. With no match, an “Add” row takes the first slot. The list height follows the count.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var query = ""
    @State private var slots = Array(0..<10)
    @State private var hi = 0
    @FocusState private var focused: Bool
    private let countries = ["Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "Denmark", "Estonia", "Finland"]
    private let rowH: CGFloat = 34, pad: CGFloat = 6, width: CGFloat = 240
    public init() {}

    private func term(_ s: String) -> String { s.trimmingCharacters(in: .whitespaces).lowercased() }
    private func visible(for s: String) -> [Int] {
        let q = term(s)
        return Array(countries.indices.filter { q.isEmpty || countries[$0].lowercased().contains(q) }.prefix(5))
    }
    private var vis: [Int] { visible(for: query) }
    private var addRow: Bool { vis.isEmpty && !term(query).isEmpty }
    private var count: Int { addRow ? 1 : vis.count }

    public var body: some View {
        AtomStage {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass").foregroundStyle(.secondary)
                TextField("Country", text: $query).textFieldStyle(.plain).focused($focused)
                    .accessibilityLabel("Country")
                    .onKeyPress(.downArrow) { hi = (hi + 1) % max(1, count); return .handled }
                    .onKeyPress(.upArrow) { hi = (hi + max(1, count) - 1) % max(1, count); return .handled }
                    .onKeyPress(.return) { choose(hi); return .handled }
                    .onKeyPress(.escape) { focused = false; return .handled }
            }
            .padding(.horizontal, 10).frame(width: width, height: 38)
            .background(RoundedRectangle(cornerRadius: 9).strokeBorder(Color.primary.opacity(0.2), lineWidth: 1.5))
            .overlay(alignment: .topLeading) {
                if focused { list.offset(y: 44).transition(reduce ? .identity : .basicsPop()) }
            }
            .frame(maxHeight: .infinity, alignment: .top)
            .motion(.base, value: focused)
        }
        .onChange(of: focused) { _, on in if on { hi = 0 } }
        .onChange(of: query) { old, new in
            let before = Set(visible(for: old)), after = visible(for: new)
            var t = Transaction()
            t.disablesAnimations = true
            withTransaction(t) { for (k, i) in after.enumerated() where !before.contains(i) { slots[i] = k } }
            DispatchQueue.main.async {
                withMotion(.base, reduceMotion: reduce) {
                    for (k, i) in after.enumerated() { slots[i] = k }
                    hi = 0
                }
            }
        }
    }

    private var list: some View {
        let shown = vis
        return ZStack(alignment: .topLeading) {
            BasicsVerticalEdges(frame: CGRect(x: pad, y: pad + CGFloat(hi) * rowH, width: width - pad * 2, height: rowH),
                                shape: RoundedRectangle(cornerRadius: 7), style: Color.primary.opacity(0.08))
                .opacity(count > 0 ? 1 : 0)
            ForEach(countries.indices, id: \.self) { i in
                let on = shown.contains(i)
                Button { choose(shown.firstIndex(of: i) ?? 0) } label: { row(label(countries[i])) }
                    .buttonStyle(.plain)
                    .opacity(on ? 1 : 0).blur(radius: on ? 0 : 4)
                    .animation(reduce ? nil : .motion(on ? .base : .snap), value: on)
                    .offset(y: pad + CGFloat(slots[i]) * rowH)
                    .allowsHitTesting(on).accessibilityHidden(!on)
            }
            Button { choose(0) } label: { row(Text("Add “\(query.trimmingCharacters(in: .whitespaces))”").foregroundStyle(.secondary)) }
                .buttonStyle(.plain)
                .opacity(addRow ? 1 : 0).blur(radius: addRow ? 0 : 4)
                .animation(reduce ? nil : .motion(addRow ? .base : .snap), value: addRow)
                .offset(y: pad).allowsHitTesting(addRow).accessibilityHidden(!addRow)
        }
        .frame(width: width, height: pad * 2 + CGFloat(max(1, count)) * rowH, alignment: .topLeading)
        .animation(reduce ? nil : .motion(.base), value: count)
        .basicsPanel()
    }

    private func row(_ text: Text) -> some View {
        text.font(.callout).padding(.horizontal, 10)
            .frame(width: width - pad * 2, height: rowH, alignment: .leading)
            .padding(.horizontal, pad).contentShape(Rectangle())
            .padding(.horizontal, -pad)
    }

    private func label(_ name: String) -> Text {
        let q = term(query)
        guard !q.isEmpty, let r = name.range(of: q, options: .caseInsensitive) else { return Text(name) }
        return Text(name[..<r.lowerBound]) + Text(name[r]).bold() + Text(name[r.upperBound...])
    }

    private func choose(_ k: Int) {
        if addRow {
            query = query.trimmingCharacters(in: .whitespaces)
        } else if vis.indices.contains(k) {
            query = countries[vis[k]]
        }
        focused = false
    }
}
