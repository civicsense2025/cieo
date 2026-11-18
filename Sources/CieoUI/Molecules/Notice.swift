import SwiftUI

/// A heading with a supporting line and a glyph. The glyph comes from the host's `componentIcons`
/// through `icon:`; `symbol:` takes an SF Symbol name for callers that need one the glyph set lacks.
/// Supports semantic `Notice.Tone`, optional dismissal, and single or `@ViewBuilder` actions.
public struct Notice: View {
    public typealias Tone = NoticeTone

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.noticeStyle) private var noticeStyle

    private let title: Text
    private let detail: Text
    private let glyph: Glyph
    private let tone: Tone
    private let onDismiss: (() -> Void)?
    private let actionTitle: LocalizedStringKey?
    private let singleAction: (() -> Void)?
    private let customActions: AnyView?

    private enum Glyph {
        case icon(ComponentIcon)
        case symbol(String)
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, icon: ComponentIcon = .info) {
        self.title = Text(title); self.detail = Text(detail); glyph = .icon(icon)
        tone = .neutral; onDismiss = nil; actionTitle = nil; singleAction = nil; customActions = nil
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, symbol: String) {
        self.title = Text(title); self.detail = Text(detail); glyph = .symbol(symbol)
        tone = .neutral; onDismiss = nil; actionTitle = nil; singleAction = nil; customActions = nil
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, icon: ComponentIcon = .info,
                actionTitle: LocalizedStringKey, action: @escaping () -> Void) {
        self.title = Text(title); self.detail = Text(detail); glyph = .icon(icon)
        tone = .neutral; onDismiss = nil; self.actionTitle = actionTitle; singleAction = action; customActions = nil
    }

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, symbol: String,
                actionTitle: LocalizedStringKey, action: @escaping () -> Void) {
        self.title = Text(title); self.detail = Text(detail); glyph = .symbol(symbol)
        tone = .neutral; onDismiss = nil; self.actionTitle = actionTitle; singleAction = action; customActions = nil
    }

    public init(
        _ title: LocalizedStringKey,
        detail: LocalizedStringKey,
        icon: ComponentIcon? = nil,
        tone: Tone,
        onDismiss: (() -> Void)? = nil
    ) {
        self.title = Text(title)
        self.detail = Text(detail)
        self.glyph = .icon(icon ?? tone.defaultIcon)
        self.tone = tone
        self.onDismiss = onDismiss
        self.actionTitle = nil
        self.singleAction = nil
        self.customActions = nil
    }

    public init<Actions: View>(
        _ title: LocalizedStringKey,
        detail: LocalizedStringKey,
        icon: ComponentIcon? = nil,
        tone: Tone = .neutral,
        onDismiss: (() -> Void)? = nil,
        @ViewBuilder actions: () -> Actions
    ) {
        self.title = Text(title)
        self.detail = Text(detail)
        self.glyph = .icon(icon ?? tone.defaultIcon)
        self.tone = tone
        self.onDismiss = onDismiss
        self.actionTitle = nil
        self.singleAction = nil
        self.customActions = Actions.self == EmptyView.self ? nil : AnyView(actions())
    }

    public var body: some View {
        let action: (() -> Void)? = singleAction ?? onDismiss ?? (customActions != nil ? {} : nil)
        let config = NoticeStyleConfiguration(tone: tone, onDismiss: onDismiss) {
            InlineGlyph { glyphView }
        } content: {
            VStack(alignment: .leading, spacing: metrics.tight) {
                Heading(title, detail: detail, level: .heading, isHeader: false)
                    .accessibilityElement(children: .combine)
                if let actionTitle, let singleAction {
                    Button(action: singleAction) { Text(actionTitle).font(typography.strongBody) }
                        .buttonStyle(.plain)
                        .foregroundStyle(theme.accent)
                        .frame(minHeight: metrics.touchTarget)
                        .contentShape(Rectangle())
                }
                if let customActions {
                    customActions
                }
            }
        }
        noticeStyle.makeBody(configuration: config)
            .accessibilityElement(children: action == nil ? .combine : .contain)
    }

    @ViewBuilder
    private var glyphView: some View {
        switch glyph {
        case .icon(let icon):
            icons(icon)
        case .symbol(let symbol):
            Image(systemName: symbol) // literal-ok: caller-supplied SF Symbol name; the glyph set has no role for arbitrary symbols
        }
    }
}
