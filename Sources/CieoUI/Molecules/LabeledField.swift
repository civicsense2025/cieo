import SwiftUI

/// Default chromed native text input used by `LabeledField`'s `Binding<String>` initializer.
public struct LabeledTextInput: View {
    private let title: LocalizedStringKey
    @Binding private var text: String

    public init(_ title: LocalizedStringKey, text: Binding<String>) {
        self.title = title
        _text = text
    }

    public var body: some View {
        TextField(title, text: $text)
            .textFieldStyle(.plain)
            .fieldChrome()
    }
}

/// A visible field label, optional description, custom or text-field input slot, and optional error status.
public struct LabeledField<Content: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics

    private let titleView: Text
    private let descriptionView: Text?
    private let errorView: Text?
    private let content: Content

    public init(
        _ title: Text,
        description: Text? = nil,
        error: Text? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.titleView = title
        self.descriptionView = description
        self.errorView = error
        self.content = content()
    }

    public init(
        _ title: LocalizedStringKey,
        description: LocalizedStringKey? = nil,
        error: LocalizedStringKey? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.init(
            Text(title),
            description: description.map { Text($0) },
            error: error.map { Text($0) },
            content: content
        )
    }

    @_disfavoredOverload
    public init<S: StringProtocol>(
        _ title: S,
        description: Text? = nil,
        error: Text? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.init(Text(verbatim: String(title)), description: description, error: error, content: content)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.compact) {
            titleView
                .font(typography.fieldLabel)
                .foregroundStyle(theme.foreground)
            if let descriptionView {
                descriptionView
                    .font(typography.detail)
                    .foregroundStyle(theme.secondary)
            }
            content
            if let errorView {
                StatusLabel(errorView, icon: .error, tone: .danger)
            }
        }
    }
}

public extension LabeledField where Content == LabeledTextInput {
    init(
        _ title: LocalizedStringKey,
        text: Binding<String>,
        description: LocalizedStringKey? = nil,
        error: LocalizedStringKey? = nil
    ) {
        self.init(
            Text(title),
            description: description.map { Text($0) },
            error: error.map { Text($0) }
        ) {
            LabeledTextInput(title, text: text)
        }
    }
}
