import SwiftUI

public struct LabeledField: View {
    @Environment(\.componentTheme) private var theme
    private let title: LocalizedStringKey
    private let error: LocalizedStringKey?
    @Binding private var text: String

    public init(_ title: LocalizedStringKey, text: Binding<String>, error: LocalizedStringKey? = nil) {
        self.title = title; _text = text; self.error = error
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: Metrics.compact) {
            Text(title).font(.headline)
            TextField(title, text: $text).textFieldStyle(.plain)
                .padding(.horizontal, Metrics.standard)
                .frame(minHeight: Metrics.touchTarget)
                .background(theme.surface, in: .rect(cornerRadius: Metrics.corner))
            if let error { Label(error, systemImage: "exclamationmark.circle").foregroundStyle(.red) }
        }
    }
}
