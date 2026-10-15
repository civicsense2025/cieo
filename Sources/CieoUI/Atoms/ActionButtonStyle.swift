import Cieo
import SwiftUI

/// Keeps native Button focus, keyboard, roles and accessibility semantics intact.
public struct ActionButtonStyle: ButtonStyle {
    public enum Emphasis: Sendable { case prominent, quiet }
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentTheme) private var theme
    @Environment(\.renderPolicy) private var policy
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.isEnabled) private var isEnabled
    private let emphasis: Emphasis
    private let appearance: ControlAppearance

    public init(_ emphasis: Emphasis = .prominent, appearance: ControlAppearance = .init()) {
        self.emphasis = emphasis
        self.appearance = appearance
    }

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(appearance.font ?? typography.action)
            .padding(.horizontal, appearance.horizontalPadding ?? metrics.standard)
            .padding(.vertical, appearance.verticalPadding ?? metrics.compact)
            .frame(minWidth: appearance.minWidth ?? metrics.touchTarget, minHeight: appearance.minHeight ?? metrics.touchTarget)
            .foregroundStyle(appearance.foreground ?? theme.foreground)
            .background(appearance.background ?? (emphasis == .prominent ? theme.accent.opacity(0.14) : theme.surface),
                        in: .rect(cornerRadius: appearance.cornerRadius ?? metrics.corner))
            .overlay {
                if let border = appearance.border {
                    Group {
                        if appearance.borderPlacement == .centered {
                            RoundedRectangle(cornerRadius: appearance.cornerRadius ?? metrics.corner)
                                .stroke(border, lineWidth: appearance.borderWidth)
                        } else {
                            RoundedRectangle(cornerRadius: appearance.cornerRadius ?? metrics.corner)
                                .strokeBorder(border, lineWidth: appearance.borderWidth)
                        }
                    }
                    .allowsHitTesting(false).accessibilityHidden(true)
                }
            }
            .opacity(isEnabled ? (configuration.isPressed ? appearance.pressedOpacity : 1) : appearance.disabledOpacity)
            .scaleEffect(configuration.isPressed && policy.allowsMotion && !reduceMotion ? appearance.pressedScale : 1)
            .animation(policy.allowsMotion && !reduceMotion ? .motion(.snap) : nil, value: configuration.isPressed)
    }
}
