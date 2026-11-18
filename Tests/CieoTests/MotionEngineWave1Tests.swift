import SwiftUI
import XCTest
@testable import Cieo

final class MotionEngineWave1Tests: XCTestCase {
    func testSpringPresetZetaDefaultsToCriticalAndClampsIntoSupportedRange() {
        XCTAssertEqual(SpringPreset.snap.zeta, 1.0)
        XCTAssertEqual(SpringPreset.base.zeta, 1.0)
        XCTAssertEqual(SpringPreset.soft.zeta, 1.0)
        XCTAssertEqual(SpringPreset.lazy.zeta, 1.0)

        let custom = SpringPreset(w: 22, zeta: 0.8)
        XCTAssertEqual(custom.w, 22)
        XCTAssertEqual(custom.zeta, 0.8, accuracy: 1e-12)

        XCTAssertEqual(SpringPreset(w: 22, zeta: 0.2).zeta, 0.7, accuracy: 1e-12)
        XCTAssertEqual(SpringPreset(w: 22, zeta: 1.5).zeta, 1.0, accuracy: 1e-12)
        XCTAssertEqual(SpringPreset(w: 22, zeta: .nan).zeta, 1.0, accuracy: 1e-12)
    }

    func testUnderdampedAnalyticalResponseAndVelocityMatchDifferentialEquation() {
        for zeta in [0.7, 0.8, 0.92] {
            let p = SpringPreset(w: 22, zeta: zeta)
            let wd = p.w * (1 - zeta * zeta).squareRoot()
            // Boundary conditions at dt <= 0
            XCTAssertEqual(Motion.resp(0, x0: 1.5, v0: -3, p), 1.5, accuracy: 1e-12)
            XCTAssertEqual(Motion.vel(0, x0: 1.5, v0: -3, p), -3, accuracy: 1e-12)

            // Exact closed-form check at half a damped period (pi / wd): cos = -1, sin = 0 -> overshoots past 0!
            let halfPeriod = .pi / wd
            let expectedAtHalfPeriod = -exp(-zeta * p.w * halfPeriod)
            XCTAssertEqual(Motion.resp(halfPeriod, x0: 1, v0: 0, p), expectedAtHalfPeriod, accuracy: 1e-12)
            XCTAssertLessThan(Motion.resp(halfPeriod, x0: 1, v0: 0, p), 0, "underdamped spring overshoots slightly")

            // Numerical derivative of resp matches vel across trajectory
            let h = 1e-6
            for t in [0.01, 0.05, 0.14, 0.25] {
                let num = (Motion.resp(t + h, x0: 1.2, v0: -4.0, p) - Motion.resp(t - h, x0: 1.2, v0: -4.0, p)) / (2 * h)
                XCTAssertEqual(num, Motion.vel(t, x0: 1.2, v0: -4.0, p), accuracy: 1e-4, "zeta=\(zeta) t=\(t)")
            }
        }
    }

    func testUnderdampedSettleTimeAndTrackRestDoNotStopPrematurelyAtZeroCrossing() throws {
        let p = SpringPreset(w: 20, zeta: 0.75)
        let settle = p.settleTime(epsilon: 1e-3)
        // First zero crossing is before 0.12s, while envelope decays past 1e-3 around 0.49s.
        XCTAssertGreaterThan(settle, 0.4)
        for step in 0...40 {
            let t = settle + Double(step) * 0.005
            XCTAssertLessThanOrEqual(abs(Motion.resp(t, x0: 1, v0: 0, p)), 1e-3 + 1e-6)
        }

        var tr = Track(0, preset: p)
        tr.set(100, at: 10)
        let rest = try XCTUnwrap(tr.restTime)
        XCTAssertGreaterThan(rest, 10.4)
        XCTAssertEqual(tr.value(at: rest), 100, accuracy: 0.2)
        XCTAssertEqual(tr.prune(at: 10.08), 1, "must not prune at an early zero crossing")
        XCTAssertEqual(tr.prune(at: rest + 0.05), 0)
    }

    func testLiveSpringSupportsUnderdampedZetaAndRetargetsSmoothly() throws {
        var spring = try LiveSpring(0, at: 0, frequency: 22, zeta: 0.75)
        try spring.retarget(100, at: 0)
        let wd = 22 * (1 - 0.75 * 0.75).squareRoot()
        let peakTime = .pi / wd
        let sampleAtPeak = try spring.sample(at: peakTime)
        XCTAssertGreaterThan(sampleAtPeak.value, 100, "underdamped LiveSpring overshoots target")
        XCTAssertTrue(sampleAtPeak.moving)

        // Retargeting mid-oscillation preserves position & velocity continuity
        let before = try spring.sample(at: 0.08)
        try spring.retarget(50, at: 0.08)
        let after = try spring.sample(at: 0.08)
        XCTAssertEqual(after.value, before.value, accuracy: 1e-9)
        XCTAssertEqual(after.velocity, before.velocity, accuracy: 1e-9)

        let settled = try spring.sample(at: 5.0)
        XCTAssertEqual(settled.value, 50, accuracy: 1e-6)
        XCTAssertFalse(settled.moving)
    }

    func testAnimationMotionAndWithMotionAcceptInitialVelocity() {
        let anim = Animation.motion(.snap, initialVelocity: 4.5)
        _ = anim
        var flag = false
        withMotion(.base, initialVelocity: 2.0, reduceMotion: false) {
            flag = true
        }
        XCTAssertTrue(flag)
        var reducedFlag = false
        withMotion(.base, initialVelocity: 2.0, reduceMotion: true) {
            reducedFlag = true
        }
        XCTAssertTrue(reducedFlag)
    }

    @MainActor
    func testEdgesIndicatorSupportsHorizontalVerticalAndBothAxes() {
        let rectA = CGRect(x: 10, y: 20, width: 60, height: 30)
        let rectB = CGRect(x: 90, y: 110, width: 60, height: 40)

        let defaultHorizontal = EdgesIndicator(frame: rectA, shape: Capsule(), style: .primary)
        let vertical = EdgesIndicator(frame: rectA, shape: Capsule(), style: .primary, axis: .vertical)
        let both = EdgesIndicator(frame: rectA, shape: RoundedRectangle(cornerRadius: 8), style: Color.accentColor, axis: .both)
        _ = defaultHorizontal.body
        _ = vertical.body
        _ = both.body

        let hDelays = EdgesIndicator<Capsule>.edgeDelays(from: rectA, to: rectB, axis: .horizontal)
        XCTAssertEqual(hDelays.minX, Motion.lag)
        XCTAssertEqual(hDelays.maxX, 0)
        XCTAssertEqual(hDelays.minY, 0)
        XCTAssertEqual(hDelays.maxY, 0)

        let vDelays = EdgesIndicator<Capsule>.edgeDelays(from: rectA, to: rectB, axis: .vertical)
        XCTAssertEqual(vDelays.minX, 0)
        XCTAssertEqual(vDelays.maxX, 0)
        XCTAssertEqual(vDelays.minY, Motion.lag)
        XCTAssertEqual(vDelays.maxY, 0)

        let bDelaysUpLeft = EdgesIndicator<Capsule>.edgeDelays(from: rectB, to: rectA, axis: .both)
        XCTAssertEqual(bDelaysUpLeft.minX, 0)
        XCTAssertEqual(bDelaysUpLeft.maxX, Motion.lag)
        XCTAssertEqual(bDelaysUpLeft.minY, 0)
        XCTAssertEqual(bDelaysUpLeft.maxY, Motion.lag)
    }

    func testMotionScheduleTicksAt120HzAndHaltsAtRest() {
        let start = Date(timeIntervalSinceReferenceDate: 100.0)
        let idleEntries = Array(MotionSchedule(rest: nil).entries(from: start, mode: .normal).prefix(10))
        XCTAssertEqual(idleEntries, [start], "idle schedule emits one resting frame and stops")

        let activeEntries = Array(MotionSchedule(rest: 100.0 + 0.05).entries(from: start, mode: .normal).prefix(20))
        // 0.05s at 1/120s (~0.008333s) = 0, 1/120, 2/120, 3/120, 4/120, 5/120, 6/120 (0.05) => 7 entries (60Hz would be 4 entries)
        XCTAssertEqual(activeEntries.count, 7)
        XCTAssertEqual(activeEntries[1].timeIntervalSince(activeEntries[0]), 1.0 / 120.0, accuracy: 1e-9)
        XCTAssertEqual(activeEntries.last?.timeIntervalSinceReferenceDate ?? 0, 100.05, accuracy: 1e-9)
    }
}
