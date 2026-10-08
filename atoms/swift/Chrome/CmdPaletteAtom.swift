import SwiftUI

/// Command palette: drops on soft spring, rows spring to slots, highlight edges trail.
public struct CmdPaletteAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "cmdpalette", category: "Chrome", name: "Cmd Palette", summary: "Command palette: drops on soft spring, rows spring to slots, highlight edges trail.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var query = ""
    @State private var highlight = 0
    @State private var ran: String? = nil
    @FocusState private var focused: Bool
    private let cmds = ["Go to file", "Toggle sidebar", "New tab", "Close window"]

    public init() {}
    private var matches: [String] {
        let s = query.trimmingCharacters(in: .whitespaces).lowercased()
        return s.isEmpty ? cmds : cmds.filter { $0.lowercased().contains(s) }
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Command palette").font(.system(size: 15, weight: .semibold)).lineSpacing(22.5)
            Text("Type to filter · ↑↓ move · Enter runs · Esc closes")
                .font(.system(size: 12.5)).foregroundStyle(.secondary).lineSpacing(18.75)
            VStack(spacing: 8) {
                Button(open ? "Close palette" : "Open palette ⌘K") { open.toggle(); ran = nil }
                    .frame(minHeight: 32).frame(maxWidth: .infinity)
                if open {
                    TextField("Type a command…", text: $query)
                        .textFieldStyle(.plain).padding(10).background(.quaternary.opacity(0.5), in: .rect(cornerRadius: 10)).focused($focused)
                        .font(.system(size: 13.5)).frame(minHeight: 36)
                        .onAppear { focused = true }
                    VStack(spacing: 0) {
                        ForEach(Array(matches.enumerated()), id: \.offset) { i, c in
                            Button { ran = c } label: {
                                HStack { Text(c).font(.system(size: 13.5)); Spacer() }
                                    .frame(minHeight: 40).padding(.horizontal, 10)
                                    .background(i == highlight ? Color.primary.opacity(0.08) : .clear)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                            }
                            .buttonStyle(.plain)
                            .transition(.opacity.combined(with: .move(edge: .top)))
                            if i < matches.count - 1 { Divider() }
                        }
                    }
                    .animation(reduce ? nil : .spring(response: 0.28), value: matches.count)
                    Text(ran.map { "Ran “\($0)” ✓" } ?? "\(matches.count) of \(cmds.count) commands")
                        .font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit()
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(15)
            .frame(maxWidth: 440)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
        }
        .lineSpacing(4)
        .focusable(true)
        .escapeKey { open = false }
        .directionKeys { dir in
            guard !matches.isEmpty else { return }
            switch dir {
            case .up: highlight = (highlight + matches.count - 1) % matches.count
            case .down: highlight = (highlight + 1) % matches.count
            default: break
            }
        }
    }
}
