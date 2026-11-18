import SwiftUI

/// Expandable disclosure displaying a tool call's phase, duration, summary, input/output payloads, and errors.
public struct ToolCallDisclosure<ExtraContent: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentStrings) private var strings
    @Environment(\.componentMotion) private var motionConfig

    private let call: ToolCallView
    private let inputText: String?
    private let outputText: String?
    private let duration: String?
    private let extraContent: ExtraContent
    @State private var isExpanded: Bool

    public init(
        call: ToolCallView,
        inputText: String? = nil,
        outputText: String? = nil,
        duration: String? = nil,
        initiallyExpanded: Bool = false,
        @ViewBuilder extraContent: () -> ExtraContent
    ) {
        self.call = call
        self.inputText = inputText
        self.outputText = outputText
        self.duration = duration
        self.extraContent = extraContent()
        _isExpanded = State(initialValue: initiallyExpanded || call.phase == .failed)
    }

    public var body: some View {
        DisclosureGroup(isExpanded: $isExpanded) {
            VStack(alignment: .leading, spacing: metrics.compact) {
                if let summary = call.summary {
                    Text(verbatim: summary)
                        .font(typography.detail)
                        .foregroundStyle(theme.foreground)
                }
                if let inputText, !inputText.isEmpty {
                    payloadBox(inputText)
                }
                if let outputText, !outputText.isEmpty {
                    payloadBox(outputText)
                }
                if call.phase == .failed, let error = call.error {
                    StatusLabel(error, icon: .error, tone: .danger)
                }
                extraContent
            }
            .padding(.top, metrics.compact)
            .frame(maxWidth: .infinity, alignment: .leading)
        } label: {
            HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
                Circle()
                    .fill(phaseColor)
                    .frame(width: metrics.compact, height: metrics.compact)
                    .accessibilityHidden(true)
                Text(verbatim: call.name)
                    .font(typography.reference)
                    .foregroundStyle(theme.foreground)
                Spacer(minLength: metrics.compact)
                if let duration {
                    Text(verbatim: duration)
                        .font(typography.reference)
                        .foregroundStyle(theme.secondary)
                }
                Text(verbatim: strings.toolWords(for: call.phase))
                    .font(typography.strongDetail)
                    .foregroundStyle(phaseColor)
            }
            .frame(minHeight: metrics.touchTarget)
            .accessibilityElement(children: .combine)
        }
        .padding(.horizontal, metrics.medium)
        .padding(.vertical, metrics.tight)
        .background(theme.surface, in: .rect(cornerRadius: metrics.corner))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
        .motionAnimation(motionConfig.layout, value: isExpanded)
    }

    private func payloadBox(_ value: String) -> some View {
        Text(verbatim: value)
            .font(typography.reference)
            .foregroundStyle(theme.foreground)
            .padding(metrics.compact)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(theme.sunken, in: .rect(cornerRadius: metrics.cornerSmall))
    }

    private var phaseColor: Color {
        switch call.phase {
        case .started: theme.info
        case .finished: theme.success
        case .failed: theme.danger
        }
    }
}

public extension ToolCallDisclosure where ExtraContent == EmptyView {
    init(
        call: ToolCallView,
        inputText: String? = nil,
        outputText: String? = nil,
        duration: String? = nil,
        initiallyExpanded: Bool = false
    ) {
        self.init(
            call: call,
            inputText: inputText,
            outputText: outputText,
            duration: duration,
            initiallyExpanded: initiallyExpanded
        ) {
            EmptyView()
        }
    }
}
