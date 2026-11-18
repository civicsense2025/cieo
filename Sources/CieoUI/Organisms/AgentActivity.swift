import SwiftUI

/// Ordered live activity feed displaying confirmed `ActivityEntry` items from an `AgentStore` or snapshot slice.
public struct AgentActivity<RowContent: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentStrings) private var strings

    private let entries: [ActivityEntry]
    private let rowContent: (ActivityEntry) -> RowContent

    public init(entries: [ActivityEntry], @ViewBuilder rowContent: @escaping (ActivityEntry) -> RowContent) {
        self.entries = entries
        self.rowContent = rowContent
    }

    @MainActor
    public init(store: AgentStore, @ViewBuilder rowContent: @escaping (ActivityEntry) -> RowContent) {
        self.entries = store.activity
        self.rowContent = rowContent
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.compact) {
            if entries.isEmpty {
                Text(verbatim: strings.agentActivityEmpty)
                    .font(typography.detail)
                    .foregroundStyle(theme.secondary)
                    .padding(metrics.medium)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(theme.surfaceLow, in: .rect(cornerRadius: metrics.corner))
            } else {
                ForEach(entries) { entry in
                    HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
                        Text(verbatim: "#\(entry.seq)")
                            .font(typography.reference)
                            .foregroundStyle(theme.secondary)
                        rowContent(entry)
                    }
                    .padding(.horizontal, metrics.medium)
                    .padding(.vertical, metrics.compact)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(theme.surface, in: .rect(cornerRadius: metrics.cornerSmall))
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(verbatim: strings.agentActivityLabel))
    }
}

public extension AgentActivity where RowContent == DefaultAgentActivityRow {
    init(entries: [ActivityEntry]) {
        self.init(entries: entries) { DefaultAgentActivityRow(entry: $0) }
    }

    @MainActor
    init(store: AgentStore) {
        self.init(entries: store.activity) { DefaultAgentActivityRow(entry: $0) }
    }
}

public struct DefaultAgentActivityRow: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics

    public let entry: ActivityEntry

    public init(entry: ActivityEntry) {
        self.entry = entry
    }

    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
            Text(verbatim: entry.agentId)
                .font(typography.strongDetail)
                .foregroundStyle(theme.foreground)
            Text(verbatim: entry.type)
                .font(typography.reference)
                .foregroundStyle(theme.accent)
            if let ref = entry.ref {
                Text(verbatim: ref)
                    .font(typography.detail)
                    .foregroundStyle(theme.secondary)
            }
        }
    }
}
