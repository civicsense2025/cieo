import Cieo
import SwiftUI

/// Keeps native Button focus, keyboard, roles and accessibility semantics intact.
public struct ActionButtonStyle: ButtonStyle {
    public enum Emphasis: Sendable { case prominent, quiet }
    @Environment(\.componentTheme) private var theme
    @Environment(\.renderPolicy) private var policy
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.isEnabled) private var isEnabled
    private let emphasis: Emphasis

    public init(_ emphasis: Emphasis = .prominent) {
        self.emphasis = emphasis
    }

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .padding(.horizontal, Metrics.standard)
            .padding(.vertical, Metrics.compact)
            .frame(minWidth: Metrics.touchTarget, minHeight: Metrics.touchTarget)
            .foregroundStyle(theme.foreground)
            .background(emphasis == .prominent ? theme.accent.opacity(0.14) : theme.surface,
                        in: .rect(cornerRadius: Metrics.corner))
            .opacity(isEnabled ? (configuration.isPressed ? 0.75 : 1) : 0.5)
            .scaleEffect(configuration.isPressed && policy.allowsMotion && !reduceMotion ? 0.98 : 1)
            .animation(policy.allowsMotion && !reduceMotion ? .motion(.snap) : nil, value: configuration.isPressed)
    }
}
