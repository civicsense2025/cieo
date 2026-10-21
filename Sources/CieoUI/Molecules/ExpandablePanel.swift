import SwiftUI

public struct ExpandablePanel<Content: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
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
            content.padding(.top, metrics.compact)
        } label: {
            Text(title).font(typography.heading).foregroundStyle(theme.foreground).frame(minHeight: metrics.touchTarget)
        }
        .motionAnimation(.base, value: isExpanded)
    }
}
