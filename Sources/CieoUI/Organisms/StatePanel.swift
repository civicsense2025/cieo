import SwiftUI

/// Content and recovery belong to the caller; no network or session state is inferred. The description,
/// the mark and the actions are each optional, so a quiet empty state can be a title alone.
public struct StatePanel<Actions: View>: View {
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentTypography) private var typography
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey?
    private let mark: Mark?
    private let actions: Actions

    /// The mark is an SF Symbol name, drawn as a decorative symbol.
    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey? = nil, symbol: String,
                @ViewBuilder actions: () -> Actions)
    {
        self.title = title; self.detail = detail; self.mark = .symbol(symbol); self.actions = actions()
    }

    /// The mark is a host glyph from `componentIcons`, so a host with its own icon set restyles it.
    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey? = nil, icon: ComponentIcon,
                @ViewBuilder actions: () -> Actions)
    {
        self.title = title; self.detail = detail; self.mark = .icon(icon); self.actions = actions()
    }

    /// No mark: the title (and the description, when given) lead.
    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey? = nil, @ViewBuilder actions: () -> Actions) {
        self.title = title; self.detail = detail; self.mark = nil; self.actions = actions()
    }

    private enum Mark {
        case symbol(String)
        case icon(ComponentIcon)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.standard) {
            if let mark { markView(mark) }
            Heading(title, detail: detail, level: .title)
            actions.buttonStyle(ActionButtonStyle())
        }.padding(.vertical, metrics.compact).frame(maxWidth: .infinity, alignment: .leading)
    }

    @ViewBuilder
    private func markView(_ mark: Mark) -> some View {
        switch mark {
        case .symbol(let name): SymbolMark(name)
        case .icon(let icon): InlineGlyph { icons(icon) }.font(typography.prominentGlyph).accessibilityHidden(true)
        }
    }
}

public extension StatePanel where Actions == EmptyView {
    /// A state with nothing to do about it, such as an empty list: a title, and optionally a description.
    init(_ title: LocalizedStringKey, detail: LocalizedStringKey? = nil) {
        self.init(title, detail: detail) { EmptyView() }
    }

    init(_ title: LocalizedStringKey, detail: LocalizedStringKey? = nil, symbol: String) {
        self.init(title, detail: detail, symbol: symbol) { EmptyView() }
    }

    init(_ title: LocalizedStringKey, detail: LocalizedStringKey? = nil, icon: ComponentIcon) {
        self.init(title, detail: detail, icon: icon) { EmptyView() }
    }
}
