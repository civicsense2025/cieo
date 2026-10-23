import Cieo
import SwiftUI

/// What a row says, as plain values, so the spoken name can be built and tested without a view.
public struct ConversationSummary: Equatable, Sendable {
    public var title: String
    public var unread: Int
    public var muted: Bool
    public var pinned: Bool
    public var draft: Bool
    public var typing: [String]
    public var preview: String?
    public var time: String?

    public init(title: String, unread: Int = 0, muted: Bool = false, pinned: Bool = false, draft: Bool = false,
                typing: [String] = [], preview: String? = nil, time: String? = nil) {
        self.title = title
        self.unread = unread
        self.muted = muted
        self.pinned = pinned
        self.draft = draft
        self.typing = typing
        self.preview = preview
        self.time = time
    }
}

/// What a `ConversationList` shares with its rows: which one is open, how a row opens, and who has focus.
struct ConversationListContext {
    var selectedId: String?
    var select: (String) -> Void
    var focus: FocusState<String?>.Binding
}

extension EnvironmentValues {
    @Entry var conversationListContext: ConversationListContext?
}

/// One row of the inbox: avatar, title and time, preview and unread badge, with typing, draft, muted and
/// pinned states. The host owns the content and what a tap does; the row owns the layout, the badge motion
/// and the spoken summary. Inside a `ConversationList` the row also marks itself current and opens through
/// the list's selection.
public struct ConversationListItem<Avatar: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.dynamicTypeSize) private var typeSize
    @Environment(\.conversationListContext) private var list
    private let id: String
    private let title: String
    private let preview: String?
    private let time: String?
    private let unread: Int
    private let muted: Bool
    private let pinned: Bool
    private let draft: Bool
    private let typing: [String]
    private let selected: Bool?
    private let onSelect: ((String) -> Void)?
    private let avatar: Avatar

    /// `id` is the conversation's stable id; the list orders and focuses rows by it. `avatar` is decorative:
    /// the title names the row. `selected` overrides the list's selection. `typing` replaces the preview
    /// with an inline typing indicator while it is not empty.
    public init(id: String, title: String, preview: String? = nil, time: String? = nil, unread: Int = 0,
                muted: Bool = false, pinned: Bool = false, draft: Bool = false, typing: [String] = [],
                selected: Bool? = nil, onSelect: ((String) -> Void)? = nil, @ViewBuilder avatar: () -> Avatar) {
        self.id = id
        self.title = title
        self.preview = preview
        self.time = time
        self.unread = Self.wholeCount(unread)
        self.muted = muted
        self.pinned = pinned
        self.draft = draft
        self.typing = typing
        self.selected = selected
        self.onSelect = onSelect
        self.avatar = avatar()
    }

    private var isSelected: Bool { selected ?? (list?.selectedId == id) }
    private var isTyping: Bool { !TypingIndicator.typingSetKey(typing).isEmpty }
    private var summary: ConversationSummary {
        ConversationSummary(title: title, unread: unread, muted: muted, pinned: pinned, draft: draft,
                            typing: typing, preview: preview, time: time)
    }

    public var body: some View {
        Button {
            onSelect?(id)
            list?.select(id)
        } label: {
            row
                .padding(metrics.compact)
                .frame(maxWidth: .infinity, minHeight: metrics.touchTarget, alignment: .leading)
                .background(isSelected ? theme.tint : .clear, in: RoundedRectangle(cornerRadius: metrics.corner))
                .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .modifier(RowFocus(id: id, binding: list?.focus))
        .motion(.base, value: isSelected)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Self.conversationLabel(summary))
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }

    @ViewBuilder
    private var row: some View {
        if typeSize.isAccessibilitySize {
            VStack(alignment: .leading, spacing: metrics.compact) {
                avatar.accessibilityHidden(true)
                main
            }
        } else {
            HStack(alignment: .top, spacing: metrics.medium) {
                avatar.accessibilityHidden(true)
                main
            }
        }
    }

    private var main: some View {
        VStack(alignment: .leading, spacing: metrics.tight) {
            HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
                Text(title)
                    .font(unread > 0 ? typography.strongHeading : typography.heading)
                    .foregroundStyle(theme.foreground)
                    .lineLimit(1)
                Spacer(minLength: 0)
                if let time {
                    Text(time).font(typography.detail)
                        .foregroundStyle(unread > 0 ? theme.accent : theme.secondary)
                        .lineLimit(1)
                }
            }
            HStack(alignment: .center, spacing: metrics.compact) {
                line.frame(maxWidth: .infinity, alignment: .leading)
                flags
            }
        }
    }

    private var line: some View {
        ZStack(alignment: .leading) {
            if isTyping {
                TypingIndicator(names: typing, variant: .inline).transition(.opacity)
            } else {
                previewText.transition(.opacity)
            }
        }
        .motion(.base, value: isTyping)
    }

    private var previewText: Text {
        let body = Text(preview ?? "")
        guard draft else { return body }
        return Text("\(Text("Draft: ").foregroundStyle(theme.danger))\(body)")
    }

    private var flags: some View {
        HStack(spacing: metrics.tight) {
            if muted {
                InlineGlyph(font: typography.detail) { icons(.muted) }
                    .font(typography.detail).foregroundStyle(theme.secondary)
            }
            if pinned && unread == 0 {
                InlineGlyph(font: typography.detail) { icons(.pinned) }
                    .font(typography.detail).foregroundStyle(theme.secondary)
            }
            if unread > 0 {
                Text(Self.unreadBadgeText(unread))
                    .font(typography.strongDetail)
                    .foregroundStyle(theme.onAccent)
                    .contentTransition(.numericText(value: Double(unread)))
                    .padding(.horizontal, metrics.compact)
                    .padding(.vertical, metrics.tight / 2)
                    .background(muted ? theme.secondary : theme.accent, in: Capsule())
                    .transition(.scale(scale: Self.popFrom).combined(with: .opacity))
            }
        }
        .motion(.snap, value: unread > 0)
        .motion(.base, value: unread)
    }

    /// The badge pops in from this scale.
    private static var popFrom: CGFloat { 0.6 } // literal-ok: arrival scale

    // MARK: - Pure helpers

    static func wholeCount(_ n: Int) -> Int { max(0, n) }

    /// Whole unread count shown on the badge: negative input clamps to 0; above 99 it reads "99+".
    public static func unreadBadgeText(_ unread: Int) -> String {
        let n = wholeCount(unread)
        return n > 99 ? "99+" : String(n)
    }

    /// Spoken name of a row: "Design team, 3 unread, Ava: see you at 3, 9:41 AM". Typing replaces the
    /// preview; a draft says so.
    public static func conversationLabel(_ s: ConversationSummary) -> String {
        let unread = wholeCount(s.unread)
        let typing = TypingIndicator.typingLabel(s.typing)
        let preview = s.preview?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let body = !typing.isEmpty ? typing : (s.draft ? "Draft: \(preview)".trimmingCharacters(in: .whitespaces) : preview)
        return [s.title, unread > 0 ? "\(unread) unread" : "", s.muted ? "muted" : "", s.pinned ? "pinned" : "", body, s.time ?? ""]
            .filter { !$0.isEmpty }.joined(separator: ", ")
    }
}

/// Binds a row to the list's focus state when it sits in a list.
private struct RowFocus: ViewModifier {
    let id: String
    let binding: FocusState<String?>.Binding?
    func body(content: Content) -> some View {
        if let binding { content.focused(binding, equals: id) } else { content }
    }
}

#Preview {
    VStack {
        ConversationListItem(id: "a", title: "Design team", preview: "Ava: see you at 3", time: "9:41 AM", unread: 3) {
            GroupAvatar(people: [GroupAvatarPerson(name: "Ava", initials: "A"), GroupAvatarPerson(name: "Ben", initials: "B")])
        }
        ConversationListItem(id: "b", title: "Ben", preview: "ok", time: "Mon", muted: true, typing: ["Ben"]) {
            GroupAvatar(people: [GroupAvatarPerson(name: "Ben", initials: "B")])
        }
    }.padding()
}
