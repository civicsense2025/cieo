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

    /// `rates` are the speeds to cycle through, in order; non-finite and non-positive entries are skipped.
    public init(rate: Double, rates: [Double] = PlaybackRateButton.defaultRates,
                onRateChange: @escaping (Double) -> Void) {
        self.rate = rate
        self.rates = rates
        self.onRateChange = onRateChange
    }

    public var body: some View {
        let displayedRate = Self.sanitizedRate(rate)
        Button { onRateChange(Self.nextRate(rates, after: rate)) } label: {
            Text(Self.display(displayedRate))
                .font(typography.strongDetail.monospacedDigit())
                .foregroundStyle(theme.foreground)
                .contentTransition(.numericText(value: displayedRate))
                .motion(.base, value: displayedRate)
                .padding(.horizontal, metrics.medium)
                .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                .background(theme.surface, in: .capsule)
                .contentShape(.capsule)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Self.accessibleName(displayedRate))
    }

    /// Default speeds the button cycles through.
    public static let defaultRates: [Double] = [1, 1.5, 2] // literal-ok: the default cycle

    /// The next usable rate. An unknown rate starts at the first usable entry; an empty list keeps a
    /// usable rate unchanged, and invalid values fall back to 1×.
    public static func nextRate(_ rates: [Double], after rate: Double) -> Double {
        guard !rates.isEmpty else { return sanitizedRate(rate) }
        guard let first = rates.first(where: isUsable) else { return 1 }
        guard isUsable(rate) else { return first }
        var passedCurrent = false
        for candidate in rates where isUsable(candidate) {
            if passedCurrent { return candidate }
            if candidate == rate { passedCurrent = true }
        }
        return first
    }

    private static func isUsable(_ rate: Double) -> Bool { rate.isFinite && rate > 0 }
    private static func sanitizedRate(_ rate: Double) -> Double { isUsable(rate) ? rate : 1 }

    /// "1.5×": the rate without trailing zeros, then a times sign.
    public static func display(_ rate: Double) -> String {
        sanitizedRate(rate).formatted(.number.precision(.fractionLength(0...2))) + "×"
    }

    /// Accessible name: "Playback speed, 1.5 times".
    public static func accessibleName(_ rate: Double) -> String {
        let safe = sanitizedRate(rate)
        let number = safe.formatted(.number.precision(.fractionLength(0...2)))
        return "Playback speed, \(number) \(safe == 1 ? "time" : "times")"
    }
}

#Preview("Rate") {
    PlaybackRateButton(rate: 1.5) { _ in }.padding()
}
