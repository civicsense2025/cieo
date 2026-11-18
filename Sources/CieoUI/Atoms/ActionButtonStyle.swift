import Cieo
import SwiftUI

/// Keeps native Button focus, keyboard, roles and accessibility semantics intact.
public struct ActionButtonStyle: ButtonStyle {
    public enum Emphasis: Sendable { case prominent, quiet }
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentTheme) private var theme
    @Environment(\.controlAppearance) private var environmentAppearance
    @Environment(\.renderPolicy) private var policy
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.isEnabled) private var isEnabled
    private let emphasis: Emphasis
    private let explicitAppearance: ControlAppearance?

    public init(_ emphasis: Emphasis = .prominent, appearance: ControlAppearance? = nil) {
        self.emphasis = emphasis
        self.explicitAppearance = appearance
    }

    public func makeBody(configuration: Configuration) -> some View {
        let appearance = explicitAppearance ?? environmentAppearance
        let isDestructive = configuration.role == .destructive
        let defaultForeground: Color = isDestructive
            ? (emphasis == .prominent ? theme.onAccent : theme.danger)
            : theme.foreground
        let defaultBackground: Color = isDestructive
            ? (emphasis == .prominent ? theme.danger : theme.surface)
            : (emphasis == .prominent ? theme.tint : theme.surface)

        return configuration.label
            .font(appearance.font ?? typography.action)
            .padding(.horizontal, appearance.horizontalPadding ?? metrics.standard)
            .padding(.vertical, appearance.verticalPadding ?? metrics.compact)
            .frame(minWidth: appearance.minWidth ?? metrics.touchTarget, minHeight: appearance.minHeight ?? metrics.touchTarget)
            .foregroundStyle(appearance.foreground ?? defaultForeground)
            .background(appearance.background ?? defaultBackground,
                        in: .rect(cornerRadius: appearance.cornerRadius ?? metrics.corner))
            .componentBorder(appearance.border, width: appearance.borderWidth,
                             cornerRadius: appearance.cornerRadius ?? metrics.corner,
                             placement: appearance.borderPlacement)
            .opacity(isEnabled ? (configuration.isPressed ? appearance.pressedOpacity : 1) : appearance.disabledOpacity)
            .scaleEffect(configuration.isPressed && policy.allowsMotion && !reduceMotion ? appearance.pressedScale : 1)
            .animation(policy.allowsMotion && !reduceMotion ? .motion(.snap) : nil, value: configuration.isPressed)
    }
}
