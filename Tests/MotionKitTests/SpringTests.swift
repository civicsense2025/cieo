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
