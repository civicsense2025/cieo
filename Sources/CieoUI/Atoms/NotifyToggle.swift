import Cieo
import SwiftUI

/// A bell toggle for "tell me about new replies": it rings once and pops a check badge when turned on.
/// The host owns the state. Under Reduce Motion the bell stays still and the badge appears without travel.
public struct NotifyToggle: View {
    /// Total length of the ring, in milliseconds.
    public static let bellWiggleMilliseconds = 420
    /// Largest swing of the ring, in degrees.
    public static let bellWiggleDegrees = 12.0

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Binding private var isOn: Bool
    private let label: Text
    @State private var rings = 0

    /// `label` is a request in plain words; it names the control for VoiceOver.
    public init(isOn: Binding<Bool>, label: Text = Text("Notify me about new replies")) {
        _isOn = isOn
        self.label = label
    }

    public init(isOn: Binding<Bool>, label: LocalizedStringKey) {
        self.init(isOn: isOn, label: Text(label))
    }

    /// Bell angle in degrees at progress `t` (0 to 1): a damped swing that starts and ends at rest.
    /// Out-of-range `t` clamps; non-finite `t` is rest.
    public static func bellWiggleAngle(_ t: Double) -> Double {
        let p = t.isFinite ? min(1, max(0, t)) : 0
        let damping: Double = exp(-4.5 * p)
        let swing: Double = sin(p * Double.pi * 5)
        let degrees: Double = bellWiggleDegrees * damping * swing
        return (degrees * 100).rounded() / 100
    }

    /// Keyframe angles sampled from the damped swing, first and last at rest.
    public static func bellWiggleFrames(steps: Int = 10) -> [Double] {
        let n = max(2, steps)
        return (0...n).map { $0 == 0 || $0 == n ? 0 : bellWiggleAngle(Double($0) / Double(n)) }
    }

    private static let samples = bellWiggleFrames(steps: 24)
    private static let sampleSeconds: Double = Double(bellWiggleMilliseconds) / 1000 / 24

    public var body: some View {
        Button { isOn.toggle() } label: {
            ZStack(alignment: .topTrailing) {
                InlineGlyph(font: typography.prominentGlyph) { icons(isOn ? .bellFilled : .bell) }
                    .font(typography.prominentGlyph)
                    .phaseAnimator(Array(Self.samples.indices), trigger: rings) { bell, step in
                        bell.rotationEffect(.degrees(Self.samples[step]), anchor: UnitPoint(x: 0.5, y: 0.1)) // literal-ok: the clapper hangs from the bell's top
                    } animation: { _ in
                        .easeInOut(duration: Self.sampleSeconds)
                    }
                if isOn {
                    InlineGlyph(font: typography.glyph) { icons(.check) }
                        .font(typography.glyph)
                        .foregroundStyle(theme.onAccent)
                        .padding(metrics.tight / 2)
                        .background(theme.accent, in: .circle)
                        .scaleEffect(0.6) // literal-ok: the badge is a fraction of the bell
                        .offset(x: metrics.tight, y: -metrics.tight)
                        .transition(reduceMotion ? .identity : .scale)
                }
            }
            .foregroundStyle(isOn ? theme.accent : theme.secondary)
            .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .motionAnimation(.snap, value: isOn)
        .onChange(of: isOn) { old, new in
            if new && !old && !reduceMotion { rings += 1 }
        }
        .accessibilityLabel(label)
        .accessibilityAddTraits(isOn ? [.isToggle, .isSelected] : [.isToggle])
    }
}

#Preview("NotifyToggle") {
    struct Demo: View {
        @State private var on = false
        var body: some View { NotifyToggle(isOn: $on) }
    }
    return Demo()
}
