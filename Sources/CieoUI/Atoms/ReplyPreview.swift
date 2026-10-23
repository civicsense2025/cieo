import SwiftUI

/// A quoted reply with an accent bar. The host owns the excerpt text and what dismiss or jump do.
/// In the composer it can be cancelled; as a quote inside a message it is a button only when the host
/// gives it somewhere to jump.
public struct ReplyPreview: View {
    /// `composer` sits above an input and can be dismissed; `quote` sits inside a message.
    public enum Variant: Sendable, CaseIterable { case composer, quote }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    private let author: String
    private let excerpt: String
    private let variant: Variant
    private let onDismiss: (() -> Void)?
    private let onJump: (() -> Void)?

    /// Spoken name of the composer's dismiss button.
    public static func dismissLabel(_ author: String) -> String { "Cancel reply to \(author)" }

    /// Spoken name of the quote's jump button.
    public static func jumpLabel(_ author: String) -> String { "Go to the message from \(author)" }

    /// `onDismiss` shows the cancel button (composer only); `onJump` makes the quote tappable (quote only).
    public init(author: String, excerpt: String, variant: Variant = .quote,
                onDismiss: (() -> Void)? = nil, onJump: (() -> Void)? = nil) {
        self.author = author
        self.excerpt = excerpt
        self.variant = variant
        self.onDismiss = onDismiss
        self.onJump = onJump
    }

    public var body: some View {
        switch variant {
        case .composer:
            HStack(alignment: .center, spacing: metrics.compact) {
                quote
                if let onDismiss {
                    Button(action: onDismiss) {
                        InlineGlyph { icons(.dismiss) }
                            .font(typography.glyph)
                            .foregroundStyle(theme.secondary)
                            .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                            .contentShape(.rect)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(Self.dismissLabel(author))
                }
            }
        case .quote:
            if let onJump {
                Button(action: onJump) { quote.frame(minHeight: metrics.touchTarget) }
                    .buttonStyle(.plain)
                    .accessibilityLabel(Self.jumpLabel(author))
            } else {
                quote.accessibilityElement(children: .combine)
            }
        }
    }

    private var quote: some View {
        HStack(alignment: .top, spacing: metrics.compact) {
            RoundedRectangle(cornerRadius: metrics.rail)
                .fill(theme.accent)
                .frame(width: metrics.rail + metrics.hairline)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 0) { // literal-ok: flush stack, the pieces touch by design
                Text(author).font(typography.strongDetail).foregroundStyle(theme.foreground).lineLimit(1)
                Text(excerpt).font(typography.detail).foregroundStyle(theme.secondary)
                    .lineLimit(variant == .composer ? 1 : 2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}
