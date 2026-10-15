import SwiftUI

/// Host-owned text roles. Prefer scalable system or custom fonts.
public struct ComponentTypography {
    public var action: Font
    public var selection: Font
    public var field: Font
    public var fieldLabel: Font

    public init(action: Font = .body.weight(.semibold), selection: Font = .body,
                field: Font = .body, fieldLabel: Font = .headline) {
        self.action = action; self.selection = selection
        self.field = field; self.fieldLabel = fieldLabel
    }
}

/// Validated host geometry; controls retain a 44-point target floor.
public struct ComponentMetrics {
    public let compact: CGFloat
    public let standard: CGFloat
    public let corner: CGFloat
    public let touchTarget: CGFloat

    public init(compact: CGFloat = 8, standard: CGFloat = 16,
                corner: CGFloat = 12, touchTarget: CGFloat = 44) {
        self.compact = Self.dimension(compact, fallback: 8)
        self.standard = Self.dimension(standard, fallback: 16)
        self.corner = Self.dimension(corner, fallback: 12)
        self.touchTarget = max(44, Self.dimension(touchTarget, fallback: 44))
    }

    static func dimension(_ value: CGFloat, fallback: CGFloat) -> CGFloat {
        value.isFinite ? max(0, value) : fallback
    }
}

/// Optional per-control host overrides; omitted values inherit component roles.
public struct ControlAppearance {
    public enum BorderPlacement: Sendable { case centered, inset }
    public let font: Font?
    public let horizontalPadding: CGFloat?
    public let verticalPadding: CGFloat?
    public let minWidth: CGFloat?
    public let minHeight: CGFloat?
    public let cornerRadius: CGFloat?
    public let foreground: Color?
    public let background: Color?
    public let border: Color?
    public let borderPlacement: BorderPlacement
    public let pressedOpacity: CGFloat
    public let disabledOpacity: CGFloat
    public let pressedScale: CGFloat
    public let borderWidth: CGFloat

    public init(font: Font? = nil, horizontalPadding: CGFloat? = nil,
                verticalPadding: CGFloat? = nil, minWidth: CGFloat? = nil,
                minHeight: CGFloat? = nil, cornerRadius: CGFloat? = nil,
                foreground: Color? = nil, background: Color? = nil,
                border: Color? = nil, borderWidth: CGFloat = 1,
                borderPlacement: BorderPlacement = .inset, pressedOpacity: CGFloat = 0.75,
                disabledOpacity: CGFloat = 0.5, pressedScale: CGFloat = 0.98) {
        self.font = font
        self.horizontalPadding = Self.dimension(horizontalPadding)
        self.verticalPadding = Self.dimension(verticalPadding)
        self.minWidth = Self.dimension(minWidth).map { max(44, $0) }
        self.minHeight = Self.dimension(minHeight).map { max(44, $0) }
        self.cornerRadius = Self.dimension(cornerRadius)
        self.foreground = foreground; self.background = background; self.border = border
        self.borderWidth = ComponentMetrics.dimension(borderWidth, fallback: 1)
        self.borderPlacement = borderPlacement
        self.pressedOpacity = Self.unit(pressedOpacity, fallback: 0.75)
        self.disabledOpacity = Self.unit(disabledOpacity, fallback: 0.5)
        self.pressedScale = Self.unit(pressedScale, fallback: 0.98)
    }

    private static func unit(_ value: CGFloat, fallback: CGFloat) -> CGFloat {
        value.isFinite ? min(1, max(0, value)) : fallback
    }

    private static func dimension(_ value: CGFloat?) -> CGFloat? {
        guard let value, value.isFinite else { return nil }
        return max(0, value)
    }
}
