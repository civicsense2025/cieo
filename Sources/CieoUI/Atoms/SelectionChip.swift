import SwiftUI

public struct SelectionChip: View {
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMotion) private var motionConfig
    @Environment(\.chipStyle) private var chipStyle

    private let titleView: Text
    private let leadingSlot: AnyView?
    private let trailingSlot: AnyView?
    private let selectedAccessibilityValue: LocalizedStringKey
    private let unselectedAccessibilityValue: LocalizedStringKey
    @Binding private var isSelected: Bool

    public init(
        _ title: LocalizedStringKey,
        isSelected: Binding<Bool>,
        selectedAccessibilityValue: LocalizedStringKey = "Selected",
        unselectedAccessibilityValue: LocalizedStringKey = "Not selected"
    ) {
        self.titleView = Text(title)
        _isSelected = isSelected
        self.selectedAccessibilityValue = selectedAccessibilityValue
        self.unselectedAccessibilityValue = unselectedAccessibilityValue
        self.leadingSlot = nil
        self.trailingSlot = nil
    }

    public init(
        _ title: Text,
        isSelected: Binding<Bool>,
        selectedAccessibilityValue: LocalizedStringKey = "Selected",
        unselectedAccessibilityValue: LocalizedStringKey = "Not selected"
    ) {
        self.titleView = title
        _isSelected = isSelected
        self.selectedAccessibilityValue = selectedAccessibilityValue
        self.unselectedAccessibilityValue = unselectedAccessibilityValue
        self.leadingSlot = nil
        self.trailingSlot = nil
    }

    @_disfavoredOverload
    public init<S: StringProtocol>(
        _ title: S,
        isSelected: Binding<Bool>,
        selectedAccessibilityValue: LocalizedStringKey = "Selected",
        unselectedAccessibilityValue: LocalizedStringKey = "Not selected"
    ) {
        self.init(
            Text(verbatim: String(title)),
            isSelected: isSelected,
            selectedAccessibilityValue: selectedAccessibilityValue,
            unselectedAccessibilityValue: unselectedAccessibilityValue
        )
    }

    public init<Leading: View, Trailing: View>(
        _ title: Text,
        isSelected: Binding<Bool>,
        selectedAccessibilityValue: LocalizedStringKey = "Selected",
        unselectedAccessibilityValue: LocalizedStringKey = "Not selected",
        @ViewBuilder leading: () -> Leading,
        @ViewBuilder trailing: () -> Trailing = { EmptyView() }
    ) {
        self.titleView = title
        _isSelected = isSelected
        self.selectedAccessibilityValue = selectedAccessibilityValue
        self.unselectedAccessibilityValue = unselectedAccessibilityValue
        self.leadingSlot = AnyView(leading())
        self.trailingSlot = Trailing.self == EmptyView.self ? nil : AnyView(trailing())
    }

    public init<Trailing: View>(
        _ title: Text,
        isSelected: Binding<Bool>,
        selectedAccessibilityValue: LocalizedStringKey = "Selected",
        unselectedAccessibilityValue: LocalizedStringKey = "Not selected",
        @ViewBuilder trailing: () -> Trailing
    ) {
        self.titleView = title
        _isSelected = isSelected
        self.selectedAccessibilityValue = selectedAccessibilityValue
        self.unselectedAccessibilityValue = unselectedAccessibilityValue
        self.leadingSlot = nil
        self.trailingSlot = AnyView(trailing())
    }

    public var body: some View {
        let config = ChipStyleConfiguration(isSelected: isSelected) {
            HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
                if let leadingSlot {
                    leadingSlot
                } else {
                    InlineGlyph { icons(isSelected ? .selected : .unselected) }
                        .accessibilityHidden(true)
                }
                titleView
                if let trailingSlot {
                    trailingSlot
                }
            }
        }
        Button { isSelected.toggle() } label: {
            chipStyle.makeBody(configuration: config)
        }
        .buttonStyle(.plain)
        .motionAnimation(motionConfig.selection, value: isSelected)
        .motionHaptic(.selection, trigger: isSelected)
        .accessibilityValue(isSelected ? Text(selectedAccessibilityValue) : Text(unselectedAccessibilityValue))
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}
