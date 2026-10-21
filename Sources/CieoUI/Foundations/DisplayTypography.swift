import SwiftUI

/// One heavy, tightly tracked text style. Sizes are points at the default text size and scale with
/// Dynamic Type relative to `textStyle`, up to `maximumSize` so numerals stay on screen at the largest sizes.
public struct DisplayStyle: Sendable, Equatable {
    public let size: CGFloat
    public let maximumSize: CGFloat
    public let textStyle: Font.TextStyle
    public let weight: Font.Weight
    /// Letter spacing as a fraction of the font size, as CSS `em` tracking is written.
    public let tracking: CGFloat
    /// A custom font family face to use instead of the system font, by PostScript name. `weight` still
    /// applies, so name the family's regular face and let the weight pick its heavy one; a weight-varied
    /// copy registered at run time does not resolve on iOS. Nil keeps the system font.
    public let fontName: String?
    public let monospacedDigits: Bool

    public init(size: CGFloat, maximumSize: CGFloat? = nil, textStyle: Font.TextStyle,
                weight: Font.Weight = .heavy, tracking: CGFloat = 0, fontName: String? = nil,
                monospacedDigits: Bool = false)
    {
        let size = size.isFinite && size > 0 ? size : 17
        self.size = size
        let limit = maximumSize ?? size * 2
        self.maximumSize = limit.isFinite ? max(size, limit) : size * 2
        self.textStyle = textStyle
        self.weight = weight
        self.tracking = tracking.isFinite ? min(0.2, max(-0.2, tracking)) : 0
        self.fontName = fontName.flatMap { $0.isEmpty ? nil : $0 }
        self.monospacedDigits = monospacedDigits
    }

    /// The font at an already scaled size.
    public func font(at size: CGFloat) -> Font {
        let base: Font = fontName.map { .custom($0, fixedSize: size).weight(weight) }
            ?? .system(size: size, weight: weight)
        return monospacedDigits ? base.monospacedDigit() : base
    }

    /// The scaled size, held to the style's maximum.
    public func clamped(_ scaled: CGFloat) -> CGFloat {
        scaled.isFinite ? min(maximumSize, max(size * 0.5, scaled)) : size
    }
}

/// The display roles a screen uses: page titles, section headings and three numeral sizes.
public enum DisplayRole: Sendable, CaseIterable {
    case display, title, headline, numeralLarge, numeralMedium, numeralSmall
}

/// Host-owned display text. Defaults are sized for a phone; hosts install larger values for wide layouts.
public struct DisplayTypography: Sendable, Equatable {
    public var display: DisplayStyle
    public var title: DisplayStyle
    public var headline: DisplayStyle
    public var numeralLarge: DisplayStyle
    public var numeralMedium: DisplayStyle
    public var numeralSmall: DisplayStyle

    public init(
        display: DisplayStyle = .init(size: 30, maximumSize: 52, textStyle: .largeTitle, weight: .black, tracking: -0.05),
        title: DisplayStyle = .init(size: 22, maximumSize: 40, textStyle: .title2, weight: .heavy, tracking: -0.035),
        headline: DisplayStyle = .init(size: 20, maximumSize: 36, textStyle: .title3, weight: .heavy, tracking: -0.025),
        numeralLarge: DisplayStyle = .init(size: 64, maximumSize: 80, textStyle: .largeTitle, weight: .black, tracking: -0.06, monospacedDigits: true),
        numeralMedium: DisplayStyle = .init(size: 44, maximumSize: 60, textStyle: .largeTitle, weight: .black, tracking: -0.06, monospacedDigits: true),
        numeralSmall: DisplayStyle = .init(size: 28, maximumSize: 44, textStyle: .title, weight: .black, tracking: -0.05, monospacedDigits: true)
    ) {
        self.display = display; self.title = title; self.headline = headline
        self.numeralLarge = numeralLarge; self.numeralMedium = numeralMedium; self.numeralSmall = numeralSmall
    }

    public subscript(role: DisplayRole) -> DisplayStyle {
        switch role {
        case .display: display
        case .title: title
        case .headline: headline
        case .numeralLarge: numeralLarge
        case .numeralMedium: numeralMedium
        case .numeralSmall: numeralSmall
        }
    }
}

private struct ScaledDisplayText: ViewModifier {
    let style: DisplayStyle
    @ScaledMetric private var scaled: CGFloat

    init(style: DisplayStyle) {
        self.style = style
        _scaled = ScaledMetric(wrappedValue: style.size, relativeTo: style.textStyle)
    }

    func body(content: Content) -> some View {
        let size = style.clamped(scaled)
        content.font(style.font(at: size)).tracking(size * style.tracking)
    }
}

private struct DisplayText: ViewModifier {
    @Environment(\.displayTypography) private var typography
    let role: DisplayRole

    func body(content: Content) -> some View {
        content.modifier(ScaledDisplayText(style: typography[role]))
    }
}

public extension View {
    /// Set text in one of the host's display roles.
    func displayText(_ role: DisplayRole) -> some View {
        modifier(DisplayText(role: role))
    }

    /// Set text in an explicit display style.
    func displayText(_ style: DisplayStyle) -> some View {
        modifier(ScaledDisplayText(style: style))
    }
}
