import SwiftUI

/// One button that cycles the playback speed (1×, 1.5×, 2×). The host owns the rate and applies it to
/// the audio; the number rolls to the next one.
public struct PlaybackRateButton: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let rate: Double
    private let rates: [Double]
    private let onRateChange: (Double) -> Void

    /// `rates` are the speeds to cycle through, in order.
    public init(rate: Double, rates: [Double] = PlaybackRateButton.defaultRates,
                onRateChange: @escaping (Double) -> Void) {
        self.rate = rate
        self.rates = rates
        self.onRateChange = onRateChange
    }

    public var body: some View {
        Button { onRateChange(Self.nextRate(rates, after: rate)) } label: {
            Text(Self.display(rate))
                .font(typography.strongDetail.monospacedDigit())
                .foregroundStyle(theme.foreground)
                .contentTransition(.numericText(value: rate))
                .motion(.base, value: rate)
                .padding(.horizontal, metrics.medium)
                .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                .background(theme.surface, in: .capsule)
                .contentShape(.capsule)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Self.accessibleName(rate))
    }

    /// Default speeds the button cycles through.
    public static let defaultRates: [Double] = [1, 1.5, 2] // literal-ok: the default cycle

    /// The rate after `rate` in the cycle. A rate not in the list starts the cycle over at the first one;
    /// an empty list changes nothing.
    public static func nextRate(_ rates: [Double], after rate: Double) -> Double {
        guard !rates.isEmpty else { return rate }
        guard let index = rates.firstIndex(of: rate) else { return rates[0] }
        return rates[(index + 1) % rates.count]
    }

    /// "1.5×": the rate without trailing zeros, then a times sign.
    public static func display(_ rate: Double) -> String {
        rate.formatted(.number.precision(.fractionLength(0...2))) + "×"
    }

    /// Accessible name: "Playback speed, 1.5 times".
    public static func accessibleName(_ rate: Double) -> String {
        let number = rate.formatted(.number.precision(.fractionLength(0...2)))
        return "Playback speed, \(number) \(rate == 1 ? "time" : "times")"
    }
}

#Preview("Rate") {
    PlaybackRateButton(rate: 1.5) { _ in }.padding()
}
