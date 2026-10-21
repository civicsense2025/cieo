import SwiftUI

/// A section body, not a scroll container: the host owns one scrolling region.
public struct ContentSection<Content: View>: View {
    @Environment(\.componentMetrics) private var metrics
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    private let content: Content

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, @ViewBuilder content: () -> Content) {
        self.title = title; self.detail = detail; self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.standard) {
            Heading(title, detail: detail, level: .title)
            content
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}
