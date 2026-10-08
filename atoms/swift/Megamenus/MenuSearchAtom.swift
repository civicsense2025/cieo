import SwiftUI
import Cieo

public struct MenuSearchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-search", category: "Mega menus", name: "Search inside the menu",
        summary: "Opening search grows the panel from the bar and puts the caret in the field. Each keystroke filters at once: rows that no longer match blur out in 100 ms, the survivors slide up into the gap, and rows that now match arrive last. The panel height follows the list. The highlight plate trails the arrow keys. On a phone, search takes over the whole screen instead.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var query = ""
    @State private var sel = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    @FocusState private var focused: Bool
    private let all = ["Getting started", "Authentication", "Billing and invoices", "Brand assets", "Webhooks", "Rate limits", "Release notes", "Security", "Status page"]
    private var rows: [String] { query.isEmpty ? all : all.filter { $0.localizedCaseInsensitiveContains(query) } }

    public init() {}
    public var body: some View {
        AtomStage(hint: "Open search, type, use the arrow keys") {
            VStack(spacing: 6) {
                HStack {
                    Text("Docs").font(.callout.weight(.medium)); Text("Pricing").font(.callout).foregroundStyle(.secondary)
                    Spacer()
                    Button { toggle() } label: { Image(systemName: open ? "xmark" : "magnifyingglass").frame(width: 28, height: 28) }
                        .buttonStyle(.plain).accessibilityLabel(open ? "Close search" : "Open search")
                }
                .padding(.horizontal, 10).padding(.vertical, 4)
                if open { panel.motionTransition(.presence) }
                Spacer(minLength: 0)
            }
            .background(.quaternary.opacity(0.35), in: RoundedRectangle(cornerRadius: 10))
        }
    }

    private var panel: some View {
        VStack(alignment: .leading, spacing: 4) {
            TextField("Search the docs", text: $query)
                .textFieldStyle(.roundedBorder).focused($focused)
                .onChange(of: query) { _, _ in sel = 0 }
                .onSubmit { toggle() }
            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(rows.enumerated()), id: \.element) { n, title in
                    Text(title).font(.callout).frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 6).padding(.horizontal, 8)
                        .reportFrame(n, in: "results").transition(reduce ? .identity : .megaBlur)
                }
            }
            .background { MegaPlate(frame: frames[AnyHashable(sel)]) }
            .coordinateSpace(name: "results")
            .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
            .animation(reduce ? nil : .motion(.soft), value: rows)
            if rows.isEmpty { Text("No matches").font(.caption).foregroundStyle(.secondary).padding(8) }
        }
        .padding(10)
        .background(.background, in: RoundedRectangle(cornerRadius: 10))
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.05)))
        .padding(.horizontal, 8)
        .onKeyPress(.downArrow) { sel = min(max(0, rows.count - 1), sel + 1); return .handled }
        .onKeyPress(.upArrow) { sel = max(0, sel - 1); return .handled }
        .onKeyPress(.escape) { toggle(); return .handled }
        .accessibilityElement(children: .contain)
    }

    private func toggle() {
        withMotion(.base, reduceMotion: reduce) { open.toggle() }
        if open { query = ""; sel = 0; focused = true }
    }
}
