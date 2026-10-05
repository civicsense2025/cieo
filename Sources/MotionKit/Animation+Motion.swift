import SwiftUI

public extension Animation {
    /// The same critically damped response as the web springs: stiffness w², damping 2w, mass 1.
    static func motion(_ preset: SpringPreset = .base) -> Animation {
        .interpolatingSpring(mass: 1, stiffness: preset.w * preset.w, damping: 2 * preset.w, initialVelocity: 0)
    }

    /// The 100 ms ease-in used for content leaving before new content enters.
    static var motionExit: Animation { .easeIn(duration: Motion.exit) }
}

/// Runs `body` with a motion spring, or without animation when Reduce Motion is on.
public func withMotion<Result>(_ preset: SpringPreset = .base, reduceMotion: Bool, _ body: () throws -> Result) rethrows -> Result {
    try withAnimation(reduceMotion ? nil : .motion(preset), body)
}

private struct MotionModifier<V: Equatable>: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let preset: SpringPreset
    let value: V
    func body(content: Content) -> some View {
        content.animation(reduce ? nil : .motion(preset), value: value)
    }
}

public extension View {
    /// Animates changes to `value` on a motion spring; Reduce Motion makes them instant.
    func motion<V: Equatable>(_ preset: SpringPreset = .base, value: V) -> some View {
        modifier(MotionModifier(preset: preset, value: value))
    }
}
