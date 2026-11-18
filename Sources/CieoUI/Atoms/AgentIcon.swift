import SwiftUI

/// The 24 geometric agent action and state roles from Cieo's square-agent identity system.
public enum AgentIconRole: String, CaseIterable, Equatable, Sendable {
    public enum Group: String, CaseIterable, Equatable, Sendable {
        case doing = "Doing"
        case talking = "Talking"
        case waiting = "Waiting"
        case outcome = "Outcome"
    }

    case browsing, navigating, clicking, typing, scrolling, inspecting
    case capturing, comparing, pinning, thinking, planning
    case commenting, suggesting, asking, handing, taking
    case waiting, paused, scheduled, offline
    case retrying, done, failed, blocked

    public var group: Group {
        switch self {
        case .browsing, .navigating, .clicking, .typing, .scrolling, .inspecting,
             .capturing, .comparing, .pinning, .thinking, .planning:
            .doing
        case .commenting, .suggesting, .asking, .handing, .taking:
            .talking
        case .waiting, .paused, .scheduled, .offline:
            .waiting
        case .retrying, .done, .failed, .blocked:
            .outcome
        }
    }
}

/// Crisp geometric square-agent icon drawn in a 64-unit coordinate grid.
/// People are round (`Avatar`); agents are rounded squares.
public struct AgentIcon: View {
    @Environment(\.componentTheme) private var theme
    @ScaledMetric private var scaledSize: CGFloat

    private let role: AgentIconRole
    private let baseSize: CGFloat
    private let outline: Bool
    private let label: Text?

    public init(_ role: AgentIconRole, size: CGFloat = 24, outline: Bool = true, label: Text? = nil) { // literal-ok: 24pt matches web AGENT_ICONS default viewBox tier
        self.role = role
        let safe = size.isFinite && size > 0 ? size : 24 // literal-ok: fallback for non-finite caller icon size
        self.baseSize = safe
        self.outline = outline
        self.label = label
        _scaledSize = ScaledMetric(wrappedValue: safe)
    }

    public init(_ role: AgentIconRole, size: CGFloat = 24, outline: Bool = true, label: String) { // literal-ok: 24pt matches web AGENT_ICONS default viewBox tier
        self.init(role, size: size, outline: outline, label: Text(verbatim: label))
    }

    public var body: some View {
        let resolvedColor = toneColor
        let canvas = Canvas { context, canvasSize in
            let side = min(canvasSize.width, canvasSize.height)
            guard side > 0 else { return }
            let scale = side / 64.0
            let unitStroke = max(1.7, (1.55 * 64.0) / max(12.0, baseSize))
            let strokeStyle = StrokeStyle(lineWidth: unitStroke * scale, lineCap: .round, lineJoin: .round)
            let shading: GraphicsContext.Shading = resolvedColor.map { .color($0) } ?? .foreground

            if outline {
                let inset = (unitStroke / 2.0 + 3.0) * scale
                let boxSide = max(0, (58.0 - unitStroke) * scale)
                let rect = Self.box(inset, inset, boxSide, boxSide, 1)
                context.stroke(Path(roundedRect: rect, cornerRadius: 15.0 * scale), with: shading, style: strokeStyle) // literal-ok: 64-unit icon coordinate grid
            }
            Self.drawGlyph(role: role, in: &context, scale: scale, shading: shading, stroke: strokeStyle)
        }
        .frame(width: scaledSize, height: scaledSize)

        if let label {
            canvas
                .accessibilityElement(children: .ignore)
                .accessibilityAddTraits(.isImage)
                .accessibilityLabel(label)
        } else {
            canvas.accessibilityHidden(true)
        }
    }

    private var toneColor: Color? {
        switch role {
        case .done: theme.success
        case .failed: theme.danger
        case .blocked: theme.warning
        default: nil
        }
    }

    private static func pt(_ x: CGFloat, _ y: CGFloat, _ s: CGFloat) -> CGPoint {
        CGPoint(x: x * s, y: y * s)
    }

    private static func box(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, _ s: CGFloat) -> CGRect {
        CGRect(x: x * s, y: y * s, width: w * s, height: h * s)
    }

    private static func squarePupil(_ x: CGFloat, _ y: CGFloat, _ side: CGFloat, _ s: CGFloat) -> Path {
        Path(roundedRect: box(x, y, side, side, s), cornerRadius: 2.5 * s) // literal-ok: 64-unit icon coordinate grid
    }

    private static func drawGlyph(
        role: AgentIconRole,
        in ctx: inout GraphicsContext,
        scale s: CGFloat,
        shading: GraphicsContext.Shading,
        stroke: StrokeStyle
    ) {
        var p = Path()
        switch role {
        case .browsing:
            p.move(to: pt(12, 32, s))
            p.addCurve(to: pt(52, 32, s), control1: pt(21, 14, s), control2: pt(43, 14, s))
            p.addCurve(to: pt(12, 32, s), control1: pt(43, 50, s), control2: pt(21, 50, s))
            ctx.stroke(p, with: shading, style: stroke)
            ctx.fill(squarePupil(26.5, 26.5, 11, s), with: shading)
        case .navigating:
            p.move(to: pt(16, 46, s)); p.addLine(to: pt(16, 28, s))
            p.addQuadCurve(to: pt(24, 22, s), control: pt(16, 22, s))
            p.addLine(to: pt(46, 22, s))
            ctx.stroke(p, with: shading, style: stroke)
            ctx.fill(squarePupil(42, 17.5, 9, s), with: shading)
        case .clicking:
            p.move(to: pt(24, 16, s)); p.addLine(to: pt(24, 45, s))
            p.addLine(to: pt(31, 38, s)); p.addLine(to: pt(36, 49, s))
            p.addLine(to: pt(41, 47, s)); p.addLine(to: pt(36, 36, s))
            p.addLine(to: pt(45, 36, s)); p.closeSubpath()
            ctx.stroke(p, with: shading, style: stroke)
        case .typing:
            p.move(to: pt(14, 24, s)); p.addLine(to: pt(48, 24, s))
            p.move(to: pt(14, 38, s)); p.addLine(to: pt(27, 38, s))
            p.move(to: pt(33, 31, s)); p.addLine(to: pt(33, 45, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .scrolling:
            p.move(to: pt(14, 21, s)); p.addLine(to: pt(36, 21, s))
            p.move(to: pt(14, 33, s)); p.addLine(to: pt(29, 33, s))
            p.move(to: pt(14, 45, s)); p.addLine(to: pt(36, 45, s))
            p.move(to: pt(47, 19, s)); p.addLine(to: pt(47, 34, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .inspecting:
            let lens = box(12, 12, 28, 28, s)
            ctx.stroke(Path(roundedRect: lens, cornerRadius: 8 * s), with: shading, style: stroke) // literal-ok: 64-unit icon coordinate grid
            p.move(to: pt(40, 40, s)); p.addLine(to: pt(51, 51, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .capturing:
            for (ax, ay, bx, by, cx, cy) in [(14.0, 26.0, 14.0, 14.0, 26.0, 14.0), (38.0, 14.0, 50.0, 14.0, 50.0, 26.0),
                                             (50.0, 38.0, 50.0, 50.0, 38.0, 50.0), (26.0, 50.0, 14.0, 50.0, 14.0, 38.0)] {
                p.move(to: pt(ax, ay, s)); p.addLine(to: pt(bx, by, s)); p.addLine(to: pt(cx, cy, s))
            }
            ctx.stroke(p, with: shading, style: stroke)
            ctx.fill(squarePupil(27, 27, 10, s), with: shading)
        case .comparing:
            ctx.stroke(Path(roundedRect: box(14, 16, 22, 18, s), cornerRadius: 3 * s), with: shading, style: stroke) // literal-ok: 64-unit icon coordinate grid
            ctx.stroke(Path(roundedRect: box(28, 30, 22, 18, s), cornerRadius: 3 * s), with: shading, style: stroke) // literal-ok: 64-unit icon coordinate grid
        case .pinning:
            ctx.stroke(Path(ellipseIn: box(24, 18, 16, 16, s)), with: shading, style: stroke)
            p.move(to: pt(32, 34, s)); p.addLine(to: pt(40, 46, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .thinking:
            p.move(to: pt(32, 15, s)); p.addLine(to: pt(32, 49, s))
            ctx.stroke(p, with: shading, style: stroke)
            ctx.stroke(Path(ellipseIn: box(23, 15, 18, 34, s)), with: shading, style: stroke)
        case .planning:
            p.move(to: pt(15, 47, s)); p.addLine(to: pt(25, 47, s)); p.addLine(to: pt(25, 37, s))
            p.addLine(to: pt(35, 37, s)); p.addLine(to: pt(35, 27, s)); p.addLine(to: pt(46, 27, s))
            ctx.stroke(p, with: shading, style: stroke)
            ctx.fill(squarePupil(40, 21, 10, s), with: shading)
        case .commenting:
            p.move(to: pt(14, 14, s)); p.addLine(to: pt(50, 14, s)); p.addLine(to: pt(50, 38, s))
            p.addLine(to: pt(29, 38, s)); p.addLine(to: pt(21, 46, s)); p.addLine(to: pt(21, 38, s))
            p.addLine(to: pt(14, 38, s)); p.closeSubpath()
            p.move(to: pt(21, 24, s)); p.addLine(to: pt(43, 24, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .suggesting:
            p.move(to: pt(14, 44, s)); p.addLine(to: pt(26, 44, s))
            p.move(to: pt(31, 44, s)); p.addLine(to: pt(33, 36, s)); p.addLine(to: pt(43, 25, s))
            p.addLine(to: pt(50, 32, s)); p.addLine(to: pt(39, 42, s)); p.closeSubpath()
            ctx.stroke(p, with: shading, style: stroke)
        case .asking:
            p.move(to: pt(25, 24, s))
            p.addCurve(to: pt(39, 25, s), control1: pt(25, 17, s), control2: pt(39, 17, s))
            p.addCurve(to: pt(32, 38, s), control1: pt(39, 31, s), control2: pt(32, 31, s))
            ctx.stroke(p, with: shading, style: stroke)
            ctx.fill(squarePupil(28, 44, 8, s), with: shading)
        case .handing:
            p.move(to: pt(13, 36, s)); p.addLine(to: pt(33, 32, s))
            p.move(to: pt(39, 18, s)); p.addLine(to: pt(49, 18, s)); p.addLine(to: pt(49, 46, s)); p.addLine(to: pt(39, 46, s))
            ctx.stroke(p, with: shading, style: stroke)
            ctx.fill(squarePupil(14.5, 30.3, 9, s), with: shading)
        case .taking:
            ctx.stroke(Path(ellipseIn: box(33, 19, 12, 12, s)), with: shading, style: stroke)
            p.move(to: pt(28, 49, s)); p.addQuadCurve(to: pt(36, 38, s), control: pt(28, 38, s))
            p.addLine(to: pt(42, 38, s)); p.addQuadCurve(to: pt(50, 49, s), control: pt(50, 38, s))
            ctx.stroke(p, with: shading, style: stroke)
            ctx.fill(squarePupil(12, 35, 9, s), with: shading)
        case .waiting:
            p.move(to: pt(22, 17, s)); p.addLine(to: pt(42, 17, s))
            p.move(to: pt(22, 47, s)); p.addLine(to: pt(42, 47, s))
            p.move(to: pt(25, 17, s)); p.addLine(to: pt(39, 47, s))
            p.move(to: pt(39, 17, s)); p.addLine(to: pt(25, 47, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .paused:
            p.move(to: pt(24, 17, s)); p.addLine(to: pt(24, 47, s))
            p.move(to: pt(40, 17, s)); p.addLine(to: pt(40, 47, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .scheduled:
            ctx.stroke(Path(ellipseIn: box(16, 16, 32, 32, s)), with: shading, style: stroke)
            p.move(to: pt(32, 32, s)); p.addLine(to: pt(32, 21, s))
            p.move(to: pt(32, 32, s)); p.addLine(to: pt(41.5, 37.5, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .offline:
            p.move(to: pt(18, 29, s)); p.addQuadCurve(to: pt(46, 29, s), control: pt(32, 18, s))
            p.move(to: pt(18, 17, s)); p.addLine(to: pt(46, 47, s))
            ctx.stroke(p, with: shading, style: stroke)
            ctx.fill(squarePupil(28.5, 41.5, 7, s), with: shading)
        case .retrying:
            p.addArc(center: pt(32, 32, s), radius: 15 * s, startAngle: .degrees(-90), endAngle: .degrees(220), clockwise: false)
            p.move(to: pt(26.6, 12.5, s)); p.addLine(to: pt(32, 17, s)); p.addLine(to: pt(26.6, 21.5, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .done:
            p.move(to: pt(19, 33, s)); p.addLine(to: pt(27, 41, s)); p.addLine(to: pt(46, 22, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .failed:
            p.move(to: pt(22, 22, s)); p.addLine(to: pt(42, 42, s))
            p.move(to: pt(42, 22, s)); p.addLine(to: pt(22, 42, s))
            ctx.stroke(p, with: shading, style: stroke)
        case .blocked:
            p.move(to: pt(25, 31, s)); p.addLine(to: pt(25, 25, s))
            p.addCurve(to: pt(39, 25, s), control1: pt(25, 14, s), control2: pt(39, 14, s))
            p.addLine(to: pt(39, 31, s))
            ctx.stroke(p, with: shading, style: stroke)
            ctx.stroke(Path(roundedRect: box(19, 31, 26, 19, s), cornerRadius: 4 * s), with: shading, style: stroke) // literal-ok: 64-unit icon coordinate grid
            ctx.fill(squarePupil(29, 37.5, 6, s), with: shading)
        }
    }
}
