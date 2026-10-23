import SwiftUI

/// Which thumb was pressed.
public enum ThumbValue: String, Sendable, CaseIterable { case up, down }
/// Where the feedback flow is.
public enum ThumbsStep: String, Sendable { case ask, detail, done }

/// The feedback flow's state: the step and which thumb is chosen.
public struct ThumbsState: Equatable, Sendable {
    public var step: ThumbsStep
    public var value: ThumbValue?
    public init(step: ThumbsStep, value: ThumbValue?) { self.step = step; self.value = value }
}

/// What can happen in the flow.
public enum ThumbsEvent: Equatable, Sendable {
    case rate(ThumbValue, hasReasons: Bool)
    case submit
    case skip
}

/// The final answer: the thumb, any reasons picked and the trimmed comment.
public struct ThumbsResult: Equatable, Sendable {
    public let value: ThumbValue
    public let reasons: [String]
    public let comment: String
    public init(value: ThumbValue, reasons: [String], comment: String) {
        self.value = value; self.reasons = reasons; self.comment = comment
    }
}

/// "Was this helpful?" as a short ask, an optional detail step with reasons and a comment, then a thank-you.
/// The height follows the step on the soft spring and VoiceOver focus moves to the new step. The host owns
/// what happens to the result.
public struct ThumbsFeedback: View {
    /// The state a new flow starts in.
    public static let thumbsInitial = ThumbsState(step: .ask, value: nil)

    /// Pure step machine. ask -> detail (or straight to done when that thumb has no reasons) -> done.
    /// Changing the thumb while in detail keeps the step. done is final.
    public static func thumbsStep(_ state: ThumbsState, _ event: ThumbsEvent) -> ThumbsState {
        if state.step == .done { return state }
        switch event {
        case let .rate(value, hasReasons):
            if state.step == .detail { return ThumbsState(step: .detail, value: value) }
            return ThumbsState(step: hasReasons ? .detail : .done, value: value)
        case .submit, .skip:
            return state.step == .detail ? ThumbsState(step: .done, value: state.value) : state
        }
    }

    private enum Focus: Hashable { case firstReason, thanks }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    private let question: String
    private let reasons: (up: [String], down: [String])
    private let thanks: String
    private let onRate: ((ThumbValue) -> Void)?
    private let onSubmit: (ThumbsResult) -> Void
    @State private var state = ThumbsFeedback.thumbsInitial
    @State private var picked: [String] = []
    @State private var comment = ""
    @AccessibilityFocusState private var focus: Focus?

    /// `reasons` are the chips offered after each thumb; an empty list skips the detail step for that thumb.
    /// `onRate` fires on each thumb press; `onSubmit` fires once with the final result.
    public init(question: String = "Was this helpful?", reasons: (up: [String], down: [String]) = ([], []),
                thanks: String = "Thanks for the feedback.", onRate: ((ThumbValue) -> Void)? = nil,
                onSubmit: @escaping (ThumbsResult) -> Void) {
        self.question = question; self.reasons = reasons; self.thanks = thanks
        self.onRate = onRate; self.onSubmit = onSubmit
    }

    private func list(_ value: ThumbValue?) -> [String] {
        switch value {
        case .up: reasons.up
        case .down: reasons.down
        case nil: []
        }
    }

    private func rate(_ value: ThumbValue) {
        guard state.step != .done else { return }
        let wasAsk = state.step == .ask
        let has = !list(value).isEmpty
        if state.value != value { picked = [] }
        state = Self.thumbsStep(state, .rate(value, hasReasons: has))
        onRate?(value)
        if wasAsk && !has { onSubmit(ThumbsResult(value: value, reasons: [], comment: "")) }
    }

    private func finish(send: Bool) {
        guard state.step == .detail, let value = state.value else { return }
        state = Self.thumbsStep(state, send ? .submit : .skip)
        onSubmit(ThumbsResult(value: value, reasons: send ? picked : [],
                              comment: send ? comment.trimmingCharacters(in: .whitespacesAndNewlines) : ""))
    }

    private func thumb(_ value: ThumbValue) -> some View {
        let isChosen = state.value == value
        return Button { rate(value) } label: {
            InlineGlyph(font: typography.prominentGlyph) { icons(value == .up ? .thumbUp : .thumbDown) }
                .font(typography.prominentGlyph)
                .foregroundStyle(isChosen ? theme.accent : theme.secondary)
                .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                .background(isChosen ? theme.tint : Color.clear, in: .circle)
                .contentShape(.circle)
        }
        .buttonStyle(.plain)
        .disabled(state.step == .done)
        .accessibilityLabel(value == .up ? "Yes, helpful" : "No, not helpful")
        .accessibilityAddTraits(isChosen ? [.isToggle, .isSelected] : [.isToggle])
    }

    private var thumbs: some View {
        HStack(spacing: metrics.tight) { thumb(.up); thumb(.down) }
            .accessibilityElement(children: .contain)
            .accessibilityLabel(question)
    }

    private func reasonBinding(_ reason: String) -> Binding<Bool> {
        Binding(get: { picked.contains(reason) },
                set: { on in picked.removeAll { $0 == reason }; if on { picked.append(reason) } })
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.medium) {
            switch state.step {
            case .ask:
                HStack(spacing: metrics.medium) {
                    Text(question).font(typography.body)
                    thumbs
                }
                .transition(.opacity)
            case .detail:
                VStack(alignment: .leading, spacing: metrics.medium) {
                    HStack(spacing: metrics.medium) {
                        Text(question).font(typography.body)
                        thumbs
                    }
                    FlowStack {
                        ForEach(Array(list(state.value).enumerated()), id: \.element) { index, reason in
                            SelectionChip(LocalizedStringKey(reason), isSelected: reasonBinding(reason))
                                .accessibilityFocused($focus, equals: index == 0 ? .firstReason : nil)
                        }
                    }
                    .accessibilityElement(children: .contain)
                    .accessibilityLabel("Reasons")
                    TextField("Anything to add? (optional)", text: $comment, axis: .vertical)
                        .font(typography.field)
                        .lineLimit(2...4)
                        .padding(metrics.medium)
                        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
                    HStack(spacing: metrics.compact) {
                        Button("Submit") { finish(send: true) }.buttonStyle(ActionButtonStyle(.prominent))
                        Button("Skip") { finish(send: false) }.buttonStyle(ActionButtonStyle(.quiet))
                    }
                }
                .transition(.opacity)
            case .done:
                Text(thanks)
                    .font(typography.body)
                    .accessibilityFocused($focus, equals: .thanks)
                    .accessibilityAddTraits(.updatesFrequently)
                    .transition(.opacity)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .clipped()
        .motionAnimation(.soft, value: state)
        .onChange(of: state.step) { _, step in
            switch step {
            case .detail: focus = .firstReason
            case .done: focus = .thanks
            case .ask: focus = nil
            }
        }
    }
}

#Preview("ThumbsFeedback") {
    ThumbsFeedback(reasons: (up: ["Clear", "Short"], down: ["Confusing", "Wrong"])) { _ in }.padding()
}
