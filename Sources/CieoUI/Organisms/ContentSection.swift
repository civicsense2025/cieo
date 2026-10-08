import SwiftUI

/// A section body, not a scroll container: the host owns one scrolling region.
public struct ContentSection<Content: View>: View {
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    private let content: Content

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, @ViewBuilder content: () -> Content) {
        self.title = title; self.detail = detail; self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: Metrics.standard) {
            Text(title).font(.title2.bold()).accessibilityAddTraits(.isHeader)
            Text(detail).foregroundStyle(.secondary)
            content
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}
