import SwiftUI
import MotionKit

extension AnyTransition {
    /// Overlay enter and exit: grows from `anchor` at 97% and rises `rise` points. Enters on base, leaves faster on snap.
    static func basicsPop(anchor: UnitPoint = .top, rise: CGFloat = -6) -> AnyTransition {
        .asymmetric(
            insertion: .opacity.combined(with: .scale(scale: 0.97, anchor: anchor)).combined(with: .offset(y: rise))
                .animation(.motion(.base)),
            removal: .opacity.combined(with: .scale(scale: 0.97, anchor: anchor)).combined(with: .offset(y: rise))
                .animation(.motion(.snap))
        )
    }
}

/// Card surface used by the overlay atoms: page background, hairline border, soft shadow.
struct BasicsPanelBackground: ViewModifier {
    var radius: CGFloat = 12
    func body(content: Content) -> some View {
        content
            .background(RoundedRectangle(cornerRadius: radius).fill(.background))
            .overlay(RoundedRectangle(cornerRadius: radius).strokeBorder(Color.primary.opacity(0.12)))
            .shadow(color: .black.opacity(0.12), radius: 14, y: 6)
    }
}

extension View {
    func basicsPanel(radius: CGFloat = 12) -> some View { modifier(BasicsPanelBackground(radius: radius)) }
}
