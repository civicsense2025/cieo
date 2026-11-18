import Cieo
import SwiftUI

/// A single command in `CommandPaletteView`.
public struct CommandItem: Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let shortcut: String?
    public let icon: ComponentIcon?
    public let keywords: [String]
    public let isDisabled: Bool

    public init(
        id: String,
        title: String,
        shortcut: String? = nil,
        icon: ComponentIcon? = nil,
        keywords: [String] = [],
        isDisabled: Bool = false
    ) {
        self.id = id
        self.title = title
        self.shortcut = shortcut
        self.icon = icon
        self.keywords = keywords
        self.isDisabled = isDisabled
    }
}

/// A named group of commands in `CommandPaletteView`.
public struct CommandGroup: Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let items: [CommandItem]

    public init(id: String, title: String, items: [CommandItem]) {
        self.id = id
        self.title = title
        self.items = items
    }
}

/// Searchable grouped command list with keyboard navigation and Cieo `EdgesIndicator` sliding highlight.
public struct CommandPaletteView: View {
    private static var coordinateSpace: String { "command-palette-list" }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentStrings) private var strings
    @Environment(\.componentMotion) private var motionConfig
    @Environment(\.renderPolicy) private var policy

    @Binding private var isPresented: Bool
    @State private var query = ""
    @State private var highlightedID: String?
    @State private var rowFrames: [AnyHashable: CGRect] = [:]
    private let groups: [CommandGroup]
    private let onSelect: (String) -> Void

    public init(
        isPresented: Binding<Bool>,
        groups: [CommandGroup],
        onSelect: @escaping (String) -> Void
    ) {
        _isPresented = isPresented
        self.groups = groups
        self.onSelect = onSelect
        _highlightedID = State(initialValue: Self.moveHighlight(current: nil, delta: 1, in: groups))
    }

    public var body: some View {
        if isPresented {
            VStack(spacing: 0) { // literal-ok: flush stack, search bar and command list share a divider
                searchBar
                Rectangle()
                    .fill(theme.border)
                    .frame(height: metrics.hairline)
                    .accessibilityHidden(true)
                resultsBody
            }
            .background(theme.raised, in: .rect(cornerRadius: metrics.cornerSurface))
            .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.cornerSurface)
            .floatingShadow()
            .onChange(of: query) { _, newQuery in
                let filtered = Self.filterGroups(groups, query: newQuery)
                let enabledIDs = Set(filtered.flatMap(\.items).filter { !$0.isDisabled }.map(\.id))
                if let current = highlightedID, enabledIDs.contains(current) { return }
                highlightedID = Self.moveHighlight(current: nil, delta: 1, in: filtered)
            }
            .onKeyPress(.downArrow) {
                highlightedID = Self.moveHighlight(current: highlightedID, delta: 1, in: filteredGroups)
                return .handled
            }
            .onKeyPress(.upArrow) {
                highlightedID = Self.moveHighlight(current: highlightedID, delta: -1, in: filteredGroups)
                return .handled
            }
            .onKeyPress(.return) {
                selectHighlighted()
                return .handled
            }
            .onKeyPress(.escape) {
                isPresented = false
                return .handled
            }
            .motionHaptic(.selection, trigger: highlightedID)
            .accessibilityElement(children: .contain)
        }
    }

    private var filteredGroups: [CommandGroup] {
        Self.filterGroups(groups, query: query)
    }

    private var searchBar: some View {
        HStack(spacing: metrics.compact) {
            InlineGlyph { icons(.search) }
                .foregroundStyle(theme.secondary)
                .accessibilityHidden(true)
            TextField(strings.commandSearchPlaceholder, text: $query)
                .textFieldStyle(.plain)
                .font(typography.field)
                .foregroundStyle(theme.foreground)
                .onSubmit { selectHighlighted() }
            if !query.isEmpty {
                Button { query = "" } label: {
                    InlineGlyph { icons(.clear) }
                        .foregroundStyle(theme.secondary)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text(verbatim: strings.searchClear))
            }
        }
        .padding(.horizontal, metrics.standard)
        .frame(minHeight: metrics.controlLarge)
    }

    @ViewBuilder
    private var resultsBody: some View {
        let filtered = filteredGroups
        if filtered.isEmpty {
            Text(verbatim: strings.commandEmpty)
                .font(typography.detail)
                .foregroundStyle(theme.secondary)
                .padding(metrics.standard)
                .frame(maxWidth: .infinity, minHeight: metrics.controlLarge)
        } else {
            let measuredFrame = highlightedID.flatMap { rowFrames[AnyHashable($0)] }
            let listContent = VStack(alignment: .leading, spacing: metrics.tight) {
                ForEach(filtered) { group in
                    Text(verbatim: group.title)
                        .font(typography.strongDetail)
                        .foregroundStyle(theme.secondary)
                        .padding(.horizontal, metrics.medium)
                        .padding(.top, metrics.compact)
                    ForEach(group.items) { item in
                        commandRow(item, fallbackHighlight: measuredFrame == nil)
                    }
                }
            }
            .padding(metrics.compact)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(alignment: .topLeading) {
                if let frame = measuredFrame {
                    EdgesIndicator(
                        frame: frame,
                        shape: RoundedRectangle(cornerRadius: metrics.cornerSmall),
                        style: theme.selection,
                        axis: .vertical,
                        motionEnabled: policy.allowsMotion
                    )
                }
            }
            .coordinateSpace(name: Self.coordinateSpace)
            .onPreferenceChange(FramePreferenceKey.self) { rowFrames = $0 }

            ViewThatFits(in: .vertical) {
                listContent
                ScrollView { listContent }
            }
        }
    }

    private func commandRow(_ item: CommandItem, fallbackHighlight: Bool) -> some View {
        let isHighlighted = item.id == highlightedID && !item.isDisabled
        return Button {
            guard !item.isDisabled else { return }
            highlightedID = item.id
            onSelect(item.id)
            isPresented = false
        } label: {
            HStack(spacing: metrics.compact) {
                if let icon = item.icon {
                    InlineGlyph { icons(icon) }
                        .foregroundStyle(item.isDisabled ? theme.subtle : theme.foreground)
                        .accessibilityHidden(true)
                }
                Text(verbatim: item.title)
                    .font(typography.body)
                    .foregroundStyle(item.isDisabled ? theme.subtle : theme.foreground)
                Spacer(minLength: metrics.compact)
                if let shortcut = item.shortcut {
                    Text(verbatim: shortcut)
                        .font(typography.reference)
                        .foregroundStyle(theme.secondary)
                }
            }
            .padding(.horizontal, metrics.medium)
            .frame(maxWidth: .infinity, minHeight: metrics.touchTarget, alignment: .leading)
            .background(
                fallbackHighlight && isHighlighted ? theme.selection : .clear,
                in: .rect(cornerRadius: metrics.cornerSmall)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(item.isDisabled)
        .reportFrame(item.id, in: Self.coordinateSpace)
        .onHover { hovering in
            if hovering && !item.isDisabled { highlightedID = item.id }
        }
        .motionAnimation(motionConfig.selection, value: isHighlighted)
    }

    private func selectHighlighted() {
        guard let id = highlightedID else { return }
        let allItems = filteredGroups.flatMap(\.items)
        guard let item = allItems.first(where: { $0.id == id }), !item.isDisabled else { return }
        onSelect(id)
        isPresented = false
    }

    public static func filterGroups(_ groups: [CommandGroup], query: String) -> [CommandGroup] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !trimmed.isEmpty else { return groups }
        return groups.compactMap { group in
            let matched = group.items.filter { item in
                item.title.lowercased().contains(trimmed)
                    || item.keywords.contains { $0.lowercased().contains(trimmed) }
            }
            return matched.isEmpty ? nil : CommandGroup(id: group.id, title: group.title, items: matched)
        }
    }

    public static func moveHighlight(current: String?, delta: Int, in groups: [CommandGroup]) -> String? {
        let enabled = groups.flatMap(\.items).filter { !$0.isDisabled }
        guard !enabled.isEmpty else { return nil }
        guard let current, let idx = enabled.firstIndex(where: { $0.id == current }) else {
            return delta >= 0 ? enabled.first?.id : enabled.last?.id
        }
        guard delta != 0 else { return current }
        let count = enabled.count
        let wrapped = ((idx + delta) % count + count) % count
        return enabled[wrapped].id
    }
}
