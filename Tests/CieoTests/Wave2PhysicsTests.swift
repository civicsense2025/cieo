import CoreGraphics
import Foundation
import XCTest
@testable import Cieo

final class Wave2PhysicsTests: XCTestCase {
    func testRubberBandSlopeSymmetryAsymptoteAndInvalidInputs() {
        XCTAssertEqual(MotionPhysics.rubberBand(overshoot: 0, dimension: 300), 0, accuracy: 1e-12)

        // Small overshoot slope approaches default resistance 0.55
        let tiny = MotionPhysics.rubberBand(overshoot: 0.5, dimension: 100_000)
        XCTAssertEqual(tiny / 0.5, 0.55, accuracy: 1e-3)

        // Odd symmetry and monotonic concave bound < dimension
        let pos = MotionPhysics.rubberBand(overshoot: 120, dimension: 300)
        let neg = MotionPhysics.rubberBand(overshoot: -120, dimension: 300)
        XCTAssertEqual(pos, -neg, accuracy: 1e-12)
        XCTAssertGreaterThan(pos, 0)
        XCTAssertLessThan(pos, 120 * 0.55)

        let huge = MotionPhysics.rubberBand(overshoot: 1_000_000, dimension: 300)
        XCTAssertLessThan(huge, 300)
        XCTAssertGreaterThan(huge, 299)

        // Custom resistance
        let stiffer = MotionPhysics.rubberBand(overshoot: 80, dimension: 300, resistance: 0.25)
        XCTAssertLessThan(stiffer, MotionPhysics.rubberBand(overshoot: 80, dimension: 300, resistance: 0.55))

        // Invalid input guards
        XCTAssertEqual(MotionPhysics.rubberBand(overshoot: .nan, dimension: 300), 0)
        XCTAssertEqual(MotionPhysics.rubberBand(overshoot: 50, dimension: 0), 0)
        XCTAssertEqual(MotionPhysics.rubberBand(overshoot: 50, dimension: -100), 0)
        XCTAssertEqual(MotionPhysics.rubberBand(overshoot: 50, dimension: .infinity), 0)
    }

    func testProjectMomentumScalesWithVelocityAndDecelerationRate() {
        XCTAssertEqual(MotionPhysics.projectMomentum(value: 100, velocity: 0), 100, accuracy: 1e-9)

        let normal = MotionPhysics.projectMomentum(value: 100, velocity: 1000, decelerationRate: 0.998)
        let fast = MotionPhysics.projectMomentum(value: 100, velocity: 1000, decelerationRate: 0.990)
        XCTAssertEqual(normal, 100 + 499, accuracy: 1e-6)
        XCTAssertEqual(fast, 100 + 99, accuracy: 1e-6)
        XCTAssertGreaterThan(normal, fast)

        let backward = MotionPhysics.projectMomentum(value: 100, velocity: -1000, decelerationRate: 0.990)
        XCTAssertEqual(backward, 1, accuracy: 1e-6)

        XCTAssertEqual(MotionPhysics.projectMomentum(value: 42, velocity: .nan), 42)
        XCTAssertEqual(MotionPhysics.projectMomentum(value: .nan, velocity: 500), 0)
    }

    func testProjectToDetentSnapsStationaryAndAdvancesOnFlick() {
        let detents = [120.0, 420.0, 760.0]

        // Stationary / slow release snaps to nearest detent
        XCTAssertEqual(MotionPhysics.projectToDetent(value: 180, velocity: 0, detents: detents), 120)
        XCTAssertEqual(MotionPhysics.projectToDetent(value: 340, velocity: 100, detents: detents), 420)

        // Flick at or above default threshold (450) advances to next detent in flick direction
        XCTAssertEqual(MotionPhysics.projectToDetent(value: 140, velocity: 500, detents: detents), 420)
        XCTAssertEqual(MotionPhysics.projectToDetent(value: 400, velocity: -500, detents: detents), 120)

        // Strong flick can project across multiple detents
        XCTAssertEqual(MotionPhysics.projectToDetent(value: 140, velocity: 1400, detents: detents), 760)

        // Flick past terminal detent clamps back to terminal detent
        XCTAssertEqual(MotionPhysics.projectToDetent(value: 790, velocity: 800, detents: detents), 760)
        XCTAssertEqual(MotionPhysics.projectToDetent(value: 90, velocity: -800, detents: detents), 120)

        // Empty / unsorted detents
        XCTAssertEqual(MotionPhysics.projectToDetent(value: 50, velocity: 200, detents: []), 50)
        XCTAssertEqual(MotionPhysics.projectToDetent(value: 390, velocity: 0, detents: [760, .nan, 120, 420]), 420)
    }

    func testVelocityTrackerComputesSlidingWindowReleaseVelocityAndDropsStaleSamples() {
        var tracker = VelocityTracker(window: 0.1, maxSamples: 12)
        XCTAssertEqual(tracker.velocity(), .zero)

        tracker.addSample(CGPoint(x: 0, y: 0), at: 1.00)
        XCTAssertEqual(tracker.velocity(), .zero, "single sample has zero velocity")

        tracker.addSample(CGPoint(x: 15, y: -30), at: 1.05)
        tracker.addSample(CGPoint(x: 30, y: -60), at: 1.10)

        let v = tracker.velocity()
        XCTAssertEqual(v.dx, 300, accuracy: 1e-6)
        XCTAssertEqual(v.dy, -600, accuracy: 1e-6)
        XCTAssertEqual(tracker.releaseVelocity.vx, 300, accuracy: 1e-6)
        XCTAssertEqual(tracker.releaseVelocity.vy, -600, accuracy: 1e-6)

        // Holding finger stationary longer than the window zeroes release velocity
        XCTAssertEqual(tracker.velocity(at: 1.25), .zero)

        // Non-monotonic timestamp resets cleanly instead of producing negative dt
        tracker.addSample(CGPoint(x: 10, y: 10), at: 0.50)
        XCTAssertEqual(tracker.velocity(), .zero)

        tracker.reset()
        XCTAssertEqual(tracker.velocity(), .zero)
    }
}
