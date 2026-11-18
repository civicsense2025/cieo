import SwiftUI

public struct ProgressRing<CenterLabel: View>: View {
    @Environment(\.componentStrings) private var strings
    @Environment(\.progressRingStyle) private var ringStyle
    @ScaledMetric private var diameter: CGFloat
    private let value: Double
    private let centerLabel: CenterLabel

    /// `diameter` is the ring's own geometry; no spacing step or role describes a ring size.
    public init(value: Double, diameter: CGFloat = 88, @ViewBuilder centerLabel: () -> CenterLabel) { // literal-ok: ring diameter is component geometry; no step or role matches it
        self.value = RenderPolicy.progress(value)
        _diameter = ScaledMetric(wrappedValue: diameter)
        self.centerLabel = centerLabel()
    }

    public var body: some View {
        let config = ProgressRingStyleConfiguration(value: value, diameter: diameter) {
            centerLabel
        }
        ringStyle.makeBody(configuration: config)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text(verbatim: strings.progressLabel))
            .accessibilityValue(Text(value, format: .percent.precision(.fractionLength(0))))
    }
}

public extension ProgressRing where CenterLabel == Text {
    init(value: Double, diameter: CGFloat = 88) { // literal-ok: ring diameter is component geometry; no step or role matches it
        let clamped = RenderPolicy.progress(value)
        self.init(value: clamped, diameter: diameter) {
            Text(clamped, format: .percent.precision(.fractionLength(0)))
        }
    }
}
