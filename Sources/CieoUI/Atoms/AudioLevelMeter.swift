import SwiftUI

/// A few bars that rise and fall with how loud the microphone is. The host passes a `level` from 0 to 1
/// (for example `VoiceRecorderModel.level`) and the bars follow it on a spring. VoiceOver reads the whole
/// meter as one image and never gets per-frame updates.
public struct AudioLevelMeter: View {
    private static let maximumBarCount = 32 // literal-ok: matches the web meter's bounded bar count
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @ScaledMetric private var height: CGFloat
    private let level: Double
    private let count: Int
    private let label: Text

    /// Floor of the meter in decibels: anything quieter reads as silence.
    public static let floorDecibels: Double = 60 // literal-ok: the web floor, shared by both platforms

    /// `bars` is clamped to 1...32 and defaults to 5; `level` is clamped to 0...1.
    public init(level: Double, bars: Int = 5, label: Text = Text("Microphone level"), height: CGFloat = 32) { // literal-ok: meter geometry; no step or role matches it
        self.level = Self.clamp01(level)
        self.count = min(Self.maximumBarCount, max(1, bars))
        self.label = label
        _height = ScaledMetric(wrappedValue: height, relativeTo: .body)
    }

    public init(level: Double, bars: Int = 5, label: LocalizedStringKey) {
        self.init(level: level, bars: bars, label: Text(label))
    }

    public var body: some View {
        HStack(alignment: .center, spacing: metrics.tight) {
            ForEach(Array(Self.levelBars(level, count: count).enumerated()), id: \.offset) { _, fraction in
                Capsule()
                    .fill(theme.accent)
                    .frame(width: metrics.thinBar, height: height * fraction)
            }
        }
        .frame(height: height)
        .motionAnimation(.base, value: level)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
        .accessibilityAddTraits(.isImage)
    }

    // MARK: - Pure helpers

    /// Loudness of a block of samples (-1...1) as 0...1 on a perceptual dB scale: -60 dB or quieter is 0,
    /// 0 dB is 1. Empty input is 0 and non-finite samples are skipped.
    public static func rmsLevel<S: Sequence>(_ samples: S) -> Double where S.Element: BinaryFloatingPoint {
        var sum = 0.0
        var n = 0
        for sample in samples {
            n += 1
            let s = Double(sample)
            if s.isFinite { sum += s * s }
        }
        guard n > 0 else { return 0 }
        let rms = (sum / Double(n)).squareRoot()
        guard rms > 0 else { return 0 }
        return decibelsLevel(20 * log10(rms)) // literal-ok: amplitude to decibels
    }

    /// A meter reading in decibels (such as `AVAudioRecorder.averagePower`, -160...0) as 0...1 with the
    /// same -60 dB floor as `rmsLevel`. Non-finite readings are silence.
    public static func decibelsLevel(_ decibels: Double) -> Double {
        guard decibels.isFinite else { return 0 }
        return clamp01((decibels + floorDecibels) / floorDecibels)
    }

    /// Bar heights (0.1...1) for a level: the middle bars rise the most, the outer ones follow at half
    /// height, and every bar keeps a visible stub. The requested count is bounded to 0...32.
    public static func levelBars(_ level: Double, count: Int) -> [Double] {
        let n = min(Self.maximumBarCount, max(0, count))
        let l = clamp01(level)
        let mid = Double(n - 1) / 2
        return (0..<n).map { i in
            let distance = mid > 0 ? abs(Double(i) - mid) / mid : 0
            return min(1, max(0.1, 0.1 + 0.9 * l * (1 - 0.5 * distance))) // literal-ok: web bar-height formula
        }
    }

    static func clamp01(_ value: Double) -> Double { value.isFinite ? min(1, max(0, value)) : 0 }
}

#Preview("AudioLevelMeter") {
    VStack(spacing: 24) { // literal-ok: preview layout
        AudioLevelMeter(level: 0)
        AudioLevelMeter(level: 0.5)
        AudioLevelMeter(level: 1, bars: 7) // literal-ok: preview
    }
    .padding()
}
