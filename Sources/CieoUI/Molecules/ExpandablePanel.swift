import SwiftUI

public struct ExpandablePanel<Content: View>: View {
    private let title: LocalizedStringKey
    @Binding private var isExpanded: Bool
    private let content: Content

    public init(_ title: LocalizedStringKey, isExpanded: Binding<Bool>, @ViewBuilder content: () -> Content) {
        self.title = title
        _isExpanded = isExpanded
        self.content = content()
    }

    public var body: some View {
        DisclosureGroup(isExpanded: $isExpanded) {
            content.padding(.top, Metrics.compact)
        } label: {
            Text(title).font(.headline).frame(minHeight: Metrics.touchTarget)
        }
        .motionAnimation(.base, value: isExpanded)
    }
}
