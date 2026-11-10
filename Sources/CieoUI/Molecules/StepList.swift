import SwiftUI

/// What happens next: steps with a quiet number, a check once done, and "next" on the current one.
/// Read as "Step 2 of 4, Vote to take up the bill, next". The host owns which step is current.
public struct StepList: View {
    public struct Step: Identifiable, Sendable {
        public let id: Int
        public let title: String
        public let detail: String?
        public init(_ title: String, detail: String? = nil, id: Int) { self.title = title; self.detail = detail; self.id = id }
    }
    public enum State: Sendable, Equatable { case done, current, upcoming }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    private let steps: [Step]
    private let current: Int
    private let nextLabel: Text

    /// `current` is the index of the step in progress; earlier steps are done.
    public init(_ steps: [Step], current: Int, nextLabel: Text = Text("next")) {
        self.steps = steps; self.current = current; self.nextLabel = nextLabel
    }

    /// Clamps the current step into the list, so a stale index never marks everything done.
    public static func state(at index: Int, current: Int, count: Int) -> State {
        let c = min(max(0, current), max(0, count - 1))
        return index < c ? .done : (index == c ? .current : .upcoming)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.loose) {
            ForEach(Array(steps.enumerated()), id: \.element.id) { index, step in
                let state = Self.state(at: index, current: current, count: steps.count)
                HStack(alignment: .firstTextBaseline, spacing: metrics.medium) {
                    Group {
                        if state == .done { InlineGlyph(font: typography.reference) { icons(.check) } }
                        else { Text(verbatim: "\(index + 1)").font(typography.reference) }
                    }
                    .foregroundStyle(state == .upcoming ? theme.secondary : theme.foreground)
                    .frame(minWidth: metrics.loose, alignment: .leading)
                    .accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: metrics.tight) {
                        (Text(step.title) + (state == .current ? Text(verbatim: " · ").foregroundColor(theme.secondary) + nextLabel.foregroundColor(theme.secondary) : Text(verbatim: "")))
                            .font(typography.strongBody)
                        if let detail = step.detail {
                            Text(detail).font(typography.detail).foregroundStyle(theme.secondary)
                        }
                    }
                }
                .foregroundStyle(theme.foreground)
                .accessibilityElement(children: .combine)
                .accessibilityLabel(Text("Step \(index + 1) of \(steps.count), \(step.title)") + (state == .current ? Text(", ") + nextLabel : Text(verbatim: "")))
                .accessibilityValue(state == .done ? Text("done") : Text(verbatim: ""))
            }
        }
    }
}
