import SwiftUI

/// One row of a ranked index: a rank numeral, a title, a muted note, and an optional bar that is
/// the row's data (progress, share, count). The host wraps it in a Button or NavigationLink.
public struct IndexRow: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentIcons) private var icons
    private let rank: String?
    private let title: Text
    private let note: Text?
    private let fraction: Double?
    private let showsDisclosure: Bool

    /// `fraction` draws the bar when it is a finite number; values are held to 0...1.
    public init(rank: String?, title: Text, note: Text? = nil, fraction: Double? = nil, showsDisclosure: Bool = true) {
        self.rank = rank.flatMap { $0.isEmpty ? nil : $0 }
        self.title = title
        self.note = note
        self.fraction = Self.barFraction(fraction)
        self.showsDisclosure = showsDisclosure
    }

    /// The bar's fill, or nil when there is no real figure to draw.
    public static func barFraction(_ value: Double?) -> Double? {
        value.flatMap { $0.isFinite ? min(1, max(0, $0)) : nil }
    }

    /// A two-digit rank from a zero-based position, as printed indexes number their rows: 0 → "01".
    public static func rank(_ index: Int) -> String {
        let value = max(0, index) + 1
        return value < 10 ? "0\(value)" : "\(value)"
    }

    public var body: some View {
        HStack(alignment: .center, spacing: 14) {
            if let rank {
                Text(rank).displayText(.numeralSmall).foregroundStyle(theme.accent)
                    .accessibilityHidden(true)
            }
            VStack(alignment: .leading, spacing: 4) {
                title.font(.headline.weight(.heavy)).foregroundStyle(theme.foreground)
                    .fixedSize(horizontal: false, vertical: true)
                if let note {
                    note.font(.subheadline).foregroundStyle(theme.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                if let fraction {
                    GeometryReader { proxy in
                        ZStack(alignment: .leading) {
                            Capsule().fill(theme.track)
                            Capsule().fill(theme.accent).frame(width: proxy.size.width * fraction)
                        }
                    }
                    .frame(height: 6)
                    .padding(.top, 2)
                    .motionAnimation(.soft, value: fraction)
                    .accessibilityHidden(true)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            if showsDisclosure {
                icons(.disclosure).font(.footnote.weight(.semibold))
                    .foregroundStyle(theme.secondary).accessibilityHidden(true)
            }
        }
        .frame(minHeight: Metrics.touchTarget)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityValue(fraction.map { Text($0, format: .percent.precision(.fractionLength(0))) } ?? Text(""))
    }
}
