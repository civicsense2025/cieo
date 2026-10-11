import SwiftUI

/// Semantic roles, not a brand palette. Hosts can replace one value at the boundary.
public struct Theme {
    public var accent: Color
    public var surface: Color
    public var foreground: Color
    public var secondary: Color
    public var border: Color

    public init(accent: Color = .accentColor, surface: Color = .primary.opacity(0.04),
                foreground: Color = .primary, secondary: Color = .secondary,
                border: Color = .primary.opacity(0.22))
    {
        self.accent = accent
        self.surface = surface
        self.foreground = foreground
        self.secondary = secondary
        self.border = border
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
    @Entry var renderPolicy = RenderPolicy()
}
