import SwiftUI

/// Elapsed and total time for a clip ("0:12 / 1:03"), the time left ("-0:51"), or just the length.
/// Digits are monospaced and roll as they change, so the width stays steady while it ticks.
/// VoiceOver reads the spoken form ("12 seconds of 1 minute 3 seconds"), never the clock glyphs.
public struct AudioTime: View {
    /// Which figures the clock shows.
    public enum Mode: Sendable, CaseIterable {
        /// "0:12 / 1:03", or "0:12" while the length is unknown.
        case elapsed
        /// "-0:51"; reads as elapsed while the length is unknown.
        case remaining
        /// Only the length, for a clip that has not started: "1:03", or "--:--" while unknown.
        case total
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    private let current: TimeInterval
    private let duration: TimeInterval?
    private let mode: Mode

    /// `duration` is nil while the length is still unknown; `mode` defaults to `.elapsed`.
    public init(current: TimeInterval, duration: TimeInterval? = nil, mode: Mode = .elapsed) {
        self.current = current
        self.duration = duration
        self.mode = mode
    }

    public var body: some View {
        Text(Self.text(current: current, duration: duration, mode: mode))
            .font(typography.detail.monospacedDigit())
            .foregroundStyle(theme.secondary)
            .lineLimit(1)
            .contentTransition(.numericText())
            .motion(.snap, value: Self.text(current: current, duration: duration, mode: mode))
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Self.spoken(current: current, duration: duration, mode: mode))
    }

    /// m:ss under an hour, h:mm:ss above. Negative and non-finite input reads as 0:00.
    nonisolated public static func formatAudioTime(_ seconds: TimeInterval) -> String {
        let s = whole(seconds)
        let h = s / 3600, m = (s % 3600) / 60, r = s % 60
        let ss = r < 10 ? "0\(r)" : "\(r)"
        guard h > 0 else { return "\(m):\(ss)" }
        return "\(h):\(m < 10 ? "0\(m)" : "\(m)"):\(ss)"
    }

    /// Spoken form for assistive text: "1 minute 3 seconds".
    nonisolated public static func speakAudioTime(_ seconds: TimeInterval) -> String {
        let s = whole(seconds)
        let h = s / 3600, m = (s % 3600) / 60, r = s % 60
        func part(_ n: Int, _ word: String) -> String { "\(n) \(word)\(n == 1 ? "" : "s")" }
        var parts: [String] = []
        if h > 0 { parts.append(part(h, "hour")) }
        if m > 0 { parts.append(part(m, "minute")) }
        if r > 0 || (h == 0 && m == 0) { parts.append(part(r, "second")) }
        return parts.joined(separator: " ")
    }

    /// The text drawn for a mode.
    public static func text(current: TimeInterval, duration: TimeInterval?, mode: Mode) -> String {
        let known = known(duration)
        switch (mode, known) {
        case (.total, let d?): return formatAudioTime(d)
        case (.total, nil): return "--:--"
        case (.remaining, let d?): return "-" + formatAudioTime(max(0, d - current))
        case (_, let d?): return "\(formatAudioTime(current)) / \(formatAudioTime(d))"
        case (_, nil): return formatAudioTime(current)
        }
    }

    /// The text VoiceOver reads for a mode.
    public static func spoken(current: TimeInterval, duration: TimeInterval?, mode: Mode) -> String {
        let known = known(duration)
        switch (mode, known) {
        case (.total, let d?): return speakAudioTime(d)
        case (.total, nil): return "length unknown"
        case (.remaining, let d?): return "\(speakAudioTime(max(0, d - current))) left"
        case (_, let d?): return "\(speakAudioTime(current)) of \(speakAudioTime(d))"
        case (_, nil): return speakAudioTime(current)
        }
    }

    private static func known(_ duration: TimeInterval?) -> TimeInterval? {
        guard let duration, duration.isFinite else { return nil }
        return duration
    }

    nonisolated private static func whole(_ seconds: TimeInterval) -> Int {
        seconds.isFinite ? Int(max(0, seconds.rounded(.down))) : 0
    }
}

#Preview("Time") {
    VStack(alignment: .leading) {
        AudioTime(current: 12, duration: 63)
        AudioTime(current: 12, duration: 63, mode: .remaining)
        AudioTime(current: 0, duration: 63, mode: .total)
    }
    .padding()
}
