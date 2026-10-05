import SwiftUI
import Cieo

public struct BulkBarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "bulkbar", category: "Status and records", name: "Bulk selection bar",
        summary: "Selecting the first row opens a slot above the table: its height springs open and pushes the rows down, then the bar rises into it 50ms later with the count in rolling digits. The header checkbox morphs between empty, check and a dash for mixed. Delete removes the selected rows top-down, 100ms apart: each row fades, then its height collapses, and the count rolls down; the bar leaves only after the last row has gone. Archive swaps each status chip and Clear releases the rows the same way.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Row: Identifiable { let id: Int; let title: String; var archived = false }
    @State private var rows = (1...6).map { Row(id: $0, title: ["Home", "Pricing", "About", "Blog", "Docs", "Contact"][$0 - 1]) }
    @State private var selected: Set<Int> = []
    public init() {}

    private var allState: String { selected.isEmpty ? "off" : selected.count == rows.count ? "on" : "mixed" }

    public var body: some View {
        AtomStage(hint: "Select rows, then Archive, Delete or Clear") {
            VStack(spacing: 6) {
                HStack {
                    Text("Pages").font(.headline)
                    Spacer()
                    Button("Reset") { reset() }.buttonStyle(AgPress())
                }
                AgReveal(open: !selected.isEmpty) {
                    HStack {
                        HStack(spacing: 2) { RollingDigits(selected.count); Text("selected") }.font(.callout.weight(.medium))
                        Spacer()
                        Button("Archive") { archive() }.buttonStyle(AgPress())
                        Button("Delete") { delete() }.buttonStyle(AgPress(tone: .danger))
                        Button("Clear") { clear() }.buttonStyle(AgPress())
                    }
                    .padding(8).background(Color.accentColor.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                }
                HStack {
                    Button { toggleAll() } label: {
                        Image(systemName: allState == "on" ? "checkmark.square.fill" : allState == "mixed" ? "minus.square.fill" : "square")
                            .contentTransition(.symbolEffect(.replace))
                    }.buttonStyle(.plain).accessibilityLabel("Select all").accessibilityValue(allState)
                    Text("Title").frame(maxWidth: .infinity, alignment: .leading); Text("Status")
                }.font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                ForEach(rows) { r in
                    HStack {
                        Button { toggle(r.id) } label: { Image(systemName: selected.contains(r.id) ? "checkmark.square.fill" : "square") }
                            .buttonStyle(.plain).accessibilityLabel(r.title).accessibilityAddTraits(selected.contains(r.id) ? .isSelected : [])
                        Text(r.title).frame(maxWidth: .infinity, alignment: .leading)
                        AgChip(text: r.archived ? "Archived" : "Published", tone: r.archived ? .neutral : .success)
                    }
                    .font(.callout).padding(.vertical, 2)
                    .transition(reduce ? .identity : .opacity.combined(with: .scale(scale: 1, anchor: .top)))
                }
                if rows.isEmpty { Text("No pages left. Reset brings them back.").font(.caption).foregroundStyle(.secondary) }
            }
            .frame(maxWidth: 420)
            .animation(reduce ? nil : .motion(.base), value: rows.count)
        }
    }

    private func toggle(_ id: Int) { withMotion(.base, reduceMotion: reduce) { if !selected.insert(id).inserted { selected.remove(id) } } }
    private func toggleAll() { withMotion(.base, reduceMotion: reduce) { selected = allState == "on" ? [] : Set(rows.map(\.id)) } }
    private func archive() { withMotion(.base, reduceMotion: reduce) { for i in rows.indices where selected.contains(rows[i].id) { rows[i].archived = true } } }
    private func clear() {
        Task { @MainActor in
            for r in rows where selected.contains(r.id) {
                withMotion(.base, reduceMotion: reduce) { _ = selected.remove(r.id) }
                try? await Task.sleep(nanoseconds: 100_000_000)
            }
        }
    }
    private func delete() {
        let ids = rows.map(\.id).filter(selected.contains)
        Task { @MainActor in
            for id in ids {
                withMotion(.base, reduceMotion: reduce) { rows.removeAll { $0.id == id }; selected.remove(id) }
                try? await Task.sleep(nanoseconds: 100_000_000)
            }
        }
    }
    private func reset() {
        withMotion(.base, reduceMotion: reduce) {
            rows = (1...6).map { Row(id: $0, title: ["Home", "Pricing", "About", "Blog", "Docs", "Contact"][$0 - 1]) }
            selected = []
        }
    }
}
