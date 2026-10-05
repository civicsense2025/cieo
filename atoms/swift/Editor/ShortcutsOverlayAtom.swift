import SwiftUI
import MotionKit

public struct ShortcutsOverlayAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "shortcuts", category: "Editor", name: "Shortcuts overlay",
        summary: "Pressing ? dims the canvas and lifts the sheet in. The rows then rise in one after another, 35ms apart. Typing filters in place: non-matching rows fade out, group headings leave with their last row, and the remaining rows glide up. Escape closes it and hands focus back.")

    private let groups: [(String, [(String, String)])] = [
        ("Navigate", [("Go to pages", "G P"), ("Search", "/"), ("Next block", "J")]),
        ("Edit", [("Duplicate block", "⌘ D"), ("Undo", "⌘ Z"), ("Delete block", "⌫")]),
        ("Publish", [("Preview", "⌘ P"), ("Publish changes", "⌘ ⏎")])]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var rowsIn = false
    @State private var query = ""
    @FocusState private var focused: Bool
    public init() {}

    private var shown: [(String, [(String, String)])] {
        groups.map { g in (g.0, g.1.filter { query.isEmpty || $0.0.localizedCaseInsensitiveContains(query) }) }.filter { !$0.1.isEmpty }
    }

    public var body: some View {
        AtomStage(hint: "Press ? or the button; Esc closes") {
            ZStack {
                VStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 10).fill(.quaternary.opacity(0.6)).frame(height: 60)
                    RoundedRectangle(cornerRadius: 10).fill(.quaternary.opacity(0.4)).frame(height: 60)
                    Button { toggle(true) } label: { Label("Keyboard shortcuts", systemImage: "keyboard") }.buttonStyle(.bordered).controlSize(.small)
                }.padding(16)
                if open {
                    Color.black.opacity(0.35).transition(.opacity).onTapGesture { toggle(false) }
                    sheet.transition(reduce ? .identity : .motionPresence)
                }
            }
            .frame(width: 380, height: 280).clipShape(RoundedRectangle(cornerRadius: 14)).background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14))
            .focusable().onKeyPress("?") { toggle(true); return .handled }.onKeyPress(.escape) { toggle(false); return .handled }
        }
    }

    private var sheet: some View {
        var index = 0
        return VStack(alignment: .leading, spacing: 6) {
            HStack { Text("Shortcuts").font(.subheadline.weight(.semibold)); Spacer(); Button { toggle(false) } label: { Image(systemName: "xmark") }.buttonStyle(.plain).accessibilityLabel("Close") }
            TextField("Filter", text: $query).textFieldStyle(.roundedBorder).font(.footnote).focused($focused)
            VStack(alignment: .leading, spacing: 0) {
                ForEach(shown, id: \.0) { g in
                    Text(g.0).font(.caption.weight(.semibold)).foregroundStyle(.secondary).padding(.top, 6).transition(.opacity)
                    ForEach(g.1, id: \.0) { r in
                        let k = { index += 1; return index }()
                        HStack { Text(r.0).font(.footnote); Spacer(); Text(r.1).font(.caption.monospaced()).foregroundStyle(.secondary) }.frame(height: 26)
                            .opacity(rowsIn ? 1 : 0).offset(y: rowsIn ? 0 : 6)
                            .animation(reduce ? nil : .motion(.base).delay(rowsIn ? 0.1 + Double(k) * 0.035 : 0), value: rowsIn).transition(.opacity)
                    }
                }
            }
            .animation(reduce ? nil : .motion(.base), value: query)
            Spacer(minLength: 0)
        }
        .padding(14).frame(width: 300, height: 250).background(.background, in: RoundedRectangle(cornerRadius: 14)).shadow(color: .black.opacity(0.2), radius: 14, y: 4)
    }

    private func toggle(_ v: Bool) {
        if v { query = ""; withMotion(.base, reduceMotion: reduce) { open = true }; DispatchQueue.main.async { rowsIn = true; focused = true } }
        else { rowsIn = false; withMotion(.snap, reduceMotion: reduce) { open = false } }
    }
}
