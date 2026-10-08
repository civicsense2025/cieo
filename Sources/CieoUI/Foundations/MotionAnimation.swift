import Cieo
import SwiftUI

private struct MotionAnimation<Value: Equatable>: ViewModifier {
    @Environment(\.renderPolicy) private var policy
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let preset: SpringPreset
    let value: Value

    func body(content: Content) -> some View {
        content.animation(policy.allowsMotion && !reduceMotion ? .motion(preset) : nil, value: value)
    }
}

public extension View {
    /// Animate state changes with the shared spring while respecting live system restrictions.
    func motionAnimation<Value: Equatable>(_ preset: SpringPreset = .base, value: Value) -> some View {
        modifier(MotionAnimation(preset: preset, value: value))
    }
}
