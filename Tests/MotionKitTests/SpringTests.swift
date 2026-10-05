import XCTest
@testable import MotionKit

final class SpringTests: XCTestCase {
    func testNoOvershoot() {
        for p in [SpringPreset.snap, .base, .soft, .lazy] {
            var last = 1.0
            var t = 0.0
            while t <= 2 {
                let x = Motion.resp(t, x0: 1, v0: 0, p)
                XCTAssertLessThanOrEqual(x, last + 1e-12)
                XCTAssertGreaterThanOrEqual(x, -1e-12)
                last = x
                t += 0.004
            }
        }
    }

    func testRetargetIsContinuous() {
        var tr = Track(0)
        tr.set(100, at: 0)
        let mid = tr.value(at: 0.05)
        tr.set(0, at: 0.05)
        XCTAssertEqual(tr.value(at: 0.05), mid, accuracy: 1e-9)
        XCTAssertEqual(tr.value(at: 5), 0, accuracy: 1e-6)
    }

    func testMatchesWebSettleTime() {
        XCTAssertEqual(SpringPreset.base.settleTime(epsilon: 0.01), 0.302, accuracy: 0.002)
    }
}

extension SpringTests {
    func testVelocityIsDerivativeOfPosition() {
        let h = 1e-6
        for t in [0.01, 0.05, 0.2] {
            let num = (Motion.resp(t + h, x0: 1, v0: 2, .base) - Motion.resp(t - h, x0: 1, v0: 2, .base)) / (2 * h)
            XCTAssertEqual(num, Motion.vel(t, x0: 1, v0: 2, .base), accuracy: 1e-4)
        }
        XCTAssertEqual(Motion.vel(0, x0: 1, v0: 7, .snap), 7)
    }

    func testReleaseCarriesVelocity() {
        var tr = Track(0)
        tr.release(from: 0, velocity: 50, to: 10, preset: .snap, at: 0)
        XCTAssertEqual(tr.velocity(at: 0), 50, accuracy: 1e-9)
        XCTAssertGreaterThan(tr.value(at: 0.01), 0.4)
        XCTAssertEqual(tr.value(at: 5), 10, accuracy: 1e-6)
    }

    func testPruneDropsSettledSprings() {
        var tr = Track(0)
        tr.set(100, at: 0)
        tr.set(0, at: 0.05)
        XCTAssertTrue(tr.isMoving)
        XCTAssertEqual(tr.prune(at: 0.06), 2)
        XCTAssertEqual(tr.prune(at: 5), 0)
        XCTAssertFalse(tr.isMoving)
        XCTAssertEqual(tr.value(at: 5), 0, accuracy: 1e-6)
    }

    func testRestTimeCoversSettling() throws {
        var tr = Track(0)
        XCTAssertNil(tr.restTime)
        tr.set(100, at: 10)
        let rest = try XCTUnwrap(tr.restTime)
        XCTAssertGreaterThan(rest, 10)
        XCTAssertEqual(tr.value(at: rest), 100, accuracy: 0.002)
    }

    func testMatchesSharedFixture() throws {
        let url = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("test/fixtures/spring.json")
        struct Case: Decodable { let dt, x0, v0, resp, vel: Double }
        struct Entry: Decodable { let w: Double; let cases: [Case] }
        let fixture = try JSONDecoder().decode([String: Entry].self, from: Data(contentsOf: url))
        XCTAssertEqual(Set(fixture.keys), ["snap", "base", "soft", "lazy"])
        for (name, entry) in fixture {
            let p = SpringPreset(w: entry.w)
            for c in entry.cases {
                XCTAssertEqual(Motion.resp(c.dt, x0: c.x0, v0: c.v0, p), c.resp, accuracy: 1e-9, "\(name) resp")
                XCTAssertEqual(Motion.vel(c.dt, x0: c.x0, v0: c.v0, p), c.vel, accuracy: 1e-9, "\(name) vel")
            }
        }
    }
}
