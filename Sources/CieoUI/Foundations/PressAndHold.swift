import Cieo
import SwiftUI

/// The numbers and rules every press-and-hold interaction shares: how long a press must last to count as
/// a hold, how far a finger may drift while it does, and how far a held finger may slide before the
/// gesture means "cancel". `.pressAndHold` and `VoiceRecorder`'s hold mode both read them here, so a
/// hold feels the same everywhere.
public enum HoldPolicy {
    /// The system's own long-press duration, in seconds.
    public static let defaultMinimumDuration: TimeInterval = 0.5
    /// A hold shorter than this is indistinguishable from a tap; one longer than this looks broken.
    public static let minimumDurationRange: ClosedRange<TimeInterval> = 0.2...5
    /// Points the finger may drift while the hold is still being recognised, the system's own allowance.
    public static let maximumDrift: CGFloat = 10
    /// Points a finger may slide left in hold-to-record before the take is thrown away.
    public static let slideCancelDistance: Double = 80
    /// The size a held control settles at, as a fraction of its resting size.
    public static let heldScale: CGFloat = 0.96

    /// A usable hold duration: not-a-number and infinite values fall back to the default, and everything
    /// else is held inside `minimumDurationRange`.
    public static func minimumDuration(_ requested: TimeInterval) -> TimeInterval {
        guard requested.isFinite else { return defaultMinimumDuration }
        return min(max(requested, minimumDurationRange.lowerBound), minimumDurationRange.upperBound)
    }

    /// True when a horizontal slide of `dx` points (negative is left) has gone far enough to cancel.
    public static func slideCancels(dx: Double) -> Bool {
        dx.isFinite && dx < -slideCancelDistance
    }

    /// The size a control takes while `held`. It stays at its resting size when motion is not allowed
    /// (Reduce Motion, Low Power Mode or the host's render policy), and a non-finite or out-of-range
    /// `heldScale` falls back to the default or the nearest bound.
    static func scale(held: Bool, motionAllowed: Bool, heldScale: CGFloat) -> CGFloat {
        guard held, motionAllowed else { return 1 }
        return heldScale.isFinite ? min(max(heldScale, 0), 1) : Self.heldScale
    }

    /// True once the long-press half of a press-then-drag sequence has completed and the finger is still
    /// down. It is false before the threshold, and the sequence ends the moment the finger lifts or the
    /// system cancels it, so a hold can never get stuck on.
    static func isHeld(_ value: SequenceGesture<LongPressGesture, DragGesture>.Value) -> Bool {
        if case .second(true, _) = value { return true }
        return false
    }
}

private struct PressAndHoldModifier: ViewModifier {
    @Environment(\.renderPolicy) private var policy
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @GestureState private var held = false
    private let minimumDuration: TimeInterval
    private let heldScale: CGFloat
    private let isHolding: Binding<Bool>?
    private let actionName: LocalizedStringKey
    private let onHold: () -> Void

    init(minimumDuration: TimeInterval, heldScale: CGFloat, isHolding: Binding<Bool>?,
         actionName: LocalizedStringKey, onHold: @escaping () -> Void) {
        self.minimumDuration = HoldPolicy.minimumDuration(minimumDuration)
        self.heldScale = heldScale
        self.isHolding = isHolding
        self.actionName = actionName
        self.onHold = onHold
    }

    func body(content: Content) -> some View {
        content
            .scaleEffect(HoldPolicy.scale(held: held, motionAllowed: policy.allowsMotion && !reduceMotion, heldScale: heldScale))
            .motionAnimation(.snap, value: held)
            .contentShape(.rect)
            .simultaneousGesture(
                LongPressGesture(minimumDuration: minimumDuration, maximumDistance: HoldPolicy.maximumDrift)
                    .sequenced(before: DragGesture(minimumDistance: 0))
                    .updating($held) { value, state, _ in state = HoldPolicy.isHeld(value) }
            )
            .onChange(of: held) { _, now in
                isHolding?.wrappedValue = now
                if now { onHold() }
            }
            .accessibilityAction(named: Text(actionName)) { onHold() }
    }
}

public extension View {
    /// Adds a press-and-hold to any view without taking over its tap. A Button's own action still runs
    /// on a quick press; holding for `minimumDuration` seconds runs `onHold` once, while the finger is
    /// still down, and a release or a system cancel ends the hold with nothing further.
    ///
    /// - Parameters:
    ///   - minimumDuration: Seconds the press must last. Held inside `HoldPolicy.minimumDurationRange`;
    ///     the default is the system's long-press duration.
    ///   - isHolding: A binding that is true from the moment the hold is recognised until the finger
    ///     lifts. Drive host haptics from it with `.sensoryFeedback(.impact, trigger: isHolding)`.
    ///   - accessibilityActionName: The name VoiceOver and Switch Control list for the hold, such as
    ///     "Stop commenting". A hold has no gesture-free equivalent, so the name is required.
    ///   - heldScale: The size the view settles at while held, as a fraction of its resting size.
    ///     Reduce Motion and a restricted render policy leave the size alone.
    ///   - onHold: The hold's action. VoiceOver's custom action runs it too.
    ///
    /// Some system versions also deliver a Button's own action when the finger lifts after a hold. If the
    /// two actions would conflict, have `onHold` set a flag that the tap action reads and clears, and
    /// confirm the behaviour on a device.
    func pressAndHold(minimumDuration: TimeInterval = HoldPolicy.defaultMinimumDuration,
                      isHolding: Binding<Bool>? = nil,
                      accessibilityActionName: LocalizedStringKey,
                      heldScale: CGFloat = HoldPolicy.heldScale,
                      onHold: @escaping () -> Void) -> some View {
        modifier(PressAndHoldModifier(minimumDuration: minimumDuration, heldScale: heldScale, isHolding: isHolding,
                                      actionName: accessibilityActionName, onHold: onHold))
    }
}
