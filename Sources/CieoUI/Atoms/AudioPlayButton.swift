import SwiftUI

/// A round play/pause toggle whose glyph morphs between the two shapes on the snap spring. The host owns
/// the playing state; this owns the spoken name, the busy ring and the morph.
public struct AudioPlayButton: View {
    /// How large the round button is. Every size keeps the full touch target.
    public enum Size: Sendable, CaseIterable { case small, medium, large }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    private let playing: Bool
    private let loading: Bool
    private let label: String
    private let size: Size
    private let action: () -> Void

    /// `label` names the clip ("Voice note from Ana") and is read after Play or Pause.
    public init(playing: Bool, loading: Bool = false, label: String, size: Size = .medium,
                action: @escaping () -> Void) {
        self.playing = playing
        self.loading = loading
        self.label = label
        self.size = size
        self.action = action
    }

    public var body: some View {
        let side = Self.diameter(size, metrics: metrics)
        Button(action: action) {
            ZStack {
                Circle().fill(theme.accent)
                PlayPauseShape(pause: playing ? 1 : 0)
                    .fill(theme.onAccent)
                    .padding(side * Self.glyphInset)
                    .motion(.snap, value: playing)
                    .opacity(loading ? 0 : 1)
                if loading { LoadingRing(reduceMotion: reduceMotion) }
            }
            .frame(width: side, height: side)
            .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
            .contentShape(.circle)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Self.accessibleName(playing: playing, label: label))
        .accessibilityValue(loading ? Text("Loading") : Text(verbatim: ""))
    }

    /// Accessible name for the button: "Play Voice note" or "Pause Voice note".
    public static func accessibleName(playing: Bool, label: String) -> String {
        "\(playing ? "Pause" : "Play") \(label)"
    }

    /// The round button's side for a size: the touch target, plus a step for larger sizes.
    public static func diameter(_ size: Size, metrics: ComponentMetrics) -> CGFloat {
        switch size {
        case .small: metrics.touchTarget
        case .medium: metrics.touchTarget + metrics.tight
        case .large: metrics.touchTarget + metrics.standard
        }
    }

    /// Share of the button's side left empty around the glyph.
    static let glyphInset: CGFloat = 0.3 // literal-ok: glyph geometry inside the circle, a share of its own side
}

/// A triangle that becomes two bars as `pause` runs from 0 to 1. Both are four-point polygons, so every
/// frame in between is a clean in-between shape.
struct PlayPauseShape: Shape {
    var pause: Double

    var animatableData: Double {
        get { pause }
        set { pause = newValue }
    }

    /// Corner points of the left and right polygons in a unit square, for play (0) and pause (1).
    static func points(pause t: Double) -> [[CGPoint]] {
        let play: [[CGPoint]] = [
            [CGPoint(x: 0.08, y: 0), CGPoint(x: 0.54, y: 0.27), CGPoint(x: 0.54, y: 0.73), CGPoint(x: 0.08, y: 1)],
            [CGPoint(x: 0.54, y: 0.27), CGPoint(x: 1, y: 0.5), CGPoint(x: 1, y: 0.5), CGPoint(x: 0.54, y: 0.73)],
        ]
        let pauseBars: [[CGPoint]] = [
            [CGPoint(x: 0.08, y: 0), CGPoint(x: 0.38, y: 0), CGPoint(x: 0.38, y: 1), CGPoint(x: 0.08, y: 1)],
            [CGPoint(x: 0.62, y: 0), CGPoint(x: 0.92, y: 0), CGPoint(x: 0.92, y: 1), CGPoint(x: 0.62, y: 1)],
        ]
        let p = CGFloat(min(1, max(0, t)))
        return zip(play, pauseBars).map { a, b in
            zip(a, b).map { CGPoint(x: $0.x + ($1.x - $0.x) * p, y: $0.y + ($1.y - $0.y) * p) }
        }
    }

    func path(in rect: CGRect) -> Path {
        var path = Path()
        for polygon in Self.points(pause: pause) {
            path.addLines(polygon.map { CGPoint(x: rect.minX + $0.x * rect.width, y: rect.minY + $0.y * rect.height) })
            path.closeSubpath()
        }
        return path
    }
}

/// A partial ring that turns while a clip loads. It is static under Reduce Motion and stops when removed.
private struct LoadingRing: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    let reduceMotion: Bool

    var body: some View {
        if reduceMotion {
            ring(angle: 0)
        } else {
            TimelineView(.animation) { context in
                ring(angle: context.date.timeIntervalSinceReferenceDate.truncatingRemainder(dividingBy: Self.period) / Self.period * 360)
            }
        }
    }

    private func ring(angle: Double) -> some View {
        Circle().trim(from: 0, to: 0.7) // literal-ok: arc length of the busy ring
            .stroke(theme.onAccent, style: StrokeStyle(lineWidth: metrics.thinBar / 2, lineCap: .round)) // literal-ok: half a thin bar
            .rotationEffect(.degrees(angle))
            .padding(metrics.medium)
            .accessibilityHidden(true)
    }

    private static let period: Double = 1 // literal-ok: seconds per turn of the busy ring
}

#Preview("Play button") {
    HStack {
        AudioPlayButton(playing: false, label: "Voice note") {}
        AudioPlayButton(playing: true, label: "Voice note") {}
        AudioPlayButton(playing: false, loading: true, label: "Voice note") {}
    }
    .padding()
}
