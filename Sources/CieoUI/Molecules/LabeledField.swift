import SwiftUI

public struct LabeledField: View {
    private let title: LocalizedStringKey
    private let error: LocalizedStringKey?
    @Binding private var text: String

    public init(_ title: LocalizedStringKey, text: Binding<String>, error: LocalizedStringKey? = nil) {
        self.title = title; _text = text; self.error = error
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: Metrics.compact) {
            Text(title).font(.headline)
            TextField(title, text: $text).textFieldStyle(.roundedBorder)
                .frame(minHeight: Metrics.touchTarget)
            if let error { Label(error, systemImage: "exclamationmark.circle").foregroundStyle(.red) }
        }
    }
}
