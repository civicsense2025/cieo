import SwiftUI

/// The input row for a thread: an auto-growing text field, avatar, tool and attachment slots, an
/// optional recorder that replaces the text, the reply being answered, and a character ring. The host
/// owns the text binding, the media and what submit does; submit receives the trimmed text.
public struct CommentComposer: View {
    /// The comment being answered.
    public struct Reply: Equatable, Sendable {
        public let author: String
        public let excerpt: String
        public init(author: String, excerpt: String) { self.author = author; self.excerpt = excerpt }
    }

    /// What a key press does inside the field.
    public enum KeyAction: Sendable, Equatable { case submit, cancelReply }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @FocusState private var textFocused: Bool
    @AccessibilityFocusState private var recorderFocused: Bool
    @Binding private var text: String
    private let placeholder: LocalizedStringKey
    private let label: LocalizedStringKey
    private let replyingTo: Reply?
    private let onCancelReply: (() -> Void)?
    private let maxLength: Int?
    private let submitLabel: LocalizedStringKey
    private let hasAttachments: Bool
    private let isPending: Bool
    private let onSubmit: (String) -> Void
    private var avatarSlot: AnyView?
    private var toolsSlot: AnyView?
    private var attachmentsSlot: AnyView?
    private var recorderSlot: AnyView?

    // MARK: Pure helpers

    /// The length a person is limited by: Unicode scalars, the same count as the web twin.
    public static func composerLength(_ value: String) -> Int { value.unicodeScalars.count }

    /// Posting is allowed when not busy or disabled, within the limit, and there is text or an attachment.
    public static func canSubmit(text: String, hasAttachments: Bool = false, maxLength: Int? = nil,
                                 isPending: Bool = false, isDisabled: Bool = false) -> Bool {
        if isPending || isDisabled { return false }
        if let maxLength, maxLength > 0, composerLength(text) > maxLength { return false }
        return !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || hasAttachments
    }

    /// The count ring appears once `threshold` (80% by default) of the limit is used. No limit, no ring.
    public static func showsCount(length: Int, maxLength: Int?, threshold: Double = 0.8) -> Bool {
        guard let maxLength, maxLength > 0 else { return false }
        return Double(length) >= Double(maxLength) * threshold
    }

    /// Command-Return posts and Escape cancels a reply. Return alone is a new line.
    public static func keyAction(key: KeyEquivalent, modifiers: EventModifiers, replying: Bool) -> KeyAction? {
        if key == .return && modifiers.contains(.command) { return .submit }
        if key == .escape && replying { return .cancelReply }
        return nil
    }

    /// The text posting passes to the host.
    public static func submittedText(_ text: String) -> String { text.trimmingCharacters(in: .whitespacesAndNewlines) }

    /// `maxLength` shows the count ring from 80% and stops posting past the limit. `hasAttachments` allows
    /// posting with empty text. `isPending` blocks posting and reads "Posting…". `onSubmit` receives the
    /// trimmed text. Disable the composer with `.disabled(_:)`.
    public init(text: Binding<String>, placeholder: LocalizedStringKey = "Add to thread…",
                label: LocalizedStringKey = "Add to thread", replyingTo: Reply? = nil,
                onCancelReply: (() -> Void)? = nil, maxLength: Int? = nil,
                submitLabel: LocalizedStringKey = "Post", hasAttachments: Bool = false, isPending: Bool = false,
                onSubmit: @escaping (String) -> Void) {
        _text = text
        self.placeholder = placeholder; self.label = label; self.replyingTo = replyingTo
        self.onCancelReply = onCancelReply; self.maxLength = maxLength; self.submitLabel = submitLabel
        self.hasAttachments = hasAttachments; self.isPending = isPending; self.onSubmit = onSubmit
    }

    // MARK: Slots

    /// The author's avatar, left of the input.
    public func avatar<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.avatarSlot = AnyView(slot()) } }
    /// Icon buttons under the input (image, sticker, GIF, mic, or anything else).
    public func tools<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.toolsSlot = AnyView(slot()) } }
    /// Previews of attached media, such as images or a recorded clip's player.
    public func attachments<V: View>(@ViewBuilder _ slot: () -> V) -> Self { with { $0.attachmentsSlot = AnyView(slot()) } }
    /// While `isActive` the recorder replaces the text row (cross-fade); focus moves into it, and back to
    /// the text when it leaves.
    public func recorder<V: View>(isActive: Bool, @ViewBuilder _ slot: () -> V) -> Self {
        with { $0.recorderSlot = isActive ? AnyView(slot()) : nil }
    }

    private func with(_ change: (inout Self) -> Void) -> Self {
        var copy = self
        change(&copy)
        return copy
    }

    // MARK: Body

    private var canPost: Bool {
        Self.canSubmit(text: text, hasAttachments: hasAttachments, maxLength: maxLength,
                       isPending: isPending, isDisabled: !isEnabled)
    }

    private func submit() {
        if canPost { onSubmit(Self.submittedText(text)) }
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.compact) {
            if let replyingTo {
                ReplyPreview(author: replyingTo.author, excerpt: replyingTo.excerpt, variant: .composer,
                             onDismiss: onCancelReply)
            }
            HStack(alignment: .top, spacing: metrics.medium) {
                if let avatarSlot { avatarSlot.frame(width: metrics.avatar, height: metrics.avatar).clipShape(.circle) }
                VStack(alignment: .leading, spacing: metrics.compact) {
                    pane
                    if let attachmentsSlot { attachmentsSlot }
                    bar
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(label))
        .onChange(of: recorderSlot != nil) { _, active in
            if active { recorderFocused = true } else { textFocused = true }
        }
    }

    @ViewBuilder
    private var pane: some View {
        ZStack(alignment: .topLeading) {
            if let recorderSlot {
                recorderSlot
                    .accessibilityFocused($recorderFocused)
                    .transition(.opacity)
            } else {
                TextField(placeholder, text: $text, axis: .vertical)
                    .lineLimit(1...6)
                    .font(typography.field)
                    .foregroundStyle(theme.foreground)
                    .textFieldStyle(.plain)
                    .focused($textFocused)
                    .accessibilityLabel(Text(label))
                    .frame(minHeight: metrics.touchTarget, alignment: .topLeading)
                    .onKeyPress(phases: .down) { press in
                        switch Self.keyAction(key: press.key, modifiers: press.modifiers, replying: replyingTo != nil && onCancelReply != nil) {
                        case .submit: submit(); return .handled
                        case .cancelReply: onCancelReply?(); return .handled
                        case nil: return .ignored
                        }
                    }
                    .transition(.opacity)
            }
        }
        .motion(.base, value: recorderSlot != nil)
    }

    private var bar: some View {
        let length = Self.composerLength(text)
        return ViewThatFits(in: .horizontal) {
            HStack(spacing: metrics.compact) { toolsGroup; Spacer(minLength: 0); trailing(length) }
            VStack(alignment: .leading, spacing: metrics.compact) {
                toolsGroup
                HStack(spacing: metrics.compact) { Spacer(minLength: 0); trailing(length) }
            }
        }
    }

    @ViewBuilder
    private var toolsGroup: some View {
        if let toolsSlot {
            HStack(spacing: 0) { toolsSlot } // literal-ok: flush stack, the pieces touch by design
                .accessibilityElement(children: .contain)
                .accessibilityLabel("Add to your post")
        }
    }

    private func trailing(_ length: Int) -> some View {
        HStack(spacing: metrics.compact) {
            if let maxLength, Self.showsCount(length: length, maxLength: maxLength) {
                CharacterCountRing(length: length, max: maxLength)
            }
            Button(action: submit) {
                Text(isPending ? "Posting…" : submitLabel)
                    .contentTransition(.interpolate)
            }
            .buttonStyle(ActionButtonStyle(.prominent))
            .keyboardShortcut(.return, modifiers: .command)
            .disabled(!canPost)
            .motion(.snap, value: isPending)
        }
    }
}
