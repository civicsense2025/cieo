import SwiftUI

public struct ProgressRing: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @ScaledMetric private var diameter: CGFloat
    private let value: Double

    /// `diameter` is the ring's own geometry; no spacing step or role describes a ring size.
    public init(value: Double, diameter: CGFloat = 88) { // literal-ok: ring diameter is component geometry; no step or role matches it
        self.value = RenderPolicy.progress(value)
        _diameter = ScaledMetric(wrappedValue: diameter)
    }

    public var body: some View {
        ZStack {
            Circle().stroke(theme.border, lineWidth: metrics.bar)
            Circle().trim(from: 0, to: value)
                .stroke(theme.accent, style: StrokeStyle(lineWidth: metrics.bar, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Text(value, format: .percent.precision(.fractionLength(0))).font(typography.value)
        }
        .frame(width: diameter, height: diameter)
        .padding(metrics.tight)
        .motionAnimation(.soft, value: value)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Progress")
        .accessibilityValue(Text(value, format: .percent.precision(.fractionLength(0))))
    }
}
