import SwiftUI

/// Bars drawn from a clip's peaks. The played part fills continuously (a mask sliding across the bars,
/// not bar-by-bar steps), and when the host passes `onSeek` the whole thing is a scrubber: drag to seek,
/// or swipe up and down with VoiceOver to move five seconds. The host owns time.
public struct AudioWaveform: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    private let peaks: [Double]
    private let duration: TimeInterval
    private let current: TimeInterval
    private let label: String
    private let bars: Int?
    private let onSeek: ((TimeInterval) -> Void)?
    @FocusState private var focused: Bool

    /// `peaks` can be any length and scale; empty draws a row of ticks. `bars` fixes the bar count up to
    /// `maximumBarCount`, otherwise as many bars as fit the width are drawn. Without `onSeek` the waveform
    /// is a labelled picture. `label` names what it is ("Voice note from Ana").
    public init(peaks: [Double], duration: TimeInterval, current: TimeInterval, label: String,
                bars: Int? = nil, onSeek: ((TimeInterval) -> Void)? = nil) {
        self.peaks = peaks
        self.duration = duration
        self.current = current
        self.label = label
        self.bars = bars.map { Self.boundedBarCount(max(1, $0)) }
        self.onSeek = onSeek
    }

    public var body: some View {
        let d = Self.sane(duration)
        let progress = d > 0 ? min(1, max(0, Self.finite(current) / d)) : 0
        GeometryReader { proxy in
            let width = proxy.size.width
            let heights = Self.waveformBars(peaks, count: bars ?? Self.fitCount(width: width, metrics: metrics))
            ZStack(alignment: .leading) {
                Self.draw(heights, color: theme.subtle, metrics: metrics)
                Self.draw(heights, color: theme.accent, metrics: metrics)
                    .mask(alignment: .leading) {
                        Rectangle().frame(width: width * progress)
                    }
            }
            .contentShape(.rect)
            .gesture(scrubGesture(width: width, duration: d))
        }
        .frame(height: metrics.touchTarget)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
        .modifier(SeekSemantics(onSeek: onSeek, current: current, duration: d, focused: $focused))
    }

    private func scrubGesture(width: CGFloat, duration: TimeInterval) -> some Gesture {
        DragGesture(minimumDistance: 0).onChanged { value in
            onSeek?(Self.seekFromPointer(value.location.x, width: width, duration: duration))
        }
    }

    private static func draw(_ heights: [Double], color: Color, metrics: ComponentMetrics) -> some View {
        Canvas { context, size in
            let barWidth = Self.barWidth(metrics)
            let step = barWidth + Self.gap(metrics)
            let used = step * CGFloat(heights.count) - Self.gap(metrics)
            let startX = max(0, (size.width - used) / 2)
            for (i, h) in heights.enumerated() {
                let barHeight = max(barWidth, size.height * CGFloat(h))
                let rect = CGRect(x: startX + CGFloat(i) * step, y: (size.height - barHeight) / 2,
                                  width: barWidth, height: barHeight)
                context.fill(Path(roundedRect: rect, cornerRadius: barWidth / 2), with: .color(color))
            }
        }
    }

    private static func barWidth(_ metrics: ComponentMetrics) -> CGFloat { metrics.thinBar / 2 } // literal-ok: half a thin bar
    private static func gap(_ metrics: ComponentMetrics) -> CGFloat { metrics.hairline * 2 } // literal-ok: two hairlines

    /// How many bars fit a width.
    static func fitCount(width: CGFloat, metrics: ComponentMetrics) -> Int {
        guard width.isFinite, width > 0 else { return 1 }
        let step = barWidth(metrics) + gap(metrics)
        guard step.isFinite, step > 0 else { return 1 }
        let fitted = ((width + gap(metrics)) / step).rounded(.down)
        guard fitted.isFinite, fitted >= 1 else { return 1 }
        guard fitted < CGFloat(maximumBarCount) else { return maximumBarCount }
        return max(1, Int(fitted))
    }

    // MARK: Pure helpers

    /// Shortest a bar can be, as a fraction of full height, so silence still shows a tick.
    public static let floor: Double = 0.08 // literal-ok: minimum bar share
    /// Shared social-audio cap: the web track's 2-pixel bars and gaps fit 128 across 512 pixels.
    /// The same cap is used when voice recordings are downsampled.
    nonisolated public static let maximumBarCount = 128
    /// Seconds one arrow key or VoiceOver adjustment moves the playhead.
    public static let keySeconds: TimeInterval = 5 // literal-ok: step size

    static func boundedBarCount(_ count: Int) -> Int {
        count > 0 ? min(count, maximumBarCount) : 0
    }

    /// Reduces peaks to `count` bars: each bar is the loudest peak in its bucket, scaled so the loudest
    /// bar is 1, never below the floor. Empty or silent input gives all floor values.
    public static func waveformBars(_ peaks: [Double], count: Int) -> [Double] {
        let n = boundedBarCount(count)
        guard n > 0 else { return [] }
        let total = peaks.count
        guard total > 0 else { return Array(repeating: floor, count: n) }
        let raw: [Double] = (0..<n).map { i in
            let start = min(total - 1, i * total / n)
            let end = max(start + 1, (i + 1) * total / n)
            var top = 0.0
            for j in start..<min(total, end) { top = max(top, abs(finite(peaks[j]))) }
            return top
        }
        let loudest = raw.max() ?? 0
        guard loudest > 0 else { return raw.map { _ in floor } }
        return raw.map { max(floor, $0 / loudest) }
    }

    /// Seconds under a pointer at `x` within a track of the given width. Clamped to 0...duration; a
    /// zero-width track or unknown duration gives 0.
    public static func seekFromPointer(_ x: CGFloat, width: CGFloat, duration: TimeInterval) -> TimeInterval {
        guard width > 0, width.isFinite, duration.isFinite, duration > 0, x.isFinite else { return 0 }
        return min(1, max(0, Double(x / width))) * duration
    }

    /// New playhead for a key on the scrubber, clamped to 0...duration; nil for keys that do nothing.
    /// Arrows move 5 s, Page keys 10 percent, Home and End jump to the ends. Keys use the web names
    /// ("ArrowLeft", "PageUp", "Home").
    public static func waveformKeyStep(_ key: String, current: TimeInterval, duration: TimeInterval) -> TimeInterval? {
        let d = sane(duration)
        let c = finite(current)
        func to(_ t: TimeInterval) -> TimeInterval { min(d, max(0, t)) }
        switch key {
        case "ArrowLeft", "ArrowDown": return to(c - keySeconds)
        case "ArrowRight", "ArrowUp": return to(c + keySeconds)
        case "PageDown": return to(c - d * 0.1) // literal-ok: a page is a tenth of the clip
        case "PageUp": return to(c + d * 0.1) // literal-ok: a page is a tenth of the clip
        case "Home": return 0
        case "End": return d
        default: return nil
        }
    }

    /// Spoken position for a scrubber: "12 seconds of 1 minute 3 seconds".
    public static func seekText(current: TimeInterval, duration: TimeInterval) -> String {
        "\(AudioTime.speakAudioTime(current)) of \(AudioTime.speakAudioTime(duration))"
    }

    static func sane(_ duration: TimeInterval) -> TimeInterval { duration.isFinite ? max(0, duration) : 0 }
    static func finite(_ n: Double) -> Double { n.isFinite ? n : 0 }
}

/// Seek accessibility and keyboard handling for a scrubber; a labelled picture when there is no seeking.
struct SeekSemantics: ViewModifier {
    let onSeek: ((TimeInterval) -> Void)?
    let current: TimeInterval
    let duration: TimeInterval
    var focused: FocusState<Bool>.Binding

    func body(content: Content) -> some View {
        if let onSeek {
            content
                .accessibilityValue(AudioWaveform.seekText(current: min(max(0, current), duration), duration: duration))
                .accessibilityAdjustableAction { direction in
                    let key = direction == .increment ? "ArrowRight" : "ArrowLeft"
                    if let next = AudioWaveform.waveformKeyStep(key, current: current, duration: duration) { onSeek(next) }
                }
                .focusable()
                .focused(focused)
                .onKeyPress(phases: [.down, .repeat]) { press in
                    guard let name = Self.keyName(press.key),
                          let next = AudioWaveform.waveformKeyStep(name, current: current, duration: duration)
                    else { return .ignored }
                    onSeek(next)
                    return .handled
                }
        } else {
            content.accessibilityAddTraits(.isImage)
        }
    }

    static func keyName(_ key: KeyEquivalent) -> String? {
        switch key {
        case .leftArrow: "ArrowLeft"
        case .rightArrow: "ArrowRight"
        case .upArrow: "ArrowUp"
        case .downArrow: "ArrowDown"
        case .pageUp: "PageUp"
        case .pageDown: "PageDown"
        case .home: "Home"
        case .end: "End"
        default: nil
        }
    }
}

#Preview("Waveform") {
    AudioWaveform(peaks: (0..<80).map { abs(sin(Double($0) / 6)) }, duration: 63, current: 20, label: "Voice note") { _ in }
        .padding()
}
