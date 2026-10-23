import Cieo
import SwiftUI

/// A numbered teardrop marker whose tip sits on a point of its parent, given as 0...1 fractions. One pin is
/// one comment thread; the host owns the thread it opens. It fills the space it is given and takes no taps
/// outside the pin, so `AnnotationLayer` (or any sized parent) can stack it over content.
public struct AnnotationPin: View {
    public enum State: String, Sendable, CaseIterable {
        /// The unsent pin.
        case draft
        /// A pin with a live thread.
        case open
        /// A finished thread: muted and smaller.
        case resolved
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ScaledMetric private var diameter: CGFloat = AnnotationPin.defaultDiameter
    @SwiftUI.State private var arrived = false
    private let index: Int
    private let x: Double
    private let y: Double
    private let state: State
    private let selected: Bool
    private let author: String?
    private let initials: String?
    private let onSelect: (() -> Void)?

    /// `index` is the 1-based number drawn and spoken. `x` and `y` are the tip's place in the parent, 0...1,
    /// clamped. `initials` (up to three characters) replace the number; `author` joins the spoken name.
    public init(index: Int, x: Double, y: Double, state: State = .open, selected: Bool = false,
                author: String? = nil, initials: String? = nil, onSelect: (() -> Void)? = nil) {
        self.index = index
        self.x = Self.clampUnit(x)
        self.y = Self.clampUnit(y)
        self.state = state
        self.selected = selected
        self.author = author
        self.initials = initials
        self.onSelect = onSelect
    }

    public var body: some View {
        GeometryReader { proxy in
            let size = pinSize
            let hit = CGSize(width: max(size.width, metrics.touchTarget), height: max(size.height, metrics.touchTarget))
            Button { onSelect?() } label: {
                ZStack(alignment: .bottom) { teardrop(size) }
                    .frame(width: hit.width, height: hit.height, alignment: .bottom)
                    .contentShape(.rect)
            }
            .buttonStyle(.plain)
            .scaleEffect(arrived ? 1 : Self.popFrom, anchor: .bottom)
            .opacity(arrived ? 1 : Motion.arriveOpacity)
            .position(x: x * proxy.size.width, y: y * proxy.size.height - hit.height / 2)
            .accessibilityLabel(Self.annotationPinLabel(index, state: state, author: author))
            .accessibilityAddTraits(selected ? .isSelected : [])
        }
        .onAppear { withMotion(.snap, reduceMotion: reduceMotion) { arrived = true } }
        .motion(.snap, value: selected)
    }

    private var pinSize: CGSize {
        let scale = state == .resolved ? Self.resolvedScale : 1
        return CGSize(width: diameter * scale, height: Self.height(forDiameter: diameter * scale))
    }

    private func teardrop(_ size: CGSize) -> some View {
        ZStack(alignment: .top) {
            Teardrop().fill(fill)
            if selected {
                Teardrop().stroke(theme.foreground, lineWidth: metrics.hairline * 2) // literal-ok: ring is two hairlines
            }
            Text(verbatim: label)
                .font(typography.glyph)
                .foregroundStyle(textColor)
                .lineLimit(1)
                .minimumScaleFactor(PersonFace.shrinkLimit)
                .frame(width: size.width, height: size.width)
        }
        .frame(width: size.width, height: size.height)
        .accessibilityHidden(true)
    }

    private var label: String {
        if let initials, !initials.trimmingCharacters(in: .whitespaces).isEmpty {
            return String(initials.trimmingCharacters(in: .whitespaces).prefix(3))
        }
        return String(max(1, index))
    }

    private var fill: Color {
        switch state {
        case .draft: theme.block
        case .open: theme.accent
        case .resolved: theme.subtle
        }
    }

    private var textColor: Color { state == .draft ? theme.onBlock : theme.onAccent }

    // MARK: - Geometry and pure helpers

    /// Width of an open pin's round body before Dynamic Type.
    public static let defaultDiameter: CGFloat = 28 // literal-ok: pin body is component geometry
    /// Height of a pin as a multiple of its width: the round body plus the tip.
    static let heightRatio: CGFloat = 1.3 // literal-ok: teardrop proportion
    /// Share of the size a resolved pin draws at.
    static let resolvedScale: CGFloat = 0.8 // literal-ok: resolved pins are smaller
    /// The scale a pin pops in from, about its tip.
    static let popFrom: CGFloat = 0.45 // literal-ok: arrival scale

    /// Height of a pin whose body is `diameter` wide.
    public static func height(forDiameter diameter: CGFloat) -> CGFloat { diameter * heightRatio }

    /// How far the centre of the round body sits above the tip.
    public static func centreRise(diameter: CGFloat) -> CGFloat { height(forDiameter: diameter) - diameter / 2 }

    /// Accessible name: "Comment 3, open" or "Comment 3 by Ava, resolved". The index is clamped to at least 1.
    public static func annotationPinLabel(_ index: Int, state: State = .open, author: String? = nil) -> String {
        let n = max(1, index)
        let name = author?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let by = name.isEmpty ? "" : " by \(name)"
        return "Comment \(n)\(by), \(state.rawValue)"
    }

    /// Clamps a layer coordinate to 0...1; NaN becomes 0.
    public static func clampUnit(_ value: Double) -> Double {
        value.isFinite ? min(1, max(0, value)) : 0
    }
}

/// A round head over a point: the circle with straight sides running to a tip at the bottom edge.
struct Teardrop: Shape {
    func path(in rect: CGRect) -> Path {
        let r = rect.width / 2
        let centre = CGPoint(x: rect.midX, y: rect.minY + r)
        let tip = CGPoint(x: rect.midX, y: rect.maxY)
        let reach = tip.y - centre.y
        guard reach > r else { return Path(ellipseIn: rect) }
        let phi = acos(r / reach)
        let right = CGPoint(x: centre.x + r * sin(phi), y: centre.y + r * cos(phi))
        var path = Path()
        path.move(to: tip)
        path.addLine(to: right)
        path.addArc(center: centre, radius: r, startAngle: .radians(.pi / 2 - phi),
                    endAngle: .radians(.pi / 2 + phi), clockwise: true)
        path.closeSubpath()
        return path
    }
}

#Preview {
    ZStack {
        AnnotationPin(index: 1, x: 0.25, y: 0.5)
        AnnotationPin(index: 2, x: 0.5, y: 0.5, selected: true)
        AnnotationPin(index: 3, x: 0.75, y: 0.5, state: .resolved)
        AnnotationPin(index: 4, x: 0.5, y: 0.9, state: .draft, initials: "AV")
    }.frame(width: 300, height: 200) // literal-ok: preview scaffolding
}
