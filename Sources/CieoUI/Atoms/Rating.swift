import Cieo
import SwiftUI

/// A star rating: tap a star (or swipe up and down with VoiceOver) to set it, or show it read-only. Newly
/// filled stars pop in turn on the snap spring, the whole stagger inside 150 ms. The host owns the value.
public struct Rating: View {
    /// Maximum number of stars a rating displays or animates.
    public static let maximumStars = 10
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    private let binding: Binding<Int>?
    private let fixed: Double
    private let top: Int
    private let label: Text
    @State private var hover: Int?
    @State private var popped: Set<Int> = []
    @State private var previous: Int

    /// An interactive rating. `label` names what is rated ("Rate this reply").
    public init(value: Binding<Int>, max: Int = 5, label: Text) {
        binding = value
        fixed = 0
        top = Self.stars(max)
        self.label = label
        _previous = State(initialValue: Self.rounded(Double(value.wrappedValue), top: Self.stars(max)))
    }

    public init(value: Binding<Int>, max: Int = 5, label: LocalizedStringKey) {
        self.init(value: value, max: max, label: Text(label))
    }

    /// A read-only summary. Fractions fill whole stars and appear in the spoken value ("3.5 out of 5").
    public init(readOnlyValue: Double, max: Int = 5, label: Text) {
        binding = nil
        fixed = readOnlyValue
        top = Self.stars(max)
        self.label = label
        _previous = State(initialValue: Self.rounded(readOnlyValue, top: Self.stars(max)))
    }

    public init(readOnlyValue: Double, max: Int = 5, label: LocalizedStringKey) {
        self.init(readOnlyValue: readOnlyValue, max: max, label: Text(label))
    }

    private static func stars(_ max: Int) -> Int { Swift.min(maximumStars, Swift.max(1, max)) }

    private static func rounded(_ value: Double, top: Int) -> Int {
        value.isFinite ? Int(Swift.min(Double(top), Swift.max(0, value)).rounded()) : 0
    }

    /// Value a key moves to (1...max), or nil when the key does nothing or the value would not change. No wrapping.
    public static func ratingKeyStep(_ key: String, value: Double, max: Int) -> Int? {
        let top = stars(max)
        let now = rounded(value, top: top)
        let next: Int?
        switch key {
        case "ArrowRight", "ArrowUp": next = Swift.min(top, now + 1)
        case "ArrowLeft", "ArrowDown": next = Swift.max(1, now - 1)
        case "Home": next = 1
        case "End": next = top
        default: next = nil
        }
        guard let next, next != now else { return nil }
        return next
    }

    /// Spoken summary: "4 out of 5". The value clamps to 0...max; halves keep one decimal.
    public static func ratingLabel(_ value: Double, max: Int) -> String {
        let top = stars(max)
        let v = value.isFinite ? Swift.min(Double(top), Swift.max(0, value)) : 0
        let shown = v.rounded() == v ? String(Int(v)) : String(format: "%.1f", v)
        return "\(shown) out of \(top)"
    }

    /// Start delays (ms) for stars `from..<to` popping in turn; the last starts by `window`, so the whole stagger fits in it.
    public static func ratingPopDelays(from: Int, to: Int, window: Int = 150) -> [Int] {
        let start = Swift.min(maximumStars, Swift.max(0, from))
        let end = Swift.min(maximumStars, Swift.max(0, to))
        let n = Swift.max(0, end - start)
        guard n > 0 else { return [] }
        let step = n == 1 ? 0 : Swift.min(40.0, Double(window) / Double(n - 1))
        return (0..<n).map { Int((Double($0) * step).rounded()) }
    }

    private var current: Double { binding.map { Double($0.wrappedValue) } ?? fixed }
    private var safe: Double { current.isFinite ? Swift.min(Double(top), Swift.max(0, current)) : 0 }
    private var roundedValue: Int { Self.rounded(current, top: top) }
    private var shown: Double { Double(hover ?? 0) > 0 ? Double(hover ?? 0) : safe }

    private func star(_ index: Int) -> some View {
        let filled = shown >= Double(index + 1) - Self.epsilon
        return InlineGlyph(font: typography.prominentGlyph) { icons(filled ? .starFilled : .star) }
            .font(typography.prominentGlyph)
            .foregroundStyle(filled ? theme.accent : theme.subtle)
            .scaleEffect(popped.contains(index) ? Self.popScale : 1)
            .motionAnimation(.snap, value: popped)
    }

    private static let epsilon = 0.0001 // literal-ok: float tolerance matching the web
    private static let popScale: CGFloat = 1.3 // literal-ok: pop height shared with the web

    public var body: some View {
        Group {
            if let binding {
                HStack(spacing: 0) { // literal-ok: each star is a full touch target, so no gap
                    ForEach(0..<top, id: \.self) { index in
                        Button { binding.wrappedValue = index + 1 } label: {
                            star(index)
                                .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                                .contentShape(.rect)
                        }
                        .buttonStyle(.plain)
                        .onHover { inside in
                            if inside { hover = index + 1 } else if hover == index + 1 { hover = nil }
                        }
                    }
                }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(label)
                .accessibilityValue(Self.ratingLabel(Double(roundedValue), max: top))
                .accessibilityAdjustableAction { direction in
                    let key = direction == .increment ? "ArrowRight" : "ArrowLeft"
                    if let next = Self.ratingKeyStep(key, value: Double(roundedValue), max: top) { binding.wrappedValue = next }
                }
            } else {
                HStack(spacing: metrics.tight) {
                    ForEach(0..<top, id: \.self) { star($0) }
                }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(Self.ratingLabel(safe, max: top))
                .accessibilityHint(label)
                .accessibilityAddTraits(.isImage)
            }
        }
        .task(id: roundedValue) { await popNewStars() }
    }

    /// Pops the stars that just filled, one after another within the stagger window.
    private func popNewStars() async {
        let from = previous
        previous = roundedValue
        guard binding != nil, !reduceMotion, roundedValue > from else { return }
        let delays = Self.ratingPopDelays(from: from, to: roundedValue)
        var lastDelay = 0
        for (offset, delay) in delays.enumerated() {
            try? await Task.sleep(for: .milliseconds(delay - lastDelay))
            if Task.isCancelled { return }
            lastDelay = delay
            popped.insert(from + offset)
            let index = from + offset
            Task {
                try? await Task.sleep(for: .milliseconds(Self.popHold))
                popped.remove(index)
            }
        }
    }

    private static let popHold = 140 // literal-ok: how long a star stays enlarged, in ms
}

#Preview("Rating") {
    struct Demo: View {
        @State private var value = 3
        var body: some View {
            VStack(alignment: .leading) {
                Rating(value: $value, label: "Rate this reply")
                Rating(readOnlyValue: 4, label: "Average rating")
            }
        }
    }
    return Demo()
}
