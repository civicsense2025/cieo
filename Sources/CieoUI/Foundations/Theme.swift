import SwiftUI

/// Semantic roles, not a brand palette. Hosts can replace one value at the boundary, or start from `Theme.preset`.
public struct Theme {
    public var accent: Color
    public var surface: Color
    public var surfaceLow: Color
    public var surfaceHigh: Color
    public var raised: Color
    public var sunken: Color
    public var foreground: Color
    public var secondary: Color
    public var border: Color
    public var borderStrong: Color
    /// Text and marks placed on `accent`.
    public var onAccent: Color
    /// A quiet accent fill for selected or highlighted areas.
    public var tint: Color
    public var accentHover: Color
    public var accentSoft: Color
    public var onAccentSoft: Color
    public var focus: Color
    public var selection: Color
    /// The unfilled part of bars, rings and connectors.
    public var track: Color
    /// A dark colour block that holds live state, such as a quiz or the selected item.
    public var block: Color
    public var onBlock: Color
    public var onBlockSecondary: Color
    /// Errors and destructive states.
    public var danger: Color
    public var dangerSoft: Color
    /// Quiet marks that must stay visible: an unwalked path, an empty dot.
    public var subtle: Color
    // MARK: - Social and audio
    /// Confirmed or finished states, such as a completed action or a success badge.
    public var success: Color
    public var successSoft: Color
    /// A caution that is not yet an error, such as a limit that is close.
    public var warning: Color
    public var warningSoft: Color
    /// Neutral informational highlights and notices.
    public var info: Color
    public var infoSoft: Color
    // MARK: - Page grounds and elevation
    /// The page itself, behind every section. Defaults to the platform's system background.
    public var background: Color
    /// A quiet ground set apart from the page, such as a grouped region or an inset well.
    public var quietBackground: Color
    /// The shadow under something that floats above the page, such as a sheet handle bar or a floating
    /// action. Flat surfaces take no shadow.
    public var floatingShadow: ComponentShadow
    /// Hairline ring width around raised surfaces (`1` for `.ring` elevation, `0` otherwise).
    public var elevationRingWidth: CGFloat

    public init(accent: Color = .accentColor, surface: Color = .primary.opacity(0.04),
                foreground: Color = .primary, secondary: Color = .secondary,
                border: Color = .primary.opacity(0.22), onAccent: Color = .white,
                tint: Color? = nil, track: Color = .primary.opacity(0.12),
                block: Color = .black, onBlock: Color = .white, onBlockSecondary: Color = .white.opacity(0.72),
                danger: Color = .red, subtle: Color = .secondary.opacity(0.55),
                success: Color = .green, warning: Color = .orange,
                background: Color = Theme.systemBackground, quietBackground: Color = Theme.systemQuietBackground,
                floatingShadow: ComponentShadow = ComponentShadow(),
                surfaceLow: Color = .primary.opacity(0.02), surfaceHigh: Color = .primary.opacity(0.06),
                raised: Color = .primary.opacity(0.07), sunken: Color = .primary.opacity(0.08),
                info: Color = .blue, accentHover: Color? = nil,
                accentSoft: Color? = nil, onAccentSoft: Color? = nil,
                successSoft: Color? = nil, warningSoft: Color? = nil,
                dangerSoft: Color? = nil, infoSoft: Color? = nil,
                borderStrong: Color = .primary.opacity(0.42), focus: Color? = nil,
                selection: Color? = nil, elevationRingWidth: CGFloat = 0)
    {
        let resolvedTint = tint ?? accent.opacity(0.18)
        self.accent = accent
        self.surface = surface
        self.surfaceLow = surfaceLow
        self.surfaceHigh = surfaceHigh
        self.raised = raised
        self.sunken = sunken
        self.foreground = foreground
        self.secondary = secondary
        self.border = border
        self.borderStrong = borderStrong
        self.onAccent = onAccent
        self.tint = resolvedTint
        self.accentHover = accentHover ?? accent
        self.accentSoft = accentSoft ?? resolvedTint
        self.onAccentSoft = onAccentSoft ?? accent
        self.focus = focus ?? accent
        self.selection = selection ?? resolvedTint
        self.track = track
        self.block = block
        self.onBlock = onBlock
        self.onBlockSecondary = onBlockSecondary
        self.danger = danger
        self.dangerSoft = dangerSoft ?? danger.opacity(0.14)
        self.subtle = subtle
        self.success = success
        self.successSoft = successSoft ?? success.opacity(0.14)
        self.warning = warning
        self.warningSoft = warningSoft ?? warning.opacity(0.14)
        self.info = info
        self.infoSoft = infoSoft ?? info.opacity(0.14)
        self.background = background
        self.quietBackground = quietBackground
        self.floatingShadow = floatingShadow
        self.elevationRingWidth = ComponentMetrics.dimension(elevationRingWidth, fallback: 0)
    }

    /// Builds a dynamic light/dark/high-contrast `Theme` from Cieo's audited 7-brand, 3-ground token graph.
    public static func preset(brand: ThemeBrand = .instrument, ground: ThemeGround = .paper,
                              elevation: ElevationStyle = .ring) -> Theme {
        let g = GeneratedThemePalettes.grounds[ground] ?? GeneratedThemePalettes.grounds[.paper]!
        let b = GeneratedThemePalettes.brands["\(brand.rawValue):\(ground.rawValue)"]
            ?? GeneratedThemePalettes.brands["instrument:paper"]!
        let ring = elevation == .ring
        let shadow = ring
            ? ComponentShadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 1)
            : ComponentShadow(color: .black.opacity(0.08), radius: 24, x: 0, y: 8)
        let darkInk = Color(.sRGB, red: g.text.ls.0, green: g.text.ls.1, blue: g.text.ls.2, opacity: 1)
        return Theme(
            accent: b.accent.color(),
            surface: g.surface.color(),
            foreground: g.text.color(),
            secondary: g.muted.color(),
            border: g.border.color(),
            onAccent: b.onAccent.color(),
            tint: b.accentSoft.color(),
            track: g.sunken.color(),
            block: darkInk,
            onBlock: .white,
            onBlockSecondary: .white.opacity(0.76),
            danger: g.danger.color(),
            subtle: g.subtle.color(),
            success: g.success.color(),
            warning: g.warning.color(),
            background: g.canvas.color(),
            quietBackground: g.surfaceLow.color(),
            floatingShadow: shadow,
            surfaceLow: g.surfaceLow.color(),
            surfaceHigh: g.surfaceHigh.color(),
            raised: g.raised.color(),
            sunken: g.sunken.color(),
            info: g.info.color(),
            accentHover: b.accentHover.color(),
            accentSoft: b.accentSoft.color(),
            onAccentSoft: b.onAccentSoft.color(),
            successSoft: g.successSoft.color(),
            warningSoft: g.warningSoft.color(),
            dangerSoft: g.dangerSoft.color(),
            infoSoft: g.infoSoft.color(),
            borderStrong: g.borderStrong.color(),
            focus: b.accent.color(),
            selection: b.selection.color(),
            elevationRingWidth: ring ? 1 : 0
        )
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
