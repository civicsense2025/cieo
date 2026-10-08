import SwiftUI

public struct SelectionChip: View {
    @Environment(\.componentTheme) private var theme
    private let title: LocalizedStringKey
    @Binding private var isSelected: Bool

    public init(_ title: LocalizedStringKey, isSelected: Binding<Bool>) {
        self.title = title
        _isSelected = isSelected
    }

    public var body: some View {
        Button { isSelected.toggle() } label: {
            HStack {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .accessibilityHidden(true)
                Text(title)
            }
            .padding(.horizontal, Metrics.standard)
            .frame(minHeight: Metrics.touchTarget)
            .background(isSelected ? theme.accent.opacity(0.2) : theme.surface, in: .capsule)
            .overlay { Capsule().strokeBorder(isSelected ? theme.accent : theme.border) }
        }
        .buttonStyle(.plain)
        .foregroundStyle(theme.foreground)
        .motionAnimation(.snap, value: isSelected)
        .accessibilityValue(isSelected ? Text("Selected") : Text("Not selected"))
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}
