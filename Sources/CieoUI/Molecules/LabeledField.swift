import SwiftUI

public struct LabeledField: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let title: LocalizedStringKey
    private let error: LocalizedStringKey?
    @Binding private var text: String

    public init(_ title: LocalizedStringKey, text: Binding<String>, error: LocalizedStringKey? = nil) {
        self.title = title; _text = text; self.error = error
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.compact) {
            Text(title).font(typography.fieldLabel).foregroundStyle(theme.foreground)
            TextField(title, text: $text).textFieldStyle(.plain)
                .fieldChrome()
            if let error { StatusLabel(error, icon: .error, tone: .danger) }
        }
    }
}
