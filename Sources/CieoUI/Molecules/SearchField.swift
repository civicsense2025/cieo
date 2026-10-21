import SwiftUI

public struct SearchField: View {
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
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
            icons(.search).accessibilityHidden(true)
            TextField(title, text: $text).textFieldStyle(.plain).font(typography.field)
            IconButton(.clear, label: clearAccessibilityLabel) { text = "" }
                .disabled(text.isEmpty)
                .opacity(text.isEmpty ? 0 : 1)
                .accessibilityHidden(text.isEmpty)
        }
        .padding(.leading, metrics.standard)
        // The chrome supplies the surface, corner and 44-point height; the leading inset above is the only padding.
        .fieldChrome(appearance: ControlAppearance(horizontalPadding: 0))
    }
}
