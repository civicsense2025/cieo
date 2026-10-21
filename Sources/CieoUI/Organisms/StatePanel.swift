import SwiftUI

/// Content and recovery belong to the caller; no network or session state is inferred.
public struct StatePanel<Actions: View>: View {
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentTypography) private var typography
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    private let mark: Mark
    private let actions: Actions

    /// The mark is an SF Symbol name, drawn as a decorative symbol.
    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, symbol: String,
                @ViewBuilder actions: () -> Actions)
    {
        self.title = title; self.detail = detail; self.mark = .symbol(symbol); self.actions = actions()
    }

    /// The mark is a host glyph from `componentIcons`, so a host with its own icon set restyles it.
    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, icon: ComponentIcon,
                @ViewBuilder actions: () -> Actions)
    {
        self.title = title; self.detail = detail; self.mark = .icon(icon); self.actions = actions()
    }

    private enum Mark {
        case symbol(String)
        case icon(ComponentIcon)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.standard) {
            markView
            Heading(title, detail: detail, level: .title)
            actions.buttonStyle(ActionButtonStyle())
        }.padding(.vertical, metrics.compact).frame(maxWidth: .infinity, alignment: .leading)
    }

    @ViewBuilder
    private var markView: some View {
        switch mark {
        case .symbol(let name): SymbolMark(name)
        case .icon(let icon): icons(icon).font(typography.prominentGlyph).accessibilityHidden(true)
        }
    }
}
