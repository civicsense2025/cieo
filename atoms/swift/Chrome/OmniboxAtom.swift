import SwiftUI

/// Omnibox: list height springs to count, matches spring in, plate trails edges.
public struct OmniboxAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "omnibox", category: "Chrome", name: "Omnibox", summary: "Omnibox: list height springs to count, matches spring in, plate trails edges.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var query = "git"
    @State private var highlight = 0
    @State private var opened: String? = nil
    private let urls = ["example.com/code", "git-scm.com/docs", "gitlab.com/explore", "gitter.im/home", "snippets.example.com"]

    public init() {}
    private var matches: [String] {
        let s = query.trimmingCharacters(in: .whitespaces).lowercased()
        return s.isEmpty ? urls : urls.filter { $0.lowercased().contains(s) }
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Omnibox").font(.system(size: 15, weight: .semibold))
            Text("Height springs to count · ↑↓ + Enter · Esc clears")
                .font(.system(size: 12.5)).foregroundStyle(.secondary)
            VStack(spacing: 8) {
                TextField("Address", text: $query).textFieldStyle(.plain).padding(10).background(.quaternary.opacity(0.5), in: .rect(cornerRadius: 10))
                    .font(.system(size: 13.5)).frame(minHeight: 36)
                VStack(spacing: 0) {
                    ForEach(Array(matches.enumerated()), id: \.offset) { i, u in
                        Button { opened = u } label: {
                            HStack(spacing: 8) {
                                Text("⌕").frame(width: 22, height: 22)
                                    .background(Color.primary.opacity(0.07), in: RoundedRectangle(cornerRadius: 6))
                                    .font(.system(size: 12))
                                Text(u).font(.system(size: 13.5)).lineLimit(1)
                                Spacer()
                            }
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
                Text(opened.map { "Opened “\($0)” ✓" } ?? "\(matches.count) of \(urls.count) matches")
                    .font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit()
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(15)
            .frame(maxWidth: 440)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
        }
        .focusable(true)
        .escapeKey { query = ""; opened = nil }
        .directionKeys { dir in
            guard !matches.isEmpty else { return }
            if dir == .down { highlight = (highlight + 1) % matches.count }
            else if dir == .up { highlight = (highlight + matches.count - 1) % matches.count }
        }
    }
}
