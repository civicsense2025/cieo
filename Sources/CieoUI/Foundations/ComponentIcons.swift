import SwiftUI

/// The glyphs the components draw themselves: a row's disclosure chevron, the info button, a finished
/// step's check, a rail's paging arrows, a search field's magnifier and clear button, an error mark and
/// a choice's selected and unselected states.
public enum ComponentIcon: Sendable, CaseIterable {
    case disclosure, info, check, previous, next, search, clear, error, selected, unselected
}

/// Host-owned glyphs. Defaults are SF Symbols; an app with its own icon set installs it once at the root.
/// Components set the font and colour around each glyph and offer it a square sized from the text it sits
/// beside, centred on that text's first line. A drawn shape should fill the square it is offered (a bare
/// `Shape` does) so it follows the text role and Dynamic Type; a glyph with its own fixed frame keeps that
/// size and is only centred.
public struct ComponentIcons {
    private let make: @MainActor (ComponentIcon) -> AnyView

    /// `make` runs on the main actor, where components draw, so a host glyph can be any view, including
    /// one with `@ScaledMetric` or other main-actor state.
    public init<Glyph: View>(@ViewBuilder _ make: @escaping @MainActor (ComponentIcon) -> Glyph) {
        self.make = { AnyView(make($0)) }
    }

    @MainActor
    public func callAsFunction(_ icon: ComponentIcon) -> AnyView {
        make(icon)
    }

    /// The SF Symbol each glyph uses by default.
    public static func systemName(_ icon: ComponentIcon) -> String {
        switch icon {
        case .disclosure: "chevron.forward"
        case .info: "info.circle"
        case .check: "checkmark"
        case .previous: "chevron.backward"
        case .next: "chevron.forward"
        case .search: "magnifyingglass"
        case .clear: "xmark.circle.fill"
        case .error: "exclamationmark.circle"
        case .selected: "checkmark.circle.fill"
        case .unselected: "circle"
        }
    }

    public static let system = ComponentIcons { Image(systemName: systemName($0)) }
}
