import SwiftUI

/// A count shortened for scanning (26.3K) whose digits roll when it changes. The exact number, with its
/// unit, is what VoiceOver reads. A zero shows nothing unless `hideZero` is false, as feeds do.
public struct CompactCount: View {
    @Environment(\.componentTypography) private var typography
    @Environment(\.locale) private var environmentLocale
    private let value: Double
    private let locale: Locale?
    private let unit: String?
    private let hideZero: Bool

    /// `locale` defaults to the environment's; `unit` is the word read after the exact number ("likes").
    public init(_ value: Double, locale: Locale? = nil, unit: String? = nil, hideZero: Bool = true) {
        self.value = value
        self.locale = locale
        self.unit = unit
        self.hideZero = hideZero
    }

    public init(_ value: Int, locale: Locale? = nil, unit: String? = nil, hideZero: Bool = true) {
        self.init(Double(value), locale: locale, unit: unit, hideZero: hideZero)
    }

    /// The whole count a value stands for: negative, fractional and non-finite input clamps to a whole number of at least 0.
    nonisolated public static func wholeCount(_ n: Double) -> Double {
        n.isFinite ? max(0, n.rounded(.down)) : 0
    }

    /// Short, locale-aware form of a count: 164, 1.6K, 26.3K, 4M.
    nonisolated public static func formatCompactCount(_ n: Double, locale: Locale = Locale(identifier: "en")) -> String {
        wholeCount(n).formatted(.number.notation(.compactName).precision(.fractionLength(0...1)).locale(locale))
    }

    nonisolated public static func formatCompactCount(_ n: Int, locale: Locale = Locale(identifier: "en")) -> String {
        formatCompactCount(Double(n), locale: locale)
    }

    /// Exact form for VoiceOver and titles: 26,300.
    nonisolated public static func formatExactCount(_ n: Double, locale: Locale = Locale(identifier: "en")) -> String {
        wholeCount(n).formatted(.number.precision(.fractionLength(0)).locale(locale))
    }

    nonisolated public static func formatExactCount(_ n: Int, locale: Locale = Locale(identifier: "en")) -> String {
        formatExactCount(Double(n), locale: locale)
    }

    /// What VoiceOver reads: the exact count, then the unit when there is one ("26,300 likes").
    public static func spokenCount(_ n: Double, unit: String? = nil, locale: Locale = Locale(identifier: "en")) -> String {
        let exact = formatExactCount(n, locale: locale)
        guard let unit, !unit.isEmpty else { return exact }
        return "\(exact) \(unit)"
    }

    private var resolvedLocale: Locale { locale ?? environmentLocale }
    private var short: String { Self.formatCompactCount(value, locale: resolvedLocale) }
    private var isEmpty: Bool { hideZero && Self.wholeCount(value) == 0 }

    public var body: some View {
        ZStack {
            if !isEmpty {
                Text(verbatim: short)
                    .font(typography.detail)
                    .monospacedDigit()
                    .contentTransition(.numericText(value: Self.wholeCount(value)))
                    .motionAnimation(.base, value: Self.wholeCount(value))
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Self.spokenCount(value, unit: unit, locale: resolvedLocale))
    }
}

#Preview("CompactCount") {
    VStack(alignment: .leading) {
        CompactCount(164, unit: "likes")
        CompactCount(26_300, unit: "likes")
        CompactCount(4_000_000)
        CompactCount(0, hideZero: false)
    }
    .padding()
}
