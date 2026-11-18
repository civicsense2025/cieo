import Cieo
import CoreGraphics
import Foundation

/// Structured state transition metadata pairing pure state changes with directional velocity, haptics, and VoiceOver copy.
public struct TransitionEnvelope<StateValue: Equatable & Sendable, Event: Sendable>: Sendable {
    public let prev: StateValue
    public let next: StateValue
    public let event: Event
    public let changed: Bool
    public let direction: Int
    public let velocity: CGVector
    public let haptic: MotionHaptic?
    public let announcement: String?

    public init(
        prev: StateValue,
        next: StateValue,
        event: Event,
        direction: Int = 0,
        velocity: CGVector = .zero,
        haptic: MotionHaptic? = nil,
        announcement: String? = nil
    ) {
        self.prev = prev
        self.next = next
        self.event = event
        self.changed = prev != next
        self.direction = direction
        self.velocity = velocity
        self.haptic = haptic
        self.announcement = announcement
    }
}

extension TransitionEnvelope: Equatable where Event: Equatable {}

/// Explicit lifecycle for asynchronous user actions. Never maps an unconfirmed timeout to success or failure.
public enum AsyncActionPhase: Equatable, Sendable {
    public static let defaultUncertainMessage = "Sending could not be confirmed"

    case idle
    case pending
    case succeeded
    case failed(String)
    case canceled
    case uncertain(String)

    public var isPending: Bool { self == .pending }
    /// Enforces repeat-tap lockout while a request is in flight.
    public var isLocked: Bool { self == .pending }
    public var canTrigger: Bool { self != .pending }

    public var failureMessage: String? {
        switch self {
        case .failed(let message), .uncertain(let message): message
        default: nil
        }
    }

    public var haptic: MotionHaptic? {
        switch self {
        case .succeeded: .success
        case .failed: .error
        case .uncertain: .warning
        case .idle, .pending, .canceled: nil
        }
    }
}

public enum AsyncActionEvent: String, Equatable, Sendable {
    case begin, succeed, fail, cancel, timeout, reset
}

/// Pure state machine managing `AsyncActionPhase` transitions and preserving `attemptID` across `.failed`/`.uncertain` retries.
public struct AsyncActionState: Equatable, Sendable {
    public private(set) var phase: AsyncActionPhase
    public private(set) var attemptID: UUID
    private var needsFreshAttemptOnNextBegin: Bool

    public init(phase: AsyncActionPhase = .idle, attemptID: UUID = UUID()) {
        self.phase = phase
        self.attemptID = attemptID
        self.needsFreshAttemptOnNextBegin = false
    }

    @discardableResult
    public mutating func begin() -> TransitionEnvelope<AsyncActionPhase, AsyncActionEvent> {
        let prev = phase
        guard prev != .pending else {
            return TransitionEnvelope(prev: prev, next: prev, event: .begin)
        }
        if needsFreshAttemptOnNextBegin {
            attemptID = UUID()
            needsFreshAttemptOnNextBegin = false
        }
        phase = .pending
        return TransitionEnvelope(prev: prev, next: .pending, event: .begin, direction: 1, announcement: "In progress")
    }

    /// Answers (succeed, fail, timeout, cancel) only land on a pending attempt, and, when an id is given, only on the current attempt.
    private func accepts(_ answered: UUID?) -> Bool {
        phase == .pending && (answered == nil || answered == attemptID)
    }

    private func ignored(_ event: AsyncActionEvent) -> TransitionEnvelope<AsyncActionPhase, AsyncActionEvent> {
        TransitionEnvelope(prev: phase, next: phase, event: event)
    }

    @discardableResult
    public mutating func succeed(announcement: String? = "Completed", attemptID answered: UUID? = nil) -> TransitionEnvelope<AsyncActionPhase, AsyncActionEvent> {
        let prev = phase
        guard accepts(answered) else { return ignored(.succeed) }
        phase = .succeeded
        needsFreshAttemptOnNextBegin = true
        return TransitionEnvelope(prev: prev, next: .succeeded, event: .succeed, direction: 1, haptic: .success, announcement: announcement)
    }

    @discardableResult
    public mutating func fail(_ message: String, attemptID answered: UUID? = nil) -> TransitionEnvelope<AsyncActionPhase, AsyncActionEvent> {
        let prev = phase
        guard accepts(answered) else { return ignored(.fail) }
        let clean = message.isEmpty ? "Action failed" : message
        phase = .failed(clean)
        needsFreshAttemptOnNextBegin = false
        return TransitionEnvelope(prev: prev, next: phase, event: .fail, direction: -1, haptic: .error, announcement: clean)
    }

    @discardableResult
    public mutating func timeout(_ message: String = AsyncActionPhase.defaultUncertainMessage, attemptID answered: UUID? = nil) -> TransitionEnvelope<AsyncActionPhase, AsyncActionEvent> {
        let prev = phase
        guard accepts(answered) else { return ignored(.timeout) }
        let clean = message.isEmpty ? AsyncActionPhase.defaultUncertainMessage : message
        phase = .uncertain(clean)
        needsFreshAttemptOnNextBegin = false
        return TransitionEnvelope(prev: prev, next: phase, event: .timeout, direction: 0, haptic: .warning, announcement: clean)
    }

    @discardableResult
    public mutating func cancel(attemptID answered: UUID? = nil) -> TransitionEnvelope<AsyncActionPhase, AsyncActionEvent> {
        let prev = phase
        guard accepts(answered) else { return ignored(.cancel) }
        phase = .canceled
        needsFreshAttemptOnNextBegin = true
        return TransitionEnvelope(prev: prev, next: .canceled, event: .cancel, direction: -1, announcement: "Canceled")
    }

    @discardableResult
    public mutating func reset() -> TransitionEnvelope<AsyncActionPhase, AsyncActionEvent> {
        let prev = phase
        phase = .idle
        attemptID = UUID()
        needsFreshAttemptOnNextBegin = false
        return TransitionEnvelope(prev: prev, next: .idle, event: .reset)
    }
}

/// Velocity-projected detent snapping model with rubber-banded boundary overshoot.
public struct SheetDetentState: Equatable, Sendable {
    public let detents: [Double]
    public private(set) var selectedDetent: Double
    public private(set) var dragTranslation: Double

    public init(detents: [Double], selectedDetent: Double? = nil) {
        let sorted = Array(Set(detents.filter(\.isFinite))).sorted()
        let resolvedDetents = sorted.isEmpty ? [0.0] : sorted
        self.detents = resolvedDetents
        if let selectedDetent, selectedDetent.isFinite {
            self.selectedDetent = MotionPhysics.projectToDetent(value: selectedDetent, velocity: 0, detents: resolvedDetents)
        } else {
            self.selectedDetent = resolvedDetents[0]
        }
        self.dragTranslation = 0
    }

    public mutating func updateDrag(_ translation: Double) {
        dragTranslation = translation.isFinite ? translation : 0
    }

    public func effectivePosition(dimension: Double, resistance: Double = 0.55) -> Double {
        let raw = selectedDetent + dragTranslation
        let lo = detents[0]
        let hi = detents[detents.count - 1]
        if raw < lo {
            return lo + MotionPhysics.rubberBand(overshoot: raw - lo, dimension: dimension, resistance: resistance)
        }
        if raw > hi {
            return hi + MotionPhysics.rubberBand(overshoot: raw - hi, dimension: dimension, resistance: resistance)
        }
        return raw
    }

    @discardableResult
    public mutating func select(_ detent: Double) -> TransitionEnvelope<Double, String> {
        let prev = selectedDetent
        let next = MotionPhysics.projectToDetent(value: detent, velocity: 0, detents: detents)
        selectedDetent = next
        dragTranslation = 0
        let dir = next > prev ? 1 : (next < prev ? -1 : 0)
        return TransitionEnvelope(prev: prev, next: next, event: "select", direction: dir, haptic: next != prev ? .selection : nil)
    }

    @discardableResult
    public mutating func endDrag(velocity: Double, velocityThreshold: Double = 450) -> TransitionEnvelope<Double, String> {
        let prev = selectedDetent
        let raw = selectedDetent + dragTranslation
        let next = MotionPhysics.projectToDetent(
            value: raw,
            velocity: velocity,
            detents: detents,
            velocityThreshold: velocityThreshold
        )
        selectedDetent = next
        dragTranslation = 0
        let dir = next > prev ? 1 : (next < prev ? -1 : 0)
        return TransitionEnvelope(
            prev: prev,
            next: next,
            event: "endDrag",
            direction: dir,
            velocity: CGVector(dx: 0, dy: velocity.isFinite ? velocity : 0),
            haptic: next != prev ? .selection : .drop
        )
    }
}
