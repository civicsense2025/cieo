import Cieo
import SwiftUI

/// An option inside `SelectMenu`.
public struct SelectOption<Value: Hashable & Sendable>: Identifiable, Equatable, Sendable {
    public let value: Value
    public let label: String
    public let detail: String?
    public let isDisabled: Bool
    public var id: Value { value }

    public init(value: Value, label: String, detail: String? = nil, isDisabled: Bool = false) {
        self.value = value
        self.label = label
        self.detail = detail
        self.isDisabled = isDisabled
    }
}

/// Searchable, keyboard-navigable single- and multi-option picker (`Select` / `Combobox` parity) with `FieldChrome` trigger.
public struct SelectMenu<Value: Hashable & Sendable>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentStrings) private var strings
    @Environment(\.componentMotion) private var motionConfig

    private let title: Text
    private let placeholder: String
    private let options: [SelectOption<Value>]
    private let searchable: Bool
    private let error: Text?
    private let isMulti: Bool
    private let selectedSet: () -> Set<Value>
    private let toggleValue: (Value) -> Void

    @State private var isExpanded: Bool
    @State private var query = ""
    @State private var highlighted: Value?
    @State private var selectionTicks = 0

    public init(
        _ title: LocalizedStringKey,
        selection: Binding<Value>,
        options: [SelectOption<Value>],
        placeholder: String = "Select…",
        searchable: Bool = false,
        initiallyExpanded: Bool = false,
        error: Text? = nil
    ) {
        self.title = Text(title)
        self.placeholder = placeholder
        self.options = options
        self.searchable = searchable
        self.error = error
        self.isMulti = false
        self.selectedSet = { [selection.wrappedValue] }
        self.toggleValue = { selection.wrappedValue = $0 }
        _isExpanded = State(initialValue: initiallyExpanded)
        _highlighted = State(initialValue: Self.resolvedHighlight(current: selection.wrappedValue, in: options))
    }

    public init(
        _ title: LocalizedStringKey,
        selections: Binding<Set<Value>>,
        options: [SelectOption<Value>],
        placeholder: String = "Select…",
        searchable: Bool = false,
        initiallyExpanded: Bool = false,
        error: Text? = nil
    ) {
        self.title = Text(title)
        self.placeholder = placeholder
        self.options = options
        self.searchable = searchable
        self.error = error
        self.isMulti = true
        self.selectedSet = { selections.wrappedValue }
        self.toggleValue = { candidate in
            if selections.wrappedValue.contains(candidate) {
                selections.wrappedValue.remove(candidate)
            } else {
                selections.wrappedValue.insert(candidate)
            }
        }
        _isExpanded = State(initialValue: initiallyExpanded)
        _highlighted = State(initialValue: Self.moveHighlight(current: nil, delta: 1, in: options))
    }

    public var body: some View {
        let chosen = selectedSet()
        let summaryText = summary(for: chosen)
        VStack(alignment: .leading, spacing: metrics.compact) {
            title
                .font(typography.fieldLabel)
                .foregroundStyle(theme.foreground)
                .accessibilityHidden(true)
            triggerButton(summaryText: summaryText, hasValue: !chosen.isEmpty)
            if isExpanded {
                popupList(chosen: chosen)
            }
            if let error {
                StatusLabel(error, icon: .error, tone: .danger)
            }
        }
        .onChange(of: query) { _, nextQuery in
            let visible = Self.filterOptions(options, query: nextQuery)
            highlighted = Self.resolvedHighlight(current: highlighted, in: visible)
        }
        .onKeyPress(.downArrow) {
            if !isExpanded { isExpanded = true }
            highlighted = Self.moveHighlight(current: highlighted, delta: 1, in: filteredOptions)
            return .handled
        }
        .onKeyPress(.upArrow) {
            if !isExpanded { isExpanded = true }
            highlighted = Self.moveHighlight(current: highlighted, delta: -1, in: filteredOptions)
            return .handled
        }
        .onKeyPress(.return) {
            guard isExpanded, let current = highlighted else { return .ignored }
            commit(current)
            return .handled
        }
        .onKeyPress(.escape) {
            guard isExpanded else { return .ignored }
            isExpanded = false
            return .handled
        }
        .motionAnimation(motionConfig.layout, value: isExpanded)
        .motionHaptic(.selection, trigger: selectionTicks)
        .accessibilityElement(children: .contain)
    }

    private func triggerButton(summaryText: String, hasValue: Bool) -> some View {
        Button {
            isExpanded.toggle()
        } label: {
            HStack(spacing: metrics.compact) {
                Text(verbatim: summaryText)
                    .font(typography.field)
                    .foregroundStyle(hasValue ? theme.foreground : theme.secondary)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: .leading)
                InlineGlyph { icons(.disclosure) }
                    .font(typography.glyph)
                    .foregroundStyle(theme.secondary)
                    .rotationEffect(.degrees(isExpanded ? 90 : 0)) // literal-ok: chevron disclosure quarter-turn
                    .motionAnimation(motionConfig.press, value: isExpanded)
                    .accessibilityHidden(true)
            }
            .fieldChrome(appearance: ControlAppearance(border: error != nil ? theme.danger : theme.border))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(title)
        .accessibilityValue(Text(verbatim: summaryText))
    }

    private func popupList(chosen: Set<Value>) -> some View {
        let visible = filteredOptions
        return VStack(alignment: .leading, spacing: 0) { // literal-ok: flush listbox container
            if searchable {
                HStack(spacing: metrics.compact) {
                    InlineGlyph { icons(.search) }
                        .foregroundStyle(theme.secondary)
                        .accessibilityHidden(true)
                    TextField(strings.searchPlaceholder, text: $query)
                        .textFieldStyle(.plain)
                        .font(typography.field)
                        .onSubmit { if let current = highlighted { commit(current) } }
                }
                .padding(.horizontal, metrics.medium)
                .frame(minHeight: metrics.controlHeight)
                Rectangle()
                    .fill(theme.border)
                    .frame(height: metrics.hairline)
                    .accessibilityHidden(true)
            }
            if visible.isEmpty {
                Text(verbatim: strings.commandEmpty)
                    .font(typography.detail)
                    .foregroundStyle(theme.secondary)
                    .padding(metrics.medium)
            } else {
                VStack(alignment: .leading, spacing: metrics.tight) {
                    ForEach(visible) { option in
                        optionRow(option, isSelected: chosen.contains(option.value))
                    }
                }
                .padding(metrics.compact)
            }
        }
        .background(theme.raised, in: .rect(cornerRadius: metrics.corner))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
        .floatingShadow()
    }

    private func optionRow(_ option: SelectOption<Value>, isSelected: Bool) -> some View {
        let isHighlighted = highlighted == option.value && !option.isDisabled
        return Button {
            guard !option.isDisabled else { return }
            commit(option.value)
        } label: {
            HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
                InlineGlyph { icons(isSelected ? .selected : .unselected) }
                    .foregroundStyle(isSelected ? theme.accent : theme.subtle)
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: metrics.tight) {
                    Text(verbatim: option.label)
                        .font(typography.body)
                        .foregroundStyle(option.isDisabled ? theme.subtle : theme.foreground)
                        .fixedSize(horizontal: false, vertical: true)
                    if let detail = option.detail {
                        Text(verbatim: detail)
                            .font(typography.detail)
                            .foregroundStyle(theme.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                Spacer(minLength: 0)
            }
            .padding(.horizontal, metrics.medium)
            .padding(.vertical, metrics.compact)
            .frame(maxWidth: .infinity, minHeight: metrics.touchTarget, alignment: .leading)
            .background(isHighlighted ? theme.selection : .clear, in: .rect(cornerRadius: metrics.cornerSmall))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(option.isDisabled)
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }

    private var filteredOptions: [SelectOption<Value>] {
        Self.filterOptions(options, query: query)
    }

    private func commit(_ value: Value) {
        guard Self.canCommit(value, in: filteredOptions) else { return }
        highlighted = value
        toggleValue(value)
        selectionTicks += 1
        if !isMulti { isExpanded = false }
    }

    public static func resolvedHighlight(current: Value?, in options: [SelectOption<Value>]) -> Value? {
        if let current, options.contains(where: { $0.value == current && !$0.isDisabled }) {
            return current
        }
        return moveHighlight(current: nil, delta: 1, in: options)
    }

    public static func canCommit(_ value: Value, in visibleOptions: [SelectOption<Value>]) -> Bool {
        visibleOptions.contains { $0.value == value && !$0.isDisabled }
    }

    private func summary(for chosen: Set<Value>) -> String {
        let labels = options.filter { chosen.contains($0.value) }.map(\.label)
        return labels.isEmpty ? placeholder : labels.joined(separator: ", ")
    }

    public static func filterOptions(_ options: [SelectOption<Value>], query: String) -> [SelectOption<Value>] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !trimmed.isEmpty else { return options }
        return options.filter { option in
            option.label.lowercased().contains(trimmed)
                || (option.detail?.lowercased().contains(trimmed) ?? false)
        }
    }

    public static func moveHighlight(current: Value?, delta: Int, in options: [SelectOption<Value>]) -> Value? {
        let enabled = options.filter { !$0.isDisabled }
        guard !enabled.isEmpty else { return nil }
        guard let current, let idx = enabled.firstIndex(where: { $0.value == current }) else {
            return delta >= 0 ? enabled.first?.value : enabled.last?.value
        }
        guard delta != 0 else { return current }
        let count = enabled.count
        return enabled[((idx + delta) % count + count) % count].value
    }
}
