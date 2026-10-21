import SwiftUI

public extension View {
    /// Outlines a rounded rectangle without taking taps or reading aloud. `inset` keeps the stroke inside
    /// the frame so it never clips; `centered` matches a native control's outline.
    func componentBorder(_ color: Color?, width: CGFloat, cornerRadius: CGFloat,
                         placement: ControlAppearance.BorderPlacement = .inset) -> some View {
        overlay {
            if let color {
                Group {
                    if placement == .centered {
                        RoundedRectangle(cornerRadius: cornerRadius).stroke(color, lineWidth: width)
                    } else {
                        RoundedRectangle(cornerRadius: cornerRadius).strokeBorder(color, lineWidth: width)
                    }
                }
                .allowsHitTesting(false).accessibilityHidden(true)
            }
        }
    }
}
