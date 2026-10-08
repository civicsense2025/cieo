import SwiftUI

public struct SearchField: View {
    private let title: LocalizedStringKey
    @Binding private var text: String

    public init(_ title: LocalizedStringKey = "Search", text: Binding<String>) {
        self.title = title
        _text = text
    }

    public var body: some View {
        HStack(spacing: Metrics.compact) {
            Image(systemName: "magnifyingglass").accessibilityHidden(true)
            TextField(title, text: $text).textFieldStyle(.plain)
            Button { text = "" } label: {
                Image(systemName: "xmark.circle.fill")
                    .frame(minWidth: Metrics.touchTarget, minHeight: Metrics.touchTarget)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Clear search")
            .disabled(text.isEmpty)
            .opacity(text.isEmpty ? 0 : 1)
            .accessibilityHidden(text.isEmpty)
        }
        .padding(.leading, Metrics.standard)
        .background(.quaternary, in: .rect(cornerRadius: Metrics.corner))
    }
}
