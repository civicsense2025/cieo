import SwiftUI

/// An author header: name, badge, handle, a "›" context crumb and a relative time. The host owns
/// the text; this owns truncation order and safe links. Standard text keeps time on one line;
/// accessibility sizes stack the pieces and let a long timestamp wrap within the comment column.
public struct ByLine<Badge: View, Context: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.dynamicTypeSize) private var typeSize
    private let author: String
    private let href: String?
    private let badge: Badge
    private let context: Context
    private let hasContext: Bool
    private let hasBadge: Bool
    private let contextHref: String?
    private let time: String?
    private let date: Date?
    private let handle: String?

    private static var separatorBefore: String { "›" }
    private static var separatorTime: String { "·" }

    /// The address when it is safe to link: http(s) or a relative path. Spaces and control characters are
    /// ignored when checking the scheme, and protocol-relative ("//host") forms are refused.
    public static func safeURL(_ href: String?) -> URL? {
        Mention.safeURL(href)
    }

    /// `badge` follows the name (a verified badge); `context` is where the post lives, after a "›";
    /// `time` is the age text and `date` its exact date, read to VoiceOver. A slot is skipped when its
    /// view type is `EmptyView`; pass `hasBadge` or `hasContext` to decide that yourself for type-erased slots.
    public init(author: String, href: String? = nil, contextHref: String? = nil, time: String? = nil,
                date: Date? = nil, handle: String? = nil,
                hasBadge: Bool? = nil, hasContext: Bool? = nil,
                @ViewBuilder badge: () -> Badge, @ViewBuilder context: () -> Context) {
        self.author = author; self.href = href; self.badge = badge(); self.context = context()
        self.hasBadge = hasBadge ?? (Badge.self != EmptyView.self)
        self.hasContext = hasContext ?? (Context.self != EmptyView.self)
        self.contextHref = contextHref; self.time = time; self.date = date; self.handle = handle
    }

    public var body: some View {
        if typeSize.isAccessibilitySize {
            VStack(alignment: .leading, spacing: 0) { line } // literal-ok: flush stack, the pieces touch by design
        } else {
            HStack(alignment: .firstTextBaseline, spacing: metrics.tight) { line }
        }
    }

    @ViewBuilder
    private var line: some View {
        linked(Text(author).font(typography.strongDetail).foregroundStyle(theme.foreground), href: href)
            .lineLimit(1)
            .layoutPriority(0)
        if hasBadge { badge.layoutPriority(1) }
        if let handle, !handle.isEmpty {
            Text(verbatim: "@" + handle).font(typography.detail).foregroundStyle(theme.secondary).lineLimit(1)
        }
        if hasContext {
            Text(verbatim: Self.separatorBefore).font(typography.detail).foregroundStyle(theme.secondary)
                .accessibilityHidden(true)
            linked(context.font(typography.detail).foregroundStyle(theme.secondary), href: contextHref)
                .lineLimit(1)
                .layoutPriority(1)
        }
        if let time, !time.isEmpty {
            Text(verbatim: Self.separatorTime).font(typography.detail).foregroundStyle(theme.secondary)
                .accessibilityHidden(true)
            Text(time).font(typography.detail).foregroundStyle(theme.secondary)
                .fixedSize(horizontal: !typeSize.isAccessibilitySize, vertical: true).layoutPriority(2)
                .accessibilityLabel(date.map { Text($0, format: .dateTime.month().day().year()) } ?? Text(time))
        }
    }

    @ViewBuilder
    private func linked<Content: View>(_ content: Content, href: String?) -> some View {
        if let url = Self.safeURL(href) {
            Link(destination: url) { content }
        } else {
            content
        }
    }
}

public extension ByLine where Badge == EmptyView, Context == EmptyView {
    /// A byline with only a name and, optionally, a time.
    init(author: String, href: String? = nil, time: String? = nil, date: Date? = nil, handle: String? = nil) {
        self.init(author: author, href: href, time: time, date: date, handle: handle, badge: { EmptyView() }, context: { EmptyView() })
    }
}

public extension ByLine where Context == EmptyView {
    /// A byline with a badge slot after the name.
    init(author: String, href: String? = nil, time: String? = nil, date: Date? = nil, handle: String? = nil,
         @ViewBuilder badge: () -> Badge) {
        self.init(author: author, href: href, time: time, date: date, handle: handle, badge: badge, context: { EmptyView() })
    }
}
