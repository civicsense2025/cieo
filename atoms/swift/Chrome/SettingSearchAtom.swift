import SwiftUI

/// Settings search: filters in place, heights spring, arrows highlight.
public struct SettingSearchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "settingsearch", category: "Chrome", name: "Setting Search", summary: "Settings search: filters in place, heights spring, arrows highlight.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var query = ""
    @State private var highlight = 0
    @State private var jumped: String? = nil
    private let data = [("Appearance", ["Theme", "Font size"]), ("Privacy", ["Block trackers", "Clear history"]), ("Sync", ["Sync tabs", "Manage account"])]

    public init() {}
    private var flat: [(sec: String, row: String)] {
        data.flatMap { s in s.1.map { (s.0, $0) } }
    }
    private var matches: [(sec: String, row: String)] {
        let s = query.trimmingCharacters(in: .whitespaces).lowercased()
        return s.isEmpty ? flat : flat.filter { $0.row.lowercased().contains(s) || $0.sec.lowercased().contains(s) }
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Settings search").font(.system(size: 15, weight: .semibold))
            Text("Filters in place · misses blur out · ↑↓ highlights")
                .font(.system(size: 12.5)).foregroundStyle(.secondary).monospacedDigit()
            VStack(spacing: 8) {
                TextField("Search settings…", text: $query).textFieldStyle(.plain).padding(10).background(.quaternary.opacity(0.5), in: .rect(cornerRadius: 10))
                    .font(.system(size: 13.5)).frame(minHeight: 36)
                ForEach(data.map(\.0), id: \.self) { sec in
                    let rows = matches.filter { $0.sec == sec }
                    if !rows.isEmpty {
                        VStack(alignment: .leading, spacing: 0) {
                            Text(sec).font(.system(size: 13, weight: .semibold))
                                .padding(.horizontal, 10).padding(.vertical, 4)
                            ForEach(Array(rows.enumerated()), id: \.offset) { _, r in
                                Button { jumped = r.row } label: {
                                    Text(r.row).font(.system(size: 13.5))
                                        .frame(maxWidth: .infinity, minHeight: 40, alignment: .leading)
                                        .padding(.horizontal, 10)
                                }
                                .buttonStyle(.plain)
                                .transition(.opacity.combined(with: .move(edge: .top)))
                            }
                        }
                        .padding(6)
                        .background(.background, in: RoundedRectangle(cornerRadius: 10))
                        .transition(.opacity)
                    }
                }
                Text(jumped.map { "Jumped to “\($0)” ✓" } ?? "\(matches.count) of \(flat.count) settings")
                    .font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit()
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(15)
            .frame(maxWidth: 440)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
            .animation(reduce ? nil : .spring(response: 0.3), value: matches.count)
        }
        .focusable(true)
        .escapeKey { query = ""; jumped = nil }
        .directionKeys { dir in
            guard !matches.isEmpty else { return }
            if dir == .down { highlight = (highlight + 1) % matches.count }
            else if dir == .up { highlight = (highlight + matches.count - 1) % matches.count }
        }
    }
}
