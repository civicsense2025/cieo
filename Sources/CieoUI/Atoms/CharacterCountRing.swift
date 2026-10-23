import SwiftUI

/// A ring that fills as a text limit is used. The host owns the text and the limit; this owns the
/// maths, the countdown inside the ring and the tone: normal, warning near the limit, danger past it.
public struct CharacterCountRing: View {
    /// Which tone the ring wears.
    public enum Tone: String, Sendable, CaseIterable { case normal, warning, danger }

    /// The ring's state for a length and limit.
    public struct RingState: Equatable, Sendable {
        /// 0 to 1, how full the ring is.
        public let fraction: Double
        /// Characters left; negative once past the limit.
        public let remaining: Int
        public let tone: Tone
        /// True when the countdown number shows inside the ring.
        public let showNumber: Bool
        public init(fraction: Double, remaining: Int, tone: Tone, showNumber: Bool) {
            self.fraction = fraction; self.remaining = remaining; self.tone = tone; self.showNumber = showNumber
        }
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let length: Int
    private let max: Int
    private let warnAt: Int

    private static func whole(_ value: Int) -> Int { Swift.max(0, value) }
    private static func whole(_ value: Double) -> Int { value.isFinite ? Swift.max(0, Int(value.rounded(.down))) : 0 }

    /// Pure ring state. Negative input clamps to an empty ring; a limit of 0 is always full and over.
    public static func ringState(length: Int, max: Int, warnAt: Int = 20) -> RingState {
        ringState(used: whole(length), limit: whole(max), warn: Swift.max(0, warnAt))
    }

    /// The same, for values that may be NaN or infinite: they clamp as the web twin does (a bad length
    /// is 0, a bad limit is 0, a bad warning distance is 20).
    public static func ringState(length: Double, max: Double, warnAt: Double = 20) -> RingState {
        ringState(used: whole(length), limit: whole(max), warn: warnAt.isFinite ? Swift.max(0, Int(warnAt.rounded(.down))) : 20)
    }

    private static func ringState(used: Int, limit: Int, warn: Int) -> RingState {
        let remaining = limit - used
        let fraction = limit == 0 ? 1 : Swift.min(1, Double(used) / Double(limit))
        let tone: Tone = remaining < 0 ? .danger : remaining <= warn ? .warning : .normal
        return RingState(fraction: fraction, remaining: remaining, tone: tone, showNumber: remaining <= warn)
    }

    /// The sentence VoiceOver reads for what is left: "12 characters left", "3 characters over the limit".
    public static func announcement(remaining: Int) -> String {
        if remaining < 0 {
            let over = -remaining
            return "\(over) \(over == 1 ? "character" : "characters") over the limit"
        }
        return "\(remaining) \(remaining == 1 ? "character" : "characters") left"
    }

    /// The most negative figure drawn inside the ring, so "-1000" never overflows it.
    public static let displayFloor = -99

    /// `warnAt` is how many characters must remain before the ring warns and counts down.
    public init(length: Int, max: Int, warnAt: Int = 20) {
        self.length = length
        self.max = max
        self.warnAt = warnAt
    }

    public var body: some View {
        let state = Self.ringState(length: length, max: max, warnAt: warnAt)
        ZStack {
            Circle().stroke(theme.track, lineWidth: metrics.rail)
            Circle().trim(from: 0, to: state.fraction)
                .stroke(color(state.tone), style: StrokeStyle(lineWidth: metrics.rail, lineCap: .round))
                .rotationEffect(.degrees(-90))
            if state.showNumber {
                Text(Swift.max(Self.displayFloor, state.remaining), format: .number)
                    .font(typography.caption)
                    .foregroundStyle(state.tone == .danger ? theme.danger : theme.secondary)
                    .minimumScaleFactor(0.5) // literal-ok: shrink floor so a three-character count stays inside the ring
                    .lineLimit(1)
                    .accessibilityHidden(true)
            }
        }
        .frame(width: metrics.ring, height: metrics.ring)
        .motionAnimation(.soft, value: state.fraction)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Character limit")
        .accessibilityValue(Text(Self.announcement(remaining: state.remaining)))
    }

    private func color(_ tone: Tone) -> Color {
        switch tone {
        case .normal: theme.accent
        case .warning: theme.warning
        case .danger: theme.danger
        }
    }
}
