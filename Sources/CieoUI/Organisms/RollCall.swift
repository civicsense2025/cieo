import SwiftUI

/// Everyone by name, grouped (such as by party), each group led by a dot, its name and a count, then its people
/// in as many columns as fit. Alphabetical order is the host's. VoiceOver reads each group's heading, then its people.
public struct RollCall: View {
    public struct Member: Identifiable, Sendable {
        public let id: String
        public let name: String
        public let detail: String?
        public init(id: String, name: String, detail: String? = nil) { self.id = id; self.name = name; self.detail = detail }
    }
    public struct Group: Identifiable, Sendable {
        public let id: String
        public let title: String
        public let color: Color
        public let members: [Member]
        public init(id: String, title: String, color: Color, members: [Member]) {
            self.id = id; self.title = title; self.color = color; self.members = members
        }
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let groups: [Group]
    private let minimumColumnWidth: CGFloat

    public init(_ groups: [Group], minimumColumnWidth: CGFloat = 140) {
        self.groups = groups.filter { !$0.members.isEmpty }
        self.minimumColumnWidth = Self.columnWidth(minimumColumnWidth)
    }

    /// A finite, positive column width; a bad value falls back to 140 points.
    public static func columnWidth(_ value: CGFloat) -> CGFloat { value.isFinite && value > 0 ? value : 140 } // literal-ok: documented fallback width

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.loose) {
            ForEach(groups) { group in
                VStack(alignment: .leading, spacing: metrics.compact) {
                    HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
                        InlineGlyph { Circle().fill(group.color) }.accessibilityHidden(true)
                        Text(group.title).font(typography.strongDetail)
                        Text(verbatim: "\(group.members.count)").font(typography.detail).foregroundStyle(theme.secondary)
                    }
                    .accessibilityElement(children: .combine)
                    .accessibilityAddTraits(.isHeader)
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: minimumColumnWidth), spacing: metrics.medium, alignment: .leading)],
                              alignment: .leading, spacing: metrics.tight) {
                        ForEach(group.members) { m in
                            PersonRow(Text(m.name), detail: m.detail.map { Text($0) }, ring: group.color, compact: true)
                        }
                    }
                }
            }
        }
        .foregroundStyle(theme.foreground)
    }
}
