import SwiftUI

/// A flat colour panel for the one thing in a section the reader is working in: a quiz, a form,
/// the selected item. An optional circle can bleed off one corner as decoration.
public struct BlockPanel<Content: View>: View {
    public enum Tone: Sendable { case block, surface, accent }

    public struct Bleed: Sendable {
        public let corner: CutCorner
        public let diameter: CGFloat
        public let color: Color?
        /// `color` defaults to the accent; on an accent panel, to the block colour.
        public init(corner: CutCorner = .topTrailing, diameter: CGFloat = 200, color: Color? = nil) {
            self.corner = corner
            self.diameter = diameter.isFinite ? min(600, max(0, diameter)) : 200
            self.color = color
        }
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    private let tone: Tone
    private let bleed: Bleed?
    private let cornerRadius: CGFloat
    private let content: Content

    public init(tone: Tone = .block, bleed: Bleed? = nil, cornerRadius: CGFloat = 32,
                @ViewBuilder content: () -> Content)
    {
        self.tone = tone
        self.bleed = bleed
        self.cornerRadius = cornerRadius.isFinite ? max(0, cornerRadius) : 32 // literal-ok: fallback for an invalid radius, matching the default
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.medium) { content }
            .foregroundStyle(foreground)
            // Text stays clear of the circle, so it never sits on the accent at low contrast.
            .padding(.trailing, bleed.map { Self.reservedWidth($0, inset: metrics.loose) } ?? 0)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, metrics.loose)
            .padding(.vertical, metrics.section)
            .background { background }
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
    }

    private var fill: Color {
        switch tone {
        case .block: theme.block
        case .surface: theme.surface
        case .accent: theme.accent
        }
    }

    private var foreground: Color {
        switch tone {
        case .block: theme.onBlock
        case .surface: theme.foreground
        case .accent: theme.onAccent
        }
    }

    private var background: some View {
        fill.overlay(alignment: bleed.map { Self.alignment($0.corner) } ?? .topTrailing) {
            if let bleed {
                Circle().fill(bleed.color ?? (tone == .accent ? theme.block : theme.accent))
                    .frame(width: bleed.diameter, height: bleed.diameter)
                    .offset(Self.offset(bleed))
                    .accessibilityHidden(true)
            }
        }
        .clipped()
    }

    /// The width of the circle that shows inside the panel (70% of it), minus the panel's own horizontal padding.
    public static func reservedWidth(_ bleed: Bleed, inset: CGFloat = ComponentMetrics().loose) -> CGFloat {
        max(0, bleed.diameter * 0.7 - inset)
    }

    /// The circle sits 30% outside its corner, as the study's bleeding circles do.
    public static func offset(_ bleed: Bleed) -> CGSize {
        let shift = bleed.diameter * 0.3
        let x = bleed.corner == .topLeading || bleed.corner == .bottomLeading ? -shift : shift
        let y = bleed.corner == .topLeading || bleed.corner == .topTrailing ? -shift : shift
        return CGSize(width: x, height: y)
    }

    static func alignment(_ corner: CutCorner) -> Alignment {
        switch corner {
        case .topLeading: .topLeading
        case .topTrailing: .topTrailing
        case .bottomLeading: .bottomLeading
        case .bottomTrailing: .bottomTrailing
        }
    }
}
