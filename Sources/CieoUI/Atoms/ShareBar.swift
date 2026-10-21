import SwiftUI

/// Shares of a whole as one rounded bar, such as two candidates' vote shares.
/// It draws nothing unless every share is a positive number, so a missing figure never shows as a fake split.
public struct ShareBar: View {
    public struct Segment: Sendable {
        public let value: Double
        public let color: Color
        public init(_ value: Double, color: Color) {
            self.value = value
            self.color = color
        }
    }

    @Environment(\.componentMetrics) private var metrics
    /// Scales the bar's height with Dynamic Type; 1 at the default text size.
    @ScaledMetric private var scale: CGFloat = 1
    private let segments: [Segment]
    private let fractions: [Double]?
    private let label: Text
    private let height: CGFloat?

    /// `label` is what VoiceOver reads, for example "Democratic 52%, Republican 48%".
    /// Without a `height`, the bar takes the host's `bar` step.
    public init(_ segments: [Segment], label: Text, height: CGFloat? = nil) {
        self.segments = segments
        self.fractions = Self.fractions(segments.map(\.value))
        self.label = label
        self.height = height.flatMap { $0.isFinite && $0 > 0 ? $0 : nil }
    }

    /// Each share as a fraction of the total, or nil when fewer than two shares are given or any is missing.
    public static func fractions(_ values: [Double]) -> [Double]? {
        guard values.count >= 2, values.allSatisfy({ $0.isFinite && $0 > 0 }) else { return nil }
        let total = values.reduce(0, +)
        return values.map { $0 / total }
    }

    public var body: some View {
        if let fractions {
            GeometryReader { proxy in
                let gap = metrics.hairline
                let usable = max(0, proxy.size.width - gap * CGFloat(fractions.count - 1))
                HStack(spacing: gap) {
                    ForEach(fractions.indices, id: \.self) { index in
                        Rectangle().fill(segments[index].color).frame(width: usable * fractions[index])
                    }
                }
            }
            .frame(height: (height ?? metrics.bar) * scale)
            .clipShape(Capsule())
            .motionAnimation(.soft, value: fractions)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(label)
        }
    }
}
