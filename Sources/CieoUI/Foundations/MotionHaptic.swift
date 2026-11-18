import SwiftUI

/// The few touch responses every Cieo interaction uses, so a lift, a tick and a result feel the same in
/// every app. The system decides whether to play them: the Haptics setting and devices without a Taptic
/// Engine silence them, and Reduce Motion does not, because a haptic is not movement.
public enum MotionHaptic: Sendable, Equatable, CaseIterable {
    /// A value or position changed by one step.
    case selection
    /// Something was picked up.
    case lift
    /// Something was put down.
    case drop
    /// An answer or action was right or succeeded.
    case success
    /// Something needs a second look.
    case warning
    /// An answer or action was wrong or failed.
    case error

    var feedback: SensoryFeedback {
        switch self {
        case .selection: .selection
        case .lift: .impact(flexibility: .soft)
        case .drop: .impact(weight: .medium)
        case .success: .success
        case .warning: .warning
        case .error: .error
        }
    }
}

private struct MotionHapticResolverModifier<Trigger: Equatable>: ViewModifier {
    @Environment(\.hapticsPolicy) private var policy
    let trigger: Trigger
    let resolve: (Trigger, Trigger) -> MotionHaptic?

    func body(content: Content) -> some View {
        content.sensoryFeedback(trigger: trigger) { old, new in
            guard let haptic = resolve(old, new) else { return nil }
            return policy.feedback(for: haptic)
        }
    }
}

public extension View {
    /// Plays `haptic` each time `trigger` changes, honoring `hapticsPolicy`.
    func motionHaptic<Trigger: Equatable>(_ haptic: MotionHaptic, trigger: Trigger) -> some View {
        modifier(MotionHapticResolverModifier(trigger: trigger) { _, _ in haptic })
    }

    /// Plays the haptic `resolve` picks for each change of `trigger`, or none when it returns `nil`. Use it
    /// when one change can mean different things, such as an answer that is right or wrong.
    func motionHaptic<Trigger: Equatable>(
        trigger: Trigger,
        _ resolve: @escaping (_ old: Trigger, _ new: Trigger) -> MotionHaptic?
    ) -> some View {
        modifier(MotionHapticResolverModifier(trigger: trigger, resolve: resolve))
    }
}
