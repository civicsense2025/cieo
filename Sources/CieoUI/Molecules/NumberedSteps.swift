import SwiftUI

/// A short ordered process, each step led by a large accent numeral: how a test works, how a bill moves.
public struct NumberedSteps: View {
    public struct Step: Identifiable, Sendable {
        public let id: Int
        public let title: String
        public let detail: String?
        public init(id: Int, title: String, detail: String? = nil) {
            self.id = id
            self.title = title
            self.detail = detail.flatMap { $0.isEmpty ? nil : $0 }
        }
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    private let steps: [Step]

    public init(_ steps: [Step]) {
        self.steps = steps
    }

    /// Steps from titles and optional details, numbered in order.
    public init(_ items: [(title: String, detail: String?)]) {
        self.steps = items.enumerated().map { Step(id: $0.offset, title: $0.element.title, detail: $0.element.detail) }
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.loose) {
            ForEach(Array(steps.enumerated()), id: \.element.id) { position, step in
                HStack(alignment: .firstTextBaseline, spacing: metrics.medium) {
                    Text("\(position + 1)").displayText(.numeralMedium).foregroundStyle(theme.accent)
                        .frame(minWidth: metrics.touchTarget, alignment: .leading)
                        .accessibilityHidden(true)
                    Heading(Text(step.title), detail: step.detail.map { Text($0) }, level: .strongHeading, isHeader: false)
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel(Text("Step \(position + 1) of \(steps.count): \(step.title)"))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
