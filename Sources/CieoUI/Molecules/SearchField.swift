import SwiftUI

public struct SearchField: View {
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let clearAccessibilityLabel: LocalizedStringKey
    private let title: LocalizedStringKey
    @Binding private var text: String

    public init(_ title: LocalizedStringKey = "Search", text: Binding<String>, clearAccessibilityLabel: LocalizedStringKey = "Clear search") {
        self.title = title
        _text = text
        self.clearAccessibilityLabel = clearAccessibilityLabel
    }

    public var body: some View {
        HStack(spacing: metrics.compact) {
            Image(systemName: "magnifyingglass").accessibilityHidden(true)
            TextField(title, text: $text).textFieldStyle(.plain).font(typography.field)
            Button { text = "" } label: {
                Image(systemName: "xmark.circle.fill")
                    .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(Text(clearAccessibilityLabel))
            .disabled(text.isEmpty)
            .opacity(text.isEmpty ? 0 : 1)
            .accessibilityHidden(text.isEmpty)
        }
        .padding(.leading, metrics.standard)
        .background(.quaternary, in: .rect(cornerRadius: metrics.corner))
    }
}
