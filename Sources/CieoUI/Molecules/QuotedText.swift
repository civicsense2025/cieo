import SwiftUI

/// Someone's exact words, such as a bill's text: an optional reference above ("Endangered Species Act §1302"),
/// a hanging quotation mark in the accent, and the passage. Emphasis inside the passage is the host's
/// (underline the changed words with `Text.underline`). No side border.
public struct QuotedText: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let passage: Text
    private let reference: Text?
    private let role: DisplayRole

    public init(_ passage: Text, reference: Text? = nil, role: DisplayRole = .headline) {
        self.passage = passage; self.reference = reference; self.role = role
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.medium) {
            if let reference { ReferenceText(reference) }
            HStack(alignment: .firstTextBaseline, spacing: metrics.tight) {
                Text(verbatim: "\u{201C}").foregroundStyle(theme.accent).accessibilityHidden(true)
                passage.foregroundStyle(theme.foreground).fixedSize(horizontal: false, vertical: true)
            }
            .displayText(role)
        }
        .accessibilityElement(children: .combine)
    }
}
