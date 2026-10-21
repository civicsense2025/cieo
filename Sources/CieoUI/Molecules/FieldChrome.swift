import SwiftUI

/// Styles the host's native field without taking ownership of input purpose or focus.
public struct FieldChrome: ViewModifier {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let appearance: ControlAppearance

    public init(appearance: ControlAppearance = .init()) { self.appearance = appearance }

    public func body(content: Content) -> some View {
        content
            .font(appearance.font ?? typography.field)
            .foregroundStyle(appearance.foreground ?? theme.foreground)
            .padding(.horizontal, appearance.horizontalPadding ?? metrics.standard)
            .padding(.vertical, appearance.verticalPadding ?? 0)
            .frame(minWidth: appearance.minWidth, minHeight: appearance.minHeight ?? metrics.touchTarget)
            .background(appearance.background ?? theme.surface,
                        in: .rect(cornerRadius: appearance.cornerRadius ?? metrics.corner))
            .componentBorder(appearance.border, width: appearance.borderWidth,
                             cornerRadius: appearance.cornerRadius ?? metrics.corner,
                             placement: appearance.borderPlacement)
    }
}

public extension View {
    func fieldChrome(appearance: ControlAppearance = .init()) -> some View {
        modifier(FieldChrome(appearance: appearance))
    }
}
