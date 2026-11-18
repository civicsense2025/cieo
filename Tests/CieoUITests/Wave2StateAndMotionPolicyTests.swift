@testable import CieoUI
import Cieo
import SwiftUI
import XCTest

final class Wave2StateAndMotionPolicyTests: XCTestCase {
    func testTransitionEnvelopeCapturesChangeDirectionVelocityHapticAndAnnouncement() {
        let moved = TransitionEnvelope(
            prev: 1,
            next: 2,
            event: "advance",
            direction: 1,
            velocity: CGVector(dx: 120, dy: 0),
            haptic: .selection,
            announcement: "Step 2"
        )
        XCTAssertTrue(moved.changed)
        XCTAssertEqual(moved.direction, 1)
        XCTAssertEqual(moved.velocity, CGVector(dx: 120, dy: 0))
        XCTAssertEqual(moved.haptic, .selection)
        XCTAssertEqual(moved.announcement, "Step 2")

        let unchanged = TransitionEnvelope(prev: 2, next: 2, event: "noop")
        XCTAssertFalse(unchanged.changed)
        XCTAssertEqual(unchanged.direction, 0)
        XCTAssertNil(unchanged.haptic)
    }

    func testAsyncActionStateEnforcesPendingLockPreservesAttemptIDAcrossRetriesAndTruthfulTimeoutCopy() {
        var machine = AsyncActionState()
        XCTAssertEqual(machine.phase, .idle)
        let firstAttempt = machine.attemptID

        let started = machine.begin()
        XCTAssertTrue(started.changed)
        XCTAssertEqual(machine.phase, .pending)
        XCTAssertTrue(machine.phase.isPending)
        XCTAssertTrue(machine.phase.isLocked)
        XCTAssertEqual(machine.attemptID, firstAttempt)

        // Repeat tap while pending is locked out
        let duplicate = machine.begin()
        XCTAssertFalse(duplicate.changed)
        XCTAssertEqual(machine.phase, .pending)
        XCTAssertEqual(machine.attemptID, firstAttempt)

        // Timeout moves to uncertain with truthful copy and preserves attemptID for reconciliation retry
        let timedOut = machine.timeout()
        XCTAssertTrue(timedOut.changed)
        XCTAssertEqual(machine.phase, .uncertain("Sending could not be confirmed"))
        XCTAssertEqual(timedOut.haptic, .warning)
        XCTAssertEqual(machine.attemptID, firstAttempt)

        // Retrying from .uncertain preserves attemptID
        let retried = machine.begin()
        XCTAssertTrue(retried.changed)
        XCTAssertEqual(machine.phase, .pending)
        XCTAssertEqual(machine.attemptID, firstAttempt)

        // Failing and retrying also preserves attemptID
        let failed = machine.fail("Server unavailable")
        XCTAssertEqual(machine.phase, .failed("Server unavailable"))
        XCTAssertEqual(failed.haptic, .error)
        XCTAssertEqual(machine.attemptID, firstAttempt)

        _ = machine.begin()
        XCTAssertEqual(machine.attemptID, firstAttempt)

        // Succeeding completes the attempt; a subsequent begin() mints a fresh attemptID
        let done = machine.succeed()
        XCTAssertEqual(machine.phase, .succeeded)
        XCTAssertEqual(done.haptic, .success)

        _ = machine.begin()
        XCTAssertNotEqual(machine.attemptID, firstAttempt, "new submission after success must mint a new attemptID")
    }

    @MainActor
    func testToastQueueModelOrdersByPriorityPausesDeadlinesAndDismissesOnVelocity() {
        let queue = ToastQueueModel(maxCapacity: 3, maxVisible: 2, dismissVelocityThreshold: 350)
        let neutralID = queue.enqueue(title: "Saved draft", priority: .neutral, duration: 4.0, now: 10.0)
        let dangerID = queue.enqueue(title: "Connection lost", priority: .danger, duration: 5.0, now: 10.5)
        let infoID = queue.enqueue(title: "Syncing", priority: .info, duration: 4.0, now: 11.0)

        XCTAssertEqual(queue.items.map(\.id), [dangerID, infoID, neutralID])
        XCTAssertEqual(queue.visibleItems.count, 2)

        // Overflow drops lowest priority item; give warning a longer 6s duration so it outlives danger
        let warningID = queue.enqueue(title: "Quota 90%", priority: .warning, duration: 6.0, now: 11.2)
        XCTAssertEqual(queue.items.map(\.id), [dangerID, warningID, infoID])

        // Pause at t=12.5 freezes remaining time (danger had 5.0 - 2.0 = 3.0s left)
        queue.pause(at: 12.5)
        XCTAssertTrue(queue.isPaused)
        queue.tick(at: 50.0)
        XCTAssertEqual(queue.items.count, 3, "paused toasts must not expire while hovered or focused")

        // Resume at t=50.0 restores remaining deadlines; danger expires at 53.0
        queue.resume(at: 50.0)
        XCTAssertFalse(queue.isPaused)
        queue.tick(at: 52.0)
        XCTAssertTrue(queue.items.contains { $0.id == dangerID })
        queue.tick(at: 53.1)
        XCTAssertFalse(queue.items.contains { $0.id == dangerID })

        // Velocity flick dismiss
        XCTAssertFalse(queue.dismissIfFlicked(id: warningID, translation: 12, velocity: 120))
        XCTAssertTrue(queue.dismissIfFlicked(id: warningID, translation: 18, velocity: -420))
        XCTAssertFalse(queue.items.contains { $0.id == warningID })
    }

    func testSheetDetentStateRubberBandsOvershootAndProjectsReleaseToDetent() {
        var sheet = SheetDetentState(detents: [160, 420, 720], selectedDetent: 420)
        XCTAssertEqual(sheet.selectedDetent, 420)

        sheet.updateDrag(400) // 820 overshoots 720 by 100
        let rubber = sheet.effectivePosition(dimension: 300)
        XCTAssertGreaterThan(rubber, 720)
        XCTAssertLessThan(rubber, 820)

        sheet.updateDrag(-30)
        let settled = sheet.endDrag(velocity: -600)
        XCTAssertEqual(settled.prev, 420)
        XCTAssertEqual(settled.next, 160)
        XCTAssertTrue(settled.changed)
        XCTAssertEqual(settled.haptic, .selection)
        XCTAssertEqual(sheet.selectedDetent, 160)
        XCTAssertEqual(sheet.dragTranslation, 0)
    }

    @MainActor
    func testComponentMotionConfigurationHapticsPolicyAndHighlightConfiguration() throws {
        let defaults = ComponentMotionConfiguration()
        XCTAssertEqual(defaults.press, .snap)
        XCTAssertEqual(defaults.selection, .snap)
        XCTAssertEqual(defaults.layout, .base)
        XCTAssertEqual(defaults.progress, .soft)
        XCTAssertEqual(defaults.ambient, .lazy)
        XCTAssertEqual(defaults.pressedScale, 0.98, accuracy: 1e-6)
        XCTAssertEqual(defaults.liftedScale, 1.02, accuracy: 1e-6)

        let sanitized = ComponentMotionConfiguration(pressedScale: .nan, liftedScale: -5, speed: 0)
        XCTAssertEqual(sanitized.pressedScale, 0.98, accuracy: 1e-6)
        XCTAssertEqual(sanitized.liftedScale, 1.02, accuracy: 1e-6)
        XCTAssertGreaterThanOrEqual(sanitized.speed, 0.05)

        XCTAssertNil(HapticsPolicy.disabled.feedback(for: .success))
        XCTAssertNotNil(HapticsPolicy.subtle.feedback(for: .selection))
        XCTAssertEqual(HapticsPolicy.standard.feedback(for: .error), MotionHaptic.error.feedback)

        // Backward-compatible HighlightSurface(progress:) + configured HighlightSurface
        let legacy = HighlightSurface(progress: 0.4)
        let configured = HighlightSurface(
            progress: 0.6,
            configuration: HighlightConfiguration(bandWidth: 0.24, intensity: 0.8, opacity: 0.85)
        )
        let clamped = HighlightConfiguration(bandWidth: .nan, intensity: 5, opacity: -2)
        XCTAssertEqual(clamped.bandWidth, 0.16, accuracy: 1e-6)
        XCTAssertEqual(clamped.intensity, 1.0, accuracy: 1e-6)
        XCTAssertEqual(clamped.opacity, 0.0, accuracy: 1e-6)

        let probe = VStack {
            legacy.frame(width: 120, height: 40)
            configured.frame(width: 120, height: 40)
        }
        .componentMotion(defaults)
        .hapticsPolicy(.subtle)
        .environment(\.renderPolicy, RenderPolicy(effectsEnabled: true))
        XCTAssertNotNil(ImageRenderer(content: probe).cgImage)
    }
}
