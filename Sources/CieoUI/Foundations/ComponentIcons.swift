import SwiftUI

/// The glyphs the components draw themselves: a row's disclosure chevron, the info button, a finished
/// step's check, a rail's paging arrows, a search field's magnifier and clear button, an error mark and
/// a choice's selected and unselected states.
public enum ComponentIcon: Sendable, CaseIterable {
    case disclosure, info, check, previous, next, search, clear, error, selected, unselected
}

/// Host-owned glyphs. Defaults are SF Symbols; an app with its own icon set installs it once at the root.
/// Components set the font and colour around each glyph, so a host glyph should size itself to the
/// current font or carry its own frame.
public struct ComponentIcons {
    private let make: (ComponentIcon) -> AnyView

    public init<Glyph: View>(@ViewBuilder _ make: @escaping (ComponentIcon) -> Glyph) {
        self.make = { AnyView(make($0)) }
    }

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
