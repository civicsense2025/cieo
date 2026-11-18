import Cieo
import SwiftUI

private struct MotionAnimation<Value: Equatable>: ViewModifier {
    @Environment(\.renderPolicy) private var policy
    @Environment(\.componentMotion) private var motionConfig
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let preset: SpringPreset
    let value: Value

    func body(content: Content) -> some View {
        let animation: Animation? = policy.allowsMotion && !reduceMotion
            ? (motionConfig.speed == 1.0 ? .motion(preset) : .motion(preset).speed(motionConfig.speed))
            : nil
        content.animation(animation, value: value)
    }
}

public extension View {
    /// Animate state changes with the shared spring while respecting live system restrictions and `componentMotion.speed`.
    func motionAnimation<Value: Equatable>(_ preset: SpringPreset = .base, value: Value) -> some View {
        modifier(MotionAnimation(preset: preset, value: value))
    }
}
