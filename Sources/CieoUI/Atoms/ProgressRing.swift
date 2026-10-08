import SwiftUI

public struct ProgressRing: View {
    @Environment(\.componentTheme) private var theme
    @ScaledMetric private var diameter = 88.0
    private let value: Double

    public init(value: Double) {
        self.value = RenderPolicy.progress(value)
    }

    public var body: some View {
        ZStack {
            Circle().stroke(theme.border, lineWidth: 8)
            Circle().trim(from: 0, to: value)
                .stroke(theme.accent, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Text(value, format: .percent.precision(.fractionLength(0))).font(.headline.monospacedDigit())
        }
        .frame(width: diameter, height: diameter)
        .padding(4)
        .motionAnimation(.soft, value: value)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Progress")
        .accessibilityValue(Text(value, format: .percent.precision(.fractionLength(0))))
    }
}
