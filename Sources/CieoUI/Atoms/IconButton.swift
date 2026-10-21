import SwiftUI

/// A glyph-only button with a spoken label and a full touch target, such as a field's clear button or a
/// rail's pager arrow.
public struct IconButton: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    private let icon: ComponentIcon
    private let label: Text
    private let prominent: Bool
    private let action: () -> Void

    /// `prominent` uses the accent colour and the larger glyph role; otherwise the glyph is quiet.
    public init(_ icon: ComponentIcon, label: Text, prominent: Bool = false, action: @escaping () -> Void) {
        self.icon = icon
        self.label = label
        self.prominent = prominent
        self.action = action
    }

    public init(_ icon: ComponentIcon, label: LocalizedStringKey, prominent: Bool = false,
                action: @escaping () -> Void) {
        self.init(icon, label: Text(label), prominent: prominent, action: action)
    }

    public var body: some View {
        Button(action: action) {
            icons(icon)
                .font(prominent ? typography.prominentGlyph : typography.glyph)
                .foregroundStyle(prominent ? theme.accent : theme.secondary)
                .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
    }
}
