import SwiftUI

/// A display numeral with its label beside it or under it. VoiceOver reads the value and label as one phrase.
public struct BigNumber: View {
    public enum Layout: Sendable { case inline, stacked }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let value: String
    private let label: String?
    private let role: DisplayRole
    private let color: Color?
    private let layout: Layout

    /// `role` should be one of the numeral roles; `color` defaults to the accent.
    public init(_ value: String, label: String? = nil, role: DisplayRole = .numeralLarge,
                color: Color? = nil, layout: Layout = .inline)
    {
        self.value = value
        self.label = label.flatMap { $0.isEmpty ? nil : $0 }
        self.role = role
        self.color = color
        self.layout = layout
    }

    public var body: some View {
        let numeral = Text(value).displayText(role).foregroundStyle(color ?? theme.accent).lineLimit(1)
            .minimumScaleFactor(0.6)
        Group {
            switch layout {
            case .inline:
                HStack(alignment: .firstTextBaseline, spacing: metrics.compact) { numeral; caption }
            case .stacked:
                VStack(alignment: .leading, spacing: metrics.tight) { numeral; caption }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(label.map { "\(value) \($0)" } ?? value))
    }

    @ViewBuilder private var caption: some View {
        if let label {
            Text(label).font(typography.strongDetail).foregroundStyle(theme.foreground)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
