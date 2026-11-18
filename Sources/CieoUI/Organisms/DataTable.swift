import Cieo
import Foundation
import SwiftUI

public enum SortDirection: String, CaseIterable, Equatable, Sendable {
    case ascending
    case descending

    public var toggled: SortDirection {
        self == .ascending ? .descending : .ascending
    }
}

public struct DataTableSort: Equatable, Sendable {
    public var columnID: String
    public var direction: SortDirection

    public init(columnID: String, direction: SortDirection = .ascending) {
        self.columnID = columnID
        self.direction = direction
    }
}

/// Typed column definition for `DataTable`.
public struct DataTableColumn<Row: Identifiable>: Identifiable {
    public let id: String
    public let title: String
    public let alignment: Alignment
    public let comparator: ((Row, Row) -> ComparisonResult)?
    public let makeCell: @MainActor (Row) -> AnyView

    public init<Cell: View>(
        id: String,
        title: String,
        alignment: Alignment = .leading,
        comparator: ((Row, Row) -> ComparisonResult)? = nil,
        @ViewBuilder cell: @escaping @MainActor (Row) -> Cell
    ) {
        self.id = id
        self.title = title
        self.alignment = alignment
        self.comparator = comparator
        self.makeCell = { AnyView(cell($0)) }
    }

    public static func text(
        id: String,
        title: String,
        alignment: Alignment = .leading,
        value: @escaping (Row) -> String
    ) -> DataTableColumn<Row> {
        DataTableColumn(
            id: id,
            title: title,
            alignment: alignment,
            comparator: { lhs, rhs in value(lhs).localizedStandardCompare(value(rhs)) }
        ) { row in
            Text(verbatim: value(row))
        }
    }

    public static func comparable<V: Comparable>(
        id: String,
        title: String,
        alignment: Alignment = .trailing,
        value: @escaping (Row) -> V,
        format: @escaping (V) -> String
    ) -> DataTableColumn<Row> {
        DataTableColumn(
            id: id,
            title: title,
            alignment: alignment,
            comparator: { lhs, rhs in
                let a = value(lhs), b = value(rhs)
                return a < b ? .orderedAscending : (a > b ? .orderedDescending : .orderedSame)
            }
        ) { row in
            Text(verbatim: format(value(row))).monospacedDigit()
        }
    }
}

/// Structured multi-column `DataTable` organism with sortable column headers, row selection, and an empty state slot.
public struct DataTable<Row: Identifiable, EmptyContent: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentStrings) private var strings
    @Environment(\.componentMotion) private var motionConfig

    private let rows: [Row]
    private let columns: [DataTableColumn<Row>]
    private let selection: Binding<Set<Row.ID>>?
    private let externalSort: Binding<DataTableSort?>?
    private let emptyContent: EmptyContent

    @State private var ownedSort: DataTableSort?
    @State private var interactionTicks = 0

    public init(
        rows: [Row],
        columns: [DataTableColumn<Row>],
        selection: Binding<Set<Row.ID>>? = nil,
        sort: Binding<DataTableSort?>? = nil,
        @ViewBuilder emptyState: () -> EmptyContent
    ) {
        self.rows = rows
        self.columns = columns
        self.selection = selection
        self.externalSort = sort
        self.emptyContent = emptyState()
    }

    private var activeSort: DataTableSort? {
        externalSort?.wrappedValue ?? ownedSort
    }

    public var body: some View {
        let ordered = Self.sortedRows(rows, by: activeSort, columns: columns)
        VStack(alignment: .leading, spacing: 0) { // literal-ok: flush table header and body dividers
            headerBar
            Rectangle()
                .fill(theme.border)
                .frame(height: metrics.hairline)
                .accessibilityHidden(true)
            if ordered.isEmpty {
                emptyContent
                    .padding(metrics.standard)
                    .frame(maxWidth: .infinity)
            } else {
                ForEach(Array(ordered.enumerated()), id: \.element.id) { index, row in
                    if index > 0 {
                        Rectangle()
                            .fill(theme.border)
                            .frame(height: metrics.hairline)
                            .accessibilityHidden(true)
                    }
                    tableRow(row)
                }
            }
        }
        .background(theme.surface, in: .rect(cornerRadius: metrics.cornerSurface))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.cornerSurface)
        .motionAnimation(motionConfig.layout, value: activeSort)
        .motionHaptic(.selection, trigger: interactionTicks)
        .accessibilityElement(children: .contain)
    }

    private var headerBar: some View {
        HStack(spacing: metrics.medium) {
            if selection != nil {
                Spacer()
                    .frame(width: metrics.ring)
                    .accessibilityHidden(true)
            }
            ForEach(columns) { column in
                headerCell(column)
            }
        }
        .padding(.horizontal, metrics.standard)
        .frame(minHeight: metrics.touchTarget)
        .background(theme.surfaceLow)
    }

    @ViewBuilder
    private func headerCell(_ column: DataTableColumn<Row>) -> some View {
        let isSorted = activeSort?.columnID == column.id
        let direction = activeSort?.direction ?? .ascending
        if column.comparator != nil {
            Button {
                cycleSort(for: column.id)
            } label: {
                HStack(spacing: metrics.tight) {
                    Text(verbatim: column.title)
                        .font(typography.strongDetail)
                        .foregroundStyle(isSorted ? theme.accent : theme.secondary)
                    if isSorted {
                        InlineGlyph { icons(.disclosure) }
                            .font(typography.smallGlyph)
                            .foregroundStyle(theme.accent)
                            .rotationEffect(.degrees(direction == .ascending ? -90 : 90)) // literal-ok: sort arrow orientation
                            .accessibilityHidden(true)
                    }
                }
                .frame(maxWidth: .infinity, minHeight: metrics.touchTarget, alignment: column.alignment)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityAddTraits(.isHeader)
            .accessibilityValue(
                Text(verbatim: isSorted ? (direction == .ascending ? strings.sortAscending : strings.sortDescending) : strings.sortUnsorted)
            )
        } else {
            Text(verbatim: column.title)
                .font(typography.strongDetail)
                .foregroundStyle(theme.secondary)
                .frame(maxWidth: .infinity, alignment: column.alignment)
                .accessibilityAddTraits(.isHeader)
        }
    }

    private func tableRow(_ row: Row) -> some View {
        let isSelected = selection?.wrappedValue.contains(row.id) ?? false
        let content = HStack(spacing: metrics.medium) {
            if selection != nil {
                InlineGlyph { icons(isSelected ? .selected : .unselected) }
                    .foregroundStyle(isSelected ? theme.accent : theme.subtle)
                    .frame(width: metrics.ring)
                    .accessibilityHidden(true)
            }
            ForEach(columns) { column in
                column.makeCell(row)
                    .font(typography.body)
                    .foregroundStyle(theme.foreground)
                    .frame(maxWidth: .infinity, alignment: column.alignment)
            }
        }
        .padding(.horizontal, metrics.standard)
        .padding(.vertical, metrics.compact)
        .frame(minHeight: metrics.touchTarget)
        .background(isSelected ? theme.selection : .clear)

        return Group {
            if let selection {
                Button {
                    if selection.wrappedValue.contains(row.id) {
                        selection.wrappedValue.remove(row.id)
                    } else {
                        selection.wrappedValue.insert(row.id)
                    }
                    interactionTicks += 1
                } label: {
                    content.contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(isSelected ? [.isSelected] : [])
            } else {
                content
            }
        }
    }

    private func cycleSort(for columnID: String) {
        let next: DataTableSort
        if let current = activeSort, current.columnID == columnID {
            next = DataTableSort(columnID: columnID, direction: current.direction.toggled)
        } else {
            next = DataTableSort(columnID: columnID, direction: .ascending)
        }
        if let externalSort {
            externalSort.wrappedValue = next
        } else {
            ownedSort = next
        }
        interactionTicks += 1
    }

    public static func sortedRows(
        _ rows: [Row],
        by sort: DataTableSort?,
        columns: [DataTableColumn<Row>]
    ) -> [Row] {
        guard let sort,
              let column = columns.first(where: { $0.id == sort.columnID }),
              let cmp = column.comparator else {
            return rows
        }
        return rows.sorted { lhs, rhs in
            let order = cmp(lhs, rhs)
            return sort.direction == .ascending
                ? order == .orderedAscending
                : order == .orderedDescending
        }
    }
}

public extension DataTable where EmptyContent == StatePanel<EmptyView> {
    init(
        rows: [Row],
        columns: [DataTableColumn<Row>],
        selection: Binding<Set<Row.ID>>? = nil,
        sort: Binding<DataTableSort?>? = nil
    ) {
        self.init(rows: rows, columns: columns, selection: selection, sort: sort) {
            StatePanel("No rows available")
        }
    }
}
