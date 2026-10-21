import SwiftUI

public struct SelectionChip: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    private let selectedAccessibilityValue: LocalizedStringKey
    private let unselectedAccessibilityValue: LocalizedStringKey
    private let title: LocalizedStringKey
    @Binding private var isSelected: Bool

    public init(_ title: LocalizedStringKey, isSelected: Binding<Bool>,
                selectedAccessibilityValue: LocalizedStringKey = "Selected",
                unselectedAccessibilityValue: LocalizedStringKey = "Not selected") {
        self.title = title
        _isSelected = isSelected
        self.selectedAccessibilityValue = selectedAccessibilityValue
        self.unselectedAccessibilityValue = unselectedAccessibilityValue
    }

    public var body: some View {
        Button { isSelected.toggle() } label: {
            HStack {
                icons(isSelected ? .selected : .unselected)
                    .accessibilityHidden(true)
                Text(title)
            }
            .font(typography.selection)
            .padding(.horizontal, metrics.standard)
            .frame(minHeight: metrics.touchTarget)
            .background(isSelected ? theme.tint : theme.surface, in: .capsule)
        }
        .buttonStyle(.plain)
        .foregroundStyle(theme.foreground)
        .motionAnimation(.snap, value: isSelected)
        .accessibilityValue(isSelected ? Text(selectedAccessibilityValue) : Text(unselectedAccessibilityValue))
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}
