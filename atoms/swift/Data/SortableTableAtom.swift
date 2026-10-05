import SwiftUI
import MotionKit

public struct SortableTableAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tablesort", category: "Data", name: "Sortable table",
        summary: "Sorting never re-renders the rows. Each row springs to its new slot with a 20ms stagger, and the header arrow turns on the same spring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Row { let name: String; let views: Int; let age: Int; let ageText: String }
    private let rows = [Row(name: "Pricing", views: 4210, age: 48, ageText: "2d"), Row(name: "About", views: 1380, age: 5, ageText: "5h"),
                        Row(name: "Journal", views: 2960, age: 24, ageText: "1d"), Row(name: "Contact", views: 640, age: 504, ageText: "3w"),
                        Row(name: "Home", views: 8820, age: 1, ageText: "1h")]
    private let columns = ["Page", "Views", "Updated"]
    @State private var slots = (0..<5).map { Track(Double($0) * 36, preset: .base) }
    @State private var rot = Array(repeating: Track(0, preset: .base), count: 3)
    @State private var shown = Array(repeating: Track(0, preset: .base), count: 3)
    @State private var key = -1
    @State private var asc = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Click a column header") {
            VStack(spacing: 0) {
                HStack(spacing: 0) { ForEach(columns.indices, id: \.self) { header($0) } }
                    .padding(.horizontal, 14).frame(height: 36)
                Divider()
                TimelineView(.animation) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    ZStack(alignment: .topLeading) {
                        ForEach(rows.indices, id: \.self) { i in
                            HStack(spacing: 0) {
                                Text(rows[i].name).fontWeight(.medium).frame(maxWidth: .infinity, alignment: .leading)
                                Text(rows[i].views.formatted(.number.locale(Locale(identifier: "en_US")))).monospacedDigit().frame(maxWidth: .infinity, alignment: .trailing)
                                Text("\(rows[i].ageText) ago").monospacedDigit().foregroundStyle(.secondary).frame(maxWidth: .infinity, alignment: .trailing)
                            }
                            .font(.caption).padding(.horizontal, 14).frame(height: 36)
                            .overlay(alignment: .bottom) { Divider() }
                            .offset(y: slots[i].value(at: t))
                        }
                    }
                    .frame(height: 180, alignment: .top)
                }
            }
            .frame(maxWidth: 380).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }

    private func header(_ c: Int) -> some View {
        Button { sort(by: c) } label: {
            TimelineView(.animation) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                HStack(spacing: 4) {
                    Text(columns[c]).font(.caption.weight(.semibold))
                    Image(systemName: "arrow.up").font(.system(size: 10, weight: .bold))
                        .opacity(max(0, min(1, shown[c].value(at: t)))).rotationEffect(.degrees(rot[c].value(at: t)))
                }
                .foregroundStyle(key == c ? AnyShapeStyle(.primary) : AnyShapeStyle(.secondary))
                .frame(maxWidth: .infinity, alignment: c == 0 ? .leading : .trailing)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Sort by \(columns[c])")
        .accessibilityValue(key == c ? (asc ? "ascending" : "descending") : "")
    }

    private func sort(by c: Int) {
        asc = key == c ? !asc : c == 0
        key = c
        for j in columns.indices { DataMotion.retarget(&shown[j], to: j == c ? 1 : 0, reduce: reduce) }
        DataMotion.retarget(&rot[c], to: asc ? 0 : 180, reduce: reduce)
        let order = rows.indices.sorted { a, b in
            let cmp: Bool
            switch c {
            case 0: cmp = rows[a].name.localizedCompare(rows[b].name) == .orderedAscending
            case 1: cmp = rows[a].views < rows[b].views
            default: cmp = rows[a].age < rows[b].age
            }
            return asc ? cmp : !cmp
        }
        for (rank, i) in order.enumerated() { DataMotion.retarget(&slots[i], to: Double(rank) * 36, delay: Double(rank) * 0.02, reduce: reduce) }
    }
}
