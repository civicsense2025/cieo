import Cieo
import SwiftUI

/// One notification or activity row: who did what, a quoted snippet, when. The host owns data, read state
/// and navigation. The whole row is one button (or link) unless `actions` are present; then the avatar and
/// text are the button and each action keeps its own control.
public struct ActivityItem<Avatar: View, Badge: View, Actions: View>: View {
    /// How the badge on the avatar is coloured.
    public enum Tone: Sendable, CaseIterable { case neutral, accent, danger, success }
    /// What carries the row's main action.
    public enum Main: Sendable { case link, button, plain }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.dynamicTypeSize) private var typeSize
    @ScaledMetric private var dot: CGFloat = 8 // literal-ok: unread dot is component geometry
    @ScaledMetric private var badgeSize: CGFloat = 18 // literal-ok: avatar badge is component geometry
    private let actor: String
    private let what: LocalizedStringKey
    private let preview: String?
    private let time: String?
    private let unread: Bool
    private let tone: Tone
    private let href: URL?
    private let onSelect: (() -> Void)?
    private let avatar: Avatar
    private let badge: Badge
    private let actions: Actions

    /// - Parameters:
    ///   - actor: Who did it, shown in bold.
    ///   - what: What happened, after the name: "liked your reply". Keep it a short phrase.
    ///   - preview: A quoted snippet of the thing acted on, clamped to two lines.
    ///   - time: Human time text such as "2h".
    ///   - unread: Shows a dot and stronger text; turning it off fades the dot out.
    ///   - tone: Colours the badge.
    ///   - href: Makes the whole row a link.
    ///   - onSelect: Makes the whole row a button when there is no `href`.
    ///   - avatar: The actor's face.
    ///   - badge: A small glyph on the avatar corner naming the kind of event. Decorative.
    ///   - actions: Controls such as "Follow back", separately focusable from the row's action.
    public init(actor: String, what: LocalizedStringKey, preview: String? = nil, time: String? = nil,
                unread: Bool = false, tone: Tone = .neutral, href: URL? = nil, onSelect: (() -> Void)? = nil,
                @ViewBuilder avatar: () -> Avatar, @ViewBuilder badge: () -> Badge,
                @ViewBuilder actions: () -> Actions) {
        self.actor = actor
        self.what = what
        self.preview = preview
        self.time = time
        self.unread = unread
        self.tone = tone
        self.href = href
        self.onSelect = onSelect
        self.avatar = avatar()
        self.badge = badge()
        self.actions = actions()
    }

    private var hasActions: Bool { Actions.self != EmptyView.self }
    private var main: Main { Self.activityMainTag(href: href, hasAction: onSelect != nil) }

    public var body: some View {
        if hasActions {
            HStack(alignment: .top, spacing: metrics.compact) {
                mainElement { rowContent }
                actions.fixedSize()
            }
        } else {
            mainElement { rowContent }
        }
    }

    @ViewBuilder
    private func mainElement<Body: View>(@ViewBuilder _ body: () -> Body) -> some View {
        switch main {
        case .link:
            if let href { Link(destination: href) { body() }.buttonStyle(.plain) } else { body() }
        case .button:
            Button { onSelect?() } label: { body() }.buttonStyle(.plain)
        case .plain:
            body()
        }
    }

    private var rowContent: some View {
        HStack(alignment: .top, spacing: metrics.medium) {
            lead
            VStack(alignment: .leading, spacing: metrics.tight) {
                headline
                if let preview, !preview.isEmpty {
                    Text(preview).font(typography.detail).foregroundStyle(theme.secondary).lineLimit(2) // literal-ok: preview clamps to two lines
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            Circle().fill(theme.accent).frame(width: dot, height: dot)
                .opacity(unread ? 1 : 0)
                .motion(.base, value: unread)
                .accessibilityHidden(true)
        }
        .padding(.vertical, metrics.compact)
        .frame(minHeight: metrics.touchTarget)
        .contentShape(.rect)
        .accessibilityElement(children: .combine)
        .accessibilityValue(unread ? Text("unread") : Text(verbatim: ""))
    }

    private var headline: some View {
        let who = Text(actor).font(unread ? typography.strongHeading : typography.strongBody).foregroundStyle(theme.foreground)
        let did = Text(what).font(typography.body).foregroundStyle(theme.foreground)
        let when = Text(verbatim: time ?? "").font(typography.detail).foregroundStyle(theme.secondary)
        return Group {
            if time?.isEmpty == false { Text("\(who) \(did) \(when)") } else { Text("\(who) \(did)") }
        }
    }

    private var lead: some View {
        avatar
            .overlay(alignment: .bottomTrailing) {
                if Badge.self != EmptyView.self {
                    badge
                        .font(typography.glyph)
                        .foregroundStyle(badgeForeground)
                        .frame(width: badgeSize, height: badgeSize)
                        .background(badgeFill, in: Circle())
                        .accessibilityHidden(true)
                }
            }
    }

    private var badgeFill: Color {
        switch tone {
        case .neutral: theme.track
        case .accent: theme.accent
        case .danger: theme.danger
        case .success: theme.success
        }
    }

    private var badgeForeground: Color { tone == .neutral ? theme.foreground : theme.onAccent }

    // MARK: - Pure helpers

    /// Which element carries the row's main action: a link, a button, or nothing when it is informational.
    public static func activityMainTag(href: URL?, hasAction: Bool) -> Main {
        if href != nil { return .link }
        return hasAction ? .button : .plain
    }
}

public extension ActivityItem where Badge == EmptyView, Actions == EmptyView {
    /// A plain row: avatar, text, preview and time.
    init(actor: String, what: LocalizedStringKey, preview: String? = nil, time: String? = nil,
         unread: Bool = false, tone: Tone = .neutral, href: URL? = nil, onSelect: (() -> Void)? = nil,
         @ViewBuilder avatar: () -> Avatar) {
        self.init(actor: actor, what: what, preview: preview, time: time, unread: unread, tone: tone, href: href,
                  onSelect: onSelect, avatar: avatar, badge: { EmptyView() }, actions: { EmptyView() })
    }
}

public extension ActivityItem where Actions == EmptyView {
    /// A row with a kind badge on the avatar.
    init(actor: String, what: LocalizedStringKey, preview: String? = nil, time: String? = nil,
         unread: Bool = false, tone: Tone = .neutral, href: URL? = nil, onSelect: (() -> Void)? = nil,
         @ViewBuilder avatar: () -> Avatar, @ViewBuilder badge: () -> Badge) {
        self.init(actor: actor, what: what, preview: preview, time: time, unread: unread, tone: tone, href: href,
                  onSelect: onSelect, avatar: avatar, badge: badge, actions: { EmptyView() })
    }
}

public extension ActivityItem where Badge == EmptyView {
    /// A row with separate controls beside it, such as "Follow back".
    init(actor: String, what: LocalizedStringKey, preview: String? = nil, time: String? = nil,
         unread: Bool = false, tone: Tone = .neutral, href: URL? = nil, onSelect: (() -> Void)? = nil,
         @ViewBuilder avatar: () -> Avatar, @ViewBuilder actions: () -> Actions) {
        self.init(actor: actor, what: what, preview: preview, time: time, unread: unread, tone: tone, href: href,
                  onSelect: onSelect, avatar: avatar, badge: { EmptyView() }, actions: actions)
    }
}

#Preview {
    ActivityItem(actor: "Ava", what: "liked your reply", preview: "Thanks for the thread", time: "2h", unread: true,
                 tone: .accent, onSelect: {}) {
        GroupAvatar(people: [GroupAvatarPerson(name: "Ava", initials: "A")])
    } badge: { Image(systemName: "heart.fill") } // literal-ok: preview scaffolding
    .padding()
}
