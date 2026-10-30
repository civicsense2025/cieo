import SwiftUI

/// A titled disclosure. The host either binds the open state (`isExpanded:`) or lets the panel own it
/// (`initiallyExpanded:`). A string title is shown verbatim, so database content is never looked up as a
/// localization key; pass a `LocalizedStringKey` or `Text` for interface copy.
public struct ExpandablePanel<Content: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let title: Text
    private let boundExpanded: Binding<Bool>?
    @State private var ownedExpanded: Bool
    private let content: Content
    // Type-erased like SectionHeader's accessory, so the panel's generic signature stays `<Content>`.
    private let accessory: AnyView?

    private init(title: Text, bound: Binding<Bool>?, initiallyExpanded: Bool, content: Content, accessory: AnyView?) {
        self.title = title
        boundExpanded = bound
        _ownedExpanded = State(initialValue: initiallyExpanded)
        self.content = content
        self.accessory = accessory
    }

    // MARK: Host-bound open state

    public init(_ title: Text, isExpanded: Binding<Bool>, @ViewBuilder content: () -> Content) {
        self.init(title: title, bound: isExpanded, initiallyExpanded: false, content: content(), accessory: nil)
    }

    public init(_ title: LocalizedStringKey, isExpanded: Binding<Bool>, @ViewBuilder content: () -> Content) {
        self.init(Text(title), isExpanded: isExpanded, content: content)
    }

    public init<S: StringProtocol>(_ title: S, isExpanded: Binding<Bool>, @ViewBuilder content: () -> Content) {
        self.init(Text(verbatim: String(title)), isExpanded: isExpanded, content: content)
    }

    /// A trailing view on the title row, such as a count, drawn in the detail type and secondary colour.
    public init<Accessory: View>(_ title: Text, isExpanded: Binding<Bool>, @ViewBuilder content: () -> Content,
                                 @ViewBuilder accessory: () -> Accessory) {
        self.init(title: title, bound: isExpanded, initiallyExpanded: false, content: content(),
                  accessory: AnyView(accessory()))
    }

    // MARK: Panel-owned open state

    public init(_ title: Text, initiallyExpanded: Bool = false, @ViewBuilder content: () -> Content) {
        self.init(title: title, bound: nil, initiallyExpanded: initiallyExpanded, content: content(), accessory: nil)
    }

    public init(_ title: LocalizedStringKey, initiallyExpanded: Bool = false, @ViewBuilder content: () -> Content) {
        self.init(Text(title), initiallyExpanded: initiallyExpanded, content: content)
    }

    public init<S: StringProtocol>(_ title: S, initiallyExpanded: Bool = false, @ViewBuilder content: () -> Content) {
        self.init(Text(verbatim: String(title)), initiallyExpanded: initiallyExpanded, content: content)
    }

    public init<Accessory: View>(_ title: Text, initiallyExpanded: Bool = false, @ViewBuilder content: () -> Content,
                                 @ViewBuilder accessory: () -> Accessory) {
        self.init(title: title, bound: nil, initiallyExpanded: initiallyExpanded, content: content(),
                  accessory: AnyView(accessory()))
    }

    private var isExpanded: Binding<Bool> { boundExpanded ?? $ownedExpanded }

    public var body: some View {
        DisclosureGroup(isExpanded: isExpanded) {
            content.padding(.top, metrics.compact)
        } label: {
            label
        }
        .motionAnimation(.base, value: isExpanded.wrappedValue)
    }

    private var label: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
            title.font(typography.heading).foregroundStyle(theme.foreground)
            if let accessory {
                Spacer(minLength: metrics.compact)
                accessory.font(typography.detail).foregroundStyle(theme.secondary)
            }
        }
        .frame(minHeight: metrics.touchTarget)
        .accessibilityElement(children: .combine)
    }
}
