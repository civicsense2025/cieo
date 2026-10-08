import SwiftUI
import Cieo

public struct CommandMenuAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-command", category: "Mega menus", name: "Command menu",
        summary: "Hover Go to, Create or Account waits 120 ms, then the palette opens already scoped to that group. Moving to another group keeps it open: rows that leave blur out in 100 ms, the rest slide into the gap, the group’s own rows arrive last. ⌘K or Ctrl+K opens it with the keyboard; the plate follows the arrow keys and Enter runs the command. On a phone it is a bottom sheet with touch-sized rows.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var scope: String?
    @State private var query = ""
    @State private var sel = 0
    @State private var ran = "Nothing run yet"
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var task: Task<Void, Never>?
    @FocusState private var focused: Bool
    private let groups = ["Go to", "Create", "Account"]
    private let all: [(String, String)] = [("Go to", "Dashboard"), ("Go to", "Reports"), ("Go to", "Settings"), ("Create", "New project"), ("Create", "New invoice"), ("Create", "Invite teammate"), ("Account", "Profile"), ("Account", "Billing"), ("Account", "Sign out")]
    private var rows: [(String, String)] { all.filter { (scope == nil || $0.0 == scope) && (query.isEmpty || $0.1.localizedCaseInsensitiveContains(query)) } }

    public init() {}
    public var body: some View {
        AtomStage(hint: "Hover a group, or press ⌘K. \(ran)") {
            VStack(spacing: 6) {
                HStack(spacing: 4) {
                    ForEach(groups, id: \.self) { g in
                        Text(g).font(.callout.weight(.medium)).padding(.horizontal, 10).padding(.vertical, 8)
                            .foregroundStyle(open && scope == g ? Color.accentColor : .primary)
                            .contentShape(Rectangle())
                            .onHover { inside in task?.cancel(); if inside { hover(g) } }
                            .onTapGesture { show(g) }.accessibilityAddTraits(.isButton)
                    }
                    Spacer()
                    Button("Search commands") { open ? hide() : show(nil) }.keyboardShortcut("k", modifiers: .command)
                        .font(.caption).buttonStyle(.plain).foregroundStyle(.secondary)
                }
                .padding(.horizontal, 8)
                if open { palette.motionTransition(.presence) }
                Spacer(minLength: 0)
            }
            .background(.quaternary.opacity(0.35), in: RoundedRectangle(cornerRadius: 10))
            .onHover { inside in if inside { task?.cancel() } else if open { schedule(close: true) } }
        }
    }

    private var palette: some View {
        VStack(alignment: .leading, spacing: 4) {
            TextField(scope.map { "Search \($0)" } ?? "Search all commands", text: $query)
                .textFieldStyle(.roundedBorder).focused($focused)
                .onChange(of: query) { _, _ in sel = 0 }
                .onSubmit { run() }
            VStack(spacing: 0) {
                ForEach(Array(rows.enumerated()), id: \.element.1) { n, row in
                    HStack { Text(row.1).font(.callout); Spacer(); Text(row.0).font(.caption2).foregroundStyle(.secondary) }
                        .padding(.horizontal, 8).padding(.vertical, 6).reportFrame(n, in: "cmd")
                        .transition(reduce ? .identity : .megaBlur)
                }
            }
            .background { MegaPlate(frame: frames[AnyHashable(sel)]) }
            .coordinateSpace(name: "cmd")
            .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
            .animation(reduce ? nil : .motion(.soft), value: rows.map(\.1))
        }
        .padding(10)
        .background(.background, in: RoundedRectangle(cornerRadius: 10))
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.05)))
        .padding(.horizontal, 8)
        .onKeyPress(.downArrow) { sel = min(max(0, rows.count - 1), sel + 1); return .handled }
        .onKeyPress(.upArrow) { sel = max(0, sel - 1); return .handled }
        .onKeyPress(.escape) { hide(); return .handled }
    }

    private func hover(_ g: String) {
        if open { show(g); return }
        task = Task {
            try? await Task.sleep(for: .milliseconds(120))
            guard !Task.isCancelled else { return }
            show(g)
        }
    }
    private func show(_ g: String?) {
        withMotion(.base, reduceMotion: reduce) { scope = g; open = true; sel = 0 }
        focused = true
    }
    private func hide() { withMotion(.snap, reduceMotion: reduce) { open = false; query = "" } }
    private func run() { if rows.indices.contains(sel) { ran = "Ran: \(rows[sel].1)" }; hide() }
    private func schedule(close: Bool) {
        task = Task {
            try? await Task.sleep(for: .milliseconds(220))
            guard !Task.isCancelled else { return }
            hide()
        }
    }
}
