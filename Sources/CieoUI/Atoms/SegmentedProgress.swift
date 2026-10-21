import SwiftUI

/// Progress through a fixed number of steps, such as a test's questions, drawn as one segment per step.
public struct SegmentedProgress: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    private let total: Int
    private let completed: Int
    private let label: Text?

    public static let maximumSegments = 60

    public init(total: Int, completed: Int, label: Text? = nil) {
        let counts = Self.normalized(total: total, completed: completed)
        self.total = counts.total
        self.completed = counts.completed
        self.label = label
    }

    /// At least one segment and at most `maximumSegments`, with `completed` held inside the total.
    public static func normalized(total: Int, completed: Int) -> (total: Int, completed: Int) {
        let total = min(maximumSegments, max(1, total))
        return (total, min(total, max(0, completed)))
    }

    public var body: some View {
        HStack(spacing: metrics.compact) {
            ForEach(0..<total, id: \.self) { index in
                Capsule().fill(index < completed ? theme.accent : theme.track).frame(height: metrics.bar)
            }
        }
        .motionAnimation(.base, value: completed)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label ?? Text("Progress"))
        .accessibilityValue(Text("\(completed) of \(total)"))
    }
}
