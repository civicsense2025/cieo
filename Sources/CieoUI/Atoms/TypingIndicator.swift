import Cieo
import SwiftUI

/// Three waving dots plus a spoken sentence about who is typing. The host owns the names; this owns the
/// wording, the wave and the enter and leave. The wave stops when the view is off screen or the app is
/// not active, and is still under Reduce Motion.
public struct TypingIndicator: View {
    public enum Variant: Sendable, CaseIterable {
        /// Dots in a rounded bubble; the sentence is read aloud only.
        case bubble
        /// Dots with the sentence shown beside them.
        case inline
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.scenePhase) private var scenePhase
    @State private var onScreen = false
    @State private var held: [String]
    private let names: [String]
    private let variant: Variant

    /// An empty `names` list hides the indicator with a short fade.
    public init(names: [String], variant: Variant = .bubble) {
        self.names = names
        self.variant = variant
        _held = State(initialValue: names)
    }

    private var key: String { Self.typingSetKey(names) }

    public var body: some View {
        // The held names keep the sentence stable while the indicator leaves.
        let sentence = Self.typingLabel(key.isEmpty ? held : names)
        Group {
            if !key.isEmpty {
                content(sentence)
                    .transition(.opacity)
                    .accessibilityElement(children: .ignore)
                    .accessibilityLabel(sentence)
                    .accessibilityAddTraits(.updatesFrequently)
            }
        }
        .motion(.base, value: key.isEmpty)
        .onChange(of: key) { _, new in
            if !new.isEmpty {
                held = names
                AccessibilityNotification.Announcement(Self.typingLabel(names)).post()
            }
        }
    }

    @ViewBuilder
    private func content(_ sentence: String) -> some View {
        switch variant {
        case .bubble:
            dots
                .padding(.horizontal, metrics.medium)
                .padding(.vertical, metrics.compact + metrics.tight / 2)
                .background(theme.surface, in: Capsule())
        case .inline:
            HStack(spacing: metrics.compact) {
                dots
                Text(sentence).font(typography.detail).foregroundStyle(theme.secondary).lineLimit(1)
            }
        }
    }

    private var paused: Bool { !onScreen || scenePhase != .active || reduceMotion }

    private var dots: some View {
        TimelineView(.animation(paused: paused)) { context in
            let t = context.date.timeIntervalSinceReferenceDate
            HStack(spacing: metrics.tight) {
                ForEach(0..<Self.dotCount, id: \.self) { index in
                    Dot(size: dotSize, level: paused ? Self.restLevel : Self.wave(at: t, dot: index))
                        .foregroundStyle(theme.secondary)
                }
            }
        }
        .onAppear { onScreen = true }
        .onDisappear { onScreen = false }
        .accessibilityHidden(true)
    }

    @ScaledMetric private var dotSize: CGFloat = 7 // literal-ok: dot diameter is component geometry

    private struct Dot: View {
        let size: CGFloat
        let level: Double
        var body: some View {
            Circle().frame(width: size, height: size)
                .opacity(Self.floor + (1 - Self.floor) * level)
                .offset(y: -size * level / 2)
        }
        static let floor = 0.35 // literal-ok: dimmest dot of the wave
    }

    // MARK: - Pure helpers

    static let dotCount = 3
    /// Seconds for one wave to cross the dots.
    static let period = 1.2 // literal-ok: wave timing
    /// Delay between neighbouring dots, as a share of the period.
    static let stagger = 0.18 // literal-ok: wave timing
    /// Level every dot rests at while the wave is still.
    static let restLevel = 0.5 // literal-ok: mid opacity for static dots

    /// A dot's lift from 0 to 1 at time `t`; each dot trails the one before it.
    static func wave(at t: TimeInterval, dot: Int) -> Double {
        let phase = (t / period - Double(dot) * stagger).truncatingRemainder(dividingBy: 1)
        let p = phase < 0 ? phase + 1 : phase
        return (1 - cos(p * 2 * .pi)) / 2
    }

    /// Sentence for who is typing: "" for nobody, "Ava is typing", "Ava and Ben are typing",
    /// "Ava, Ben and Cy are typing", "Ava and 3 others are typing". Blank names are ignored.
    public static func typingLabel(_ names: [String]) -> String {
        let list = names.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
        switch list.count {
        case 0: return ""
        case 1: return "\(list[0]) is typing"
        case 2: return "\(list[0]) and \(list[1]) are typing"
        case 3: return "\(list[0]), \(list[1]) and \(list[2]) are typing"
        default: return "\(list[0]) and \(list.count - 1) others are typing"
        }
    }

    /// Identity of the set of people typing, ignoring order and blanks. The spoken text changes only when
    /// this changes.
    public static func typingSetKey(_ names: [String]) -> String {
        let list = names.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
        return Set(list).sorted().joined(separator: "\u{0}")
    }
}

#Preview {
    VStack(alignment: .leading, spacing: 16) { // literal-ok: preview scaffolding
        TypingIndicator(names: ["Ava"])
        TypingIndicator(names: ["Ava", "Ben"], variant: .inline)
    }.padding()
}
