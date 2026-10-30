import SwiftUI

/// Host-owned text roles. Prefer scalable system or custom fonts. Components pick a role, never a font,
/// so one host value restyles every place that role appears.
public struct ComponentTypography {
    public var action: Font
    public var selection: Font
    public var field: Font
    public var fieldLabel: Font
    /// A section or panel title.
    public var title: Font
    /// A smaller panel title.
    public var subtitle: Font
    /// A row or notice heading.
    public var heading: Font
    /// A heading that has to hold its own next to display type: ranked rows, steps, sheet sections.
    public var strongHeading: Font
    public var body: Font
    public var strongBody: Font
    /// Supporting text under a heading.
    public var detail: Font
    /// A short bold caption, such as the label beside a big number.
    public var strongDetail: Font
    /// Running text people read at length, such as an article or lesson body. A host can size it
    /// differently by width (smaller on a phone than on a tablet) and scale it with Dynamic Type.
    public var reading: Font
    /// A glyph that sits beside text, such as a disclosure chevron or pager arrow.
    public var glyph: Font
    /// A standalone glyph that is the control, such as the info button.
    public var prominentGlyph: Font
    /// A value read at a glance, such as a ring's percentage.
    public var value: Font
    /// A step number or check inside a marker.
    public var marker: Font
    // MARK: - Social and audio
    /// The smallest readable text, such as a count inside a ring.
    public var caption: Font
    /// A glyph beside the smallest text, such as a count badge's mark or a caption's icon.
    public var smallGlyph: Font

    public init(action: Font = .body.weight(.semibold), selection: Font = .body,
                field: Font = .body, fieldLabel: Font = .headline,
                title: Font = .title2.bold(), subtitle: Font = .title3.bold(),
                heading: Font = .headline, strongHeading: Font = .headline.weight(.heavy),
                body: Font = .body, strongBody: Font = .body.weight(.semibold),
                detail: Font = .subheadline, strongDetail: Font = .subheadline.weight(.bold), reading: Font = .subheadline,
                glyph: Font = .footnote.weight(.semibold), prominentGlyph: Font = .title3,
                value: Font = .headline.monospacedDigit(), marker: Font = .headline.weight(.black),
                caption: Font = .caption2.weight(.semibold), smallGlyph: Font = .caption2.weight(.semibold)) {
        self.action = action; self.selection = selection
        self.field = field; self.fieldLabel = fieldLabel
        self.title = title; self.subtitle = subtitle
        self.heading = heading; self.strongHeading = strongHeading
        self.body = body; self.strongBody = strongBody
        self.detail = detail; self.strongDetail = strongDetail
        self.reading = reading
        self.glyph = glyph; self.prominentGlyph = prominentGlyph
        self.value = value; self.marker = marker
        self.caption = caption
        self.smallGlyph = smallGlyph
    }
}

/// Validated host geometry; controls retain a 44-point target floor.
/// Spacing is a scale (`tight` 4, `compact` 8, `snug` 10, `medium` 12, `standard` 16, `loose` 20, `section` 24) so
/// components choose a step, never a number.
public struct ComponentMetrics {
    public let tight: CGFloat
    public let compact: CGFloat
    /// The step between compact and medium: the inside of a pill or chip, or a tight list's row gap.
    public let snug: CGFloat
    public let medium: CGFloat
    public let standard: CGFloat
    public let loose: CGFloat
    public let section: CGFloat
    public let corner: CGFloat
    public let touchTarget: CGFloat
    /// Thickness of a bar, ring or segment that carries a value.
    public let bar: CGFloat
    /// Thickness of a bar that sits inside a row beside text.
    public let thinBar: CGFloat
    /// Width of an outline or divider.
    public let hairline: CGFloat
    /// A glyph's side as a share of the line of text it sits beside, from 0 to 1. A drawn shape fills a
    /// square this size; an SF Symbol keeps the size its font gives it.
    public let glyphScale: CGFloat
    // MARK: - Social and audio
    /// A person's picture beside a post.
    public let avatar: CGFloat
    /// A person's picture beside a reply.
    public let avatarSmall: CGFloat
    /// The line that joins a thread's replies.
    public let rail: CGFloat
    /// A small round indicator such as a count ring.
    public let ring: CGFloat
    /// A link card's square thumbnail.
    public let thumbnail: CGFloat

    public init(tight: CGFloat = 4, compact: CGFloat = 8, snug: CGFloat = 10, medium: CGFloat = 12, standard: CGFloat = 16,
                loose: CGFloat = 20, section: CGFloat = 24, corner: CGFloat = 12, touchTarget: CGFloat = 44,
                bar: CGFloat = 8, thinBar: CGFloat = 6, hairline: CGFloat = 1, glyphScale: CGFloat = 0.8,
                avatar: CGFloat = 36, avatarSmall: CGFloat = 24, rail: CGFloat = 2, ring: CGFloat = 24,
                thumbnail: CGFloat = 88) {
        self.tight = Self.dimension(tight, fallback: 4)
        self.compact = Self.dimension(compact, fallback: 8)
        self.snug = Self.dimension(snug, fallback: 10)
        self.medium = Self.dimension(medium, fallback: 12)
        self.standard = Self.dimension(standard, fallback: 16)
        self.loose = Self.dimension(loose, fallback: 20)
        self.section = Self.dimension(section, fallback: 24)
        self.corner = Self.dimension(corner, fallback: 12)
        self.touchTarget = max(44, Self.dimension(touchTarget, fallback: 44))
        self.bar = Self.dimension(bar, fallback: 8)
        self.thinBar = Self.dimension(thinBar, fallback: 6)
        self.hairline = Self.dimension(hairline, fallback: 1)
        self.glyphScale = min(1, Self.dimension(glyphScale, fallback: 0.8))
        self.avatar = Self.dimension(avatar, fallback: 36)
        self.avatarSmall = Self.dimension(avatarSmall, fallback: 24)
        self.rail = Self.dimension(rail, fallback: 2)
        self.ring = Self.dimension(ring, fallback: 24)
        self.thumbnail = Self.dimension(thumbnail, fallback: 88)
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
