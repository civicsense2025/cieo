import SwiftUI

/// Semantic roles, not a brand palette. Hosts can replace one value at the boundary.
public struct Theme {
    public var accent: Color
    public var surface: Color
    public var foreground: Color
    public var secondary: Color
    public var border: Color
    /// Text and marks placed on `accent`.
    public var onAccent: Color
    /// A quiet accent fill for selected or highlighted areas.
    public var tint: Color
    /// The unfilled part of bars, rings and connectors.
    public var track: Color
    /// A dark colour block that holds live state, such as a quiz or the selected item.
    public var block: Color
    public var onBlock: Color
    public var onBlockSecondary: Color

    public init(accent: Color = .accentColor, surface: Color = .primary.opacity(0.04),
                foreground: Color = .primary, secondary: Color = .secondary,
                border: Color = .primary.opacity(0.22), onAccent: Color = .white,
                tint: Color? = nil, track: Color = .primary.opacity(0.12),
                block: Color = .black, onBlock: Color = .white, onBlockSecondary: Color = .white.opacity(0.72))
    {
        self.accent = accent
        self.surface = surface
        self.foreground = foreground
        self.secondary = secondary
        self.border = border
        self.onAccent = onAccent
        self.tint = tint ?? accent.opacity(0.18)
        self.track = track
        self.block = block
        self.onBlock = onBlock
        self.onBlockSecondary = onBlockSecondary
    }
}

public enum Metrics {
    public static let compact: CGFloat = 8
    public static let standard: CGFloat = 16
    public static let section: CGFloat = 24
    public static let corner: CGFloat = 12
    public static let touchTarget: CGFloat = 44
}

public extension EnvironmentValues {
    @Entry var componentTheme = Theme()
    @Entry var componentTypography = ComponentTypography()
    @Entry var componentMetrics = ComponentMetrics()
    @Entry var displayTypography = DisplayTypography()
    @Entry var renderPolicy = RenderPolicy()
}
