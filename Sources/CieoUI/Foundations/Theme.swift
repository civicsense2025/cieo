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
    /// Errors and destructive states.
    public var danger: Color
    /// Quiet marks that must stay visible: an unwalked path, an empty dot.
    public var subtle: Color
    // MARK: - Social and audio
    /// Confirmed or finished states, such as a completed action or a success badge.
    public var success: Color
    /// A caution that is not yet an error, such as a limit that is close.
    public var warning: Color
    // MARK: - Page grounds and elevation
    /// The page itself, behind every section. Defaults to the platform's system background.
    public var background: Color
    /// A quiet ground set apart from the page, such as a grouped region or an inset well.
    public var quietBackground: Color
    /// The shadow under something that floats above the page, such as a sheet handle bar or a floating
    /// action. Flat surfaces take no shadow.
    public var floatingShadow: ComponentShadow

    public init(accent: Color = .accentColor, surface: Color = .primary.opacity(0.04),
                foreground: Color = .primary, secondary: Color = .secondary,
                border: Color = .primary.opacity(0.22), onAccent: Color = .white,
                tint: Color? = nil, track: Color = .primary.opacity(0.12),
                block: Color = .black, onBlock: Color = .white, onBlockSecondary: Color = .white.opacity(0.72),
                danger: Color = .red, subtle: Color = .secondary.opacity(0.55),
                success: Color = .green, warning: Color = .orange,
                background: Color = Theme.systemBackground, quietBackground: Color = Theme.systemQuietBackground,
                floatingShadow: ComponentShadow = ComponentShadow())
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
        self.danger = danger
        self.subtle = subtle
        self.success = success
        self.warning = warning
        self.background = background
        self.quietBackground = quietBackground
        self.floatingShadow = floatingShadow
    }

    /// The platform's page background, which follows light and dark mode.
    public static var systemBackground: Color {
        #if os(iOS) || os(tvOS) || os(visionOS)
        Color(uiColor: .systemBackground)
        #elseif os(macOS)
        Color(nsColor: .windowBackgroundColor)
        #else
        Color.clear
        #endif
    }

    /// The platform's quieter grouped ground, which follows light and dark mode.
    public static var systemQuietBackground: Color {
        #if os(iOS) || os(tvOS) || os(visionOS)
        Color(uiColor: .secondarySystemBackground)
        #elseif os(macOS)
        Color(nsColor: .underPageBackgroundColor)
        #else
        Color.primary.opacity(0.04)
        #endif
    }
}

/// One shadow, held as a value so a host restyles every floating surface at once. Geometry rejects
/// nonfinite values; a negative radius becomes 0.
public struct ComponentShadow: Equatable {
    public let color: Color
    public let radius: CGFloat
    public let x: CGFloat
    public let y: CGFloat

    public init(color: Color = .black.opacity(0.14), radius: CGFloat = 16, x: CGFloat = 0, y: CGFloat = 6) {
        self.color = color
        self.radius = ComponentMetrics.dimension(radius, fallback: 16)
        self.x = x.isFinite ? x : 0
        self.y = y.isFinite ? y : 6
    }

    /// No shadow, for hosts whose floating surfaces stay flat.
    public static let none = ComponentShadow(color: .clear, radius: 0, x: 0, y: 0)
}

public extension View {
    /// Casts the host's `floatingShadow` from `componentTheme`.
    func floatingShadow() -> some View { modifier(FloatingShadowModifier()) }

    /// Casts one explicit shadow.
    func componentShadow(_ shadow: ComponentShadow) -> some View {
        self.shadow(color: shadow.color, radius: shadow.radius, x: shadow.x, y: shadow.y)
    }
}

private struct FloatingShadowModifier: ViewModifier {
    @Environment(\.componentTheme) private var theme
    func body(content: Content) -> some View { content.componentShadow(theme.floatingShadow) }
}

/// Fixed fallbacks for code outside a view. Components read `componentMetrics` so a host can change them.
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
    @Entry var componentIcons = ComponentIcons.system
    @Entry var renderPolicy = RenderPolicy()
    /// Press and disabled feedback for controls that take no `appearance:` of their own, such as
    /// SegmentedControl. A host installs it once at the root.
    @Entry var controlAppearance = ControlAppearance()
}
