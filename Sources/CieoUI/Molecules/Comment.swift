import Cieo
import SwiftUI

public extension EnvironmentValues {
    /// True when another comment follows this one at the same level, so a reply's rail keeps running
    /// past its curve to reach it. `CommentThread` sets it for each row.
    @Entry var commentHasNextSibling = false
}

/// One post in a thread: an avatar and rail column beside a header, body, attachments, actions and
/// nested replies. The host fills every slot (chain `.menu`, `.attachments`, `.actions`, `.replies`,
/// `.status` after the initializer); the comment owns layout, the rail that curves into each reply's
/// avatar and the state looks.
public struct Comment<Avatar: View, Content: View>: View {
    /// default, pending ("Posting…"), failed (the status slot), deleted (keeps replies) or highlighted
    /// (an accent tint that fades out).
    public enum State: Sendable, CaseIterable { case `default`, pending, failed, deleted, highlighted }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.commentHasNextSibling) private var hasNextSibling
    @SwiftUI.State private var tinted: Bool
    @SwiftUI.State private var arrived: Bool

    private let author: String
    private let authorHref: String?
    private let time: String?
    private let date: Date?
    private let state: State
    private let depth: Int
    private let railed: Bool
    private let entering: Bool
    private let avatar: Avatar
    private let content: Content
    private var badgeSlot: AnyView?
    private var contextSlot: AnyView?
    private var menuSlot: AnyView?
    private var attachmentsSlot: AnyView?
    private var actionsSlot: AnyView?
    private var repliesSlot: AnyView?
    private var statusSlot: AnyView?

    // MARK: Pure helpers

    /// The nesting level as a whole number of at least 0.
    public static func commentDepth(_ depth: Int?) -> Int { Swift.max(0, depth ?? 0) }

    /// The same, for a value that may be NaN or infinite: anything not finite is 0.
    public static func commentDepth(_ depth: Double) -> Int {
        depth.isFinite ? Swift.max(0, Int(depth.rounded(.down))) : 0
    }

    /// True when the rail runs below the avatar: asked for, or there are replies to join.
    public static func commentHasRail(railed: Bool, hasReplies: Bool) -> Bool { railed || hasReplies }

    /// The text the deleted state shows.
    public static var deletedText: String { "This comment was deleted" }

    /// The text of the pending state.
    public static var pendingText: String { "Posting…" }

    /// The default text of the failed state when no status slot is given.
    public static var failedText: String { "Could not post this comment." }

    /// `depth` is 0 for a top-level comment; from 1 the avatar is smaller and a curve joins the parent's
    /// rail. `railed` draws the rail even without replies. `entering` plays the short rise-in for a
    /// comment that just arrived.
    public init(author: String, authorHref: String? = nil, time: String? = nil, date: Date? = nil,
                state: State = .default, depth: Int = 0, railed: Bool = false, entering: Bool = false,
                @ViewBuilder avatar: () -> Avatar, @ViewBuilder content: () -> Content) {
        self.author = author; self.authorHref = authorHref; self.time = time; self.date = date
        self.state = state; self.depth = Self.commentDepth(depth); self.railed = railed; self.entering = entering
        self.avatar = avatar(); self.content = content()
        _tinted = SwiftUI.State(initialValue: state == .highlighted)
        _arrived = SwiftUI.State(initialValue: !entering)
    }

    // MARK: Slots

    /// A slot after the name, such as a verified badge.
    public func badge<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.badgeSlot = AnyView(slot()) } }
    /// Where the comment lives, shown after a "›" in the byline.
    public func context<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.contextSlot = AnyView(slot()) } }
    /// A slot at the far end of the header: a "more" menu button.
    public func menu<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.menuSlot = AnyView(slot()) } }
    /// A slot under the body: link card, image, an audio player.
    public func attachments<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.attachmentsSlot = AnyView(slot()) } }
    /// The action row: like, reply, repost, share, or anything else.
    public func actions<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.actionsSlot = AnyView(slot()) } }
    /// Nested replies, laid out in the content column under the actions.
    public func replies<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.repliesSlot = AnyView(slot()) } }
    /// A status line for the failed state, such as a retry button.
    public func status<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.statusSlot = AnyView(slot()) } }

    private func with(_ change: (inout Self) -> Void) -> Self {
        var copy = self
        change(&copy)
        return copy
    }

    // MARK: Body

    private var avatarSize: CGFloat { depth == 0 ? metrics.avatar : metrics.avatarSmall }
    private var parentAvatarSize: CGFloat { depth <= 1 ? metrics.avatar : metrics.avatarSmall }
    private var hasRail: Bool { Self.commentHasRail(railed: railed, hasReplies: repliesSlot != nil) }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) { // literal-ok: flush stack, the pieces touch by design
            HStack(alignment: .top, spacing: metrics.medium) {
                railColumn
                main
            }
            .padding(.top, metrics.compact)
            if let replies = repliesSlot {
                replies.padding(.leading, avatarSize + metrics.medium)
            }
        }
        .background(alignment: .topLeading) { elbow }
        .background(theme.tint.opacity(tinted ? 1 : 0), in: .rect(cornerRadius: metrics.corner))
        .opacity(arrived ? 1 : MotionTokens.arriveOpacity)
        .offset(y: arrived || reduceMotion ? 0 : MotionTokens.drift)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(author))
        .accessibilityHidden(false)
        .task(id: state) { await fade() }
        .onAppear {
            guard !arrived else { return }
            withMotion(.base, reduceMotion: reduceMotion) { arrived = true }
        }
    }

    private var railColumn: some View {
        VStack(spacing: metrics.tight) {
            Group {
                if state == .deleted {
                    Color.clear
                } else {
                    avatar.clipShape(.circle)
                }
            }
            .frame(width: avatarSize, height: avatarSize)
            if hasRail {
                Capsule().fill(theme.track).frame(width: metrics.rail).frame(maxHeight: .infinity)
                    .accessibilityHidden(true)
            }
        }
        .frame(width: avatarSize)
        .opacity(state == .pending ? MotionTokens.arriveOpacity : 1)
    }

    @ViewBuilder
    private var main: some View {
        VStack(alignment: .leading, spacing: metrics.tight) {
            if state == .deleted {
                Text(Self.deletedText).font(typography.detail).foregroundStyle(theme.secondary)
                    .frame(minHeight: avatarSize, alignment: .leading)
            } else {
                Group {
                    header
                    content.font(typography.body).foregroundStyle(theme.foreground)
                    if let attachments = attachmentsSlot { attachments }
                    if let actions = actionsSlot { actions }
                }
                .opacity(state == .pending ? MotionTokens.arriveOpacity : 1)
                if state == .pending {
                    Text(Self.pendingText).font(typography.detail).foregroundStyle(theme.secondary)
                        .accessibilityAddTraits(.updatesFrequently)
                }
                if state == .failed {
                    Group {
                        if let status = statusSlot { status } else { StatusLabel(Self.failedText, icon: .error, tone: .danger) }
                    }
                    .foregroundStyle(theme.danger)
                }
            }
        }
        .padding(.bottom, metrics.compact)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var header: some View {
        HStack(alignment: .top, spacing: metrics.tight) {
            line.frame(maxWidth: .infinity, alignment: .leading).frame(minHeight: avatarSize / 2, alignment: .leading)
            if let menu = menuSlot { menu }
        }
    }

    @ViewBuilder
    private var line: some View {
        let hasBadge = badgeSlot != nil
        if let context = contextSlot {
            ByLine(author: author, href: authorHref, time: time, date: date, hasBadge: hasBadge, hasContext: true,
                   badge: { badgeSlot ?? AnyView(EmptyView()) }, context: { context })
        } else {
            ByLine(author: author, href: authorHref, time: time, date: date, hasBadge: hasBadge, hasContext: false,
                   badge: { badgeSlot ?? AnyView(EmptyView()) }, context: { EmptyView() })
        }
    }

    /// The rail's curve from the parent's rail into this comment's avatar, with the straight run on to the
    /// next sibling when there is one.
    @ViewBuilder
    private var elbow: some View {
        if depth > 0 {
            RailElbow(
                railX: -(metrics.medium + parentAvatarSize / 2),
                avatarCentreY: metrics.compact + avatarSize / 2,
                avatarLeft: -metrics.tight,
                radius: metrics.standard,
                continues: hasNextSibling
            )
            .stroke(theme.track, style: StrokeStyle(lineWidth: metrics.rail, lineCap: .round))
            .allowsHitTesting(false)
            .accessibilityHidden(true)
        }
    }

    private func fade() async {
        guard state == .highlighted else { tinted = false; return }
        tinted = true
        try? await Task.sleep(for: .seconds(MotionTokens.durationLazy))
        guard !Task.isCancelled else { return }
        withMotion(.lazy, reduceMotion: reduceMotion) { tinted = false }
    }
}

public extension Comment where Content == EmptyView {
    /// A comment with no body text, such as one that is only an attachment.
    init(author: String, authorHref: String? = nil, time: String? = nil, date: Date? = nil,
         state: State = .default, depth: Int = 0, railed: Bool = false, entering: Bool = false,
         @ViewBuilder avatar: () -> Avatar) {
        self.init(author: author, authorHref: authorHref, time: time, date: date, state: state, depth: depth,
                  railed: railed, entering: entering, avatar: avatar, content: { EmptyView() })
    }
}

/// The curve that leaves a parent's rail, turns into a reply's avatar, and optionally runs on down.
struct RailElbow: Shape {
    let railX: CGFloat
    let avatarCentreY: CGFloat
    let avatarLeft: CGFloat
    let radius: CGFloat
    let continues: Bool

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let r = Swift.max(0, Swift.min(radius, avatarCentreY, avatarLeft - railX))
        let x = rect.minX + railX
        path.move(to: CGPoint(x: x, y: rect.minY))
        path.addLine(to: CGPoint(x: x, y: rect.minY + avatarCentreY - r))
        path.addQuadCurve(to: CGPoint(x: x + r, y: rect.minY + avatarCentreY),
                          control: CGPoint(x: x, y: rect.minY + avatarCentreY))
        path.addLine(to: CGPoint(x: rect.minX + avatarLeft, y: rect.minY + avatarCentreY))
        if continues {
            path.move(to: CGPoint(x: x, y: rect.minY + avatarCentreY - r))
            path.addLine(to: CGPoint(x: x, y: rect.maxY))
        }
        return path
    }
}
