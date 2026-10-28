import SwiftUI
import XCTest
@testable import CieoUI

final class ReorderTests: XCTestCase {
    private let centers: [Double] = [20, 80, 140, 200]

    private func drag(from: Int) throws -> ReorderDrag {
        try XCTUnwrap(ReorderDrag(from: from, centers: centers, height: 50, spacing: 10))
    }

    func testARowDroppedOnItsOwnSpotDoesNotMove() throws {
        var d = try drag(from: 1)
        d.update(translation: 0)
        XCTAssertEqual(d.over, 1)
        XCTAssertFalse(d.isMoving)
    }

    func testDraggingDownPastTheNextRowsCentreMovesOneAndTwoPlaces() throws {
        var d = try drag(from: 0)
        d.update(translation: 70) // the row's lower edge passes the second row's centre
        XCTAssertEqual(d.over, 1)
        d.update(translation: 190)
        XCTAssertEqual(d.over, 3)
    }

    func testDraggingUpMovesTowardsTheTop() throws {
        var d = try drag(from: 3)
        d.update(translation: -100)
        XCTAssertEqual(d.over, 1, "the top edge is still below the first row's centre")
        d.update(translation: -160)
        XCTAssertEqual(d.over, 0)
    }

    func testOtherRowsMakeRoomOnlyBetweenTheStartAndTheLandingPlace() throws {
        var d = try drag(from: 0)
        d.update(translation: 130)
        XCTAssertEqual(d.over, 2)
        XCTAssertEqual(d.shift(forRowAt: 0), 0)
        XCTAssertEqual(d.shift(forRowAt: 1), -60)
        XCTAssertEqual(d.shift(forRowAt: 2), -60)
        XCTAssertEqual(d.shift(forRowAt: 3), 0)
        var up = try drag(from: 3)
        up.update(translation: -70)
        XCTAssertEqual(up.shift(forRowAt: 2), 60)
        XCTAssertEqual(up.shift(forRowAt: 0), 0)
    }

    func testBadInputIsRefusedOrIgnored() throws {
        XCTAssertNil(ReorderDrag(from: 9, centers: centers, height: 50, spacing: 10))
        XCTAssertNil(ReorderDrag(from: 0, centers: [.nan, 1], height: 50, spacing: 10))
        var d = try drag(from: 1)
        d.update(translation: .infinity)
        XCTAssertEqual(d.translation, 0)
        XCTAssertEqual(d.over, 1)
    }

    func testHapticsMarkLiftCrossingAndDropOnly() {
        typealias Phase = ReorderPhase
        XCTAssertEqual(Phase.haptic(from: .idle, to: .lifted(over: 1)), .lift)
        XCTAssertEqual(Phase.haptic(from: .lifted(over: 1), to: .lifted(over: 2)), .selection)
        XCTAssertNil(Phase.haptic(from: .lifted(over: 2), to: .lifted(over: 2)))
        XCTAssertEqual(Phase.haptic(from: .lifted(over: 2), to: .idle), .drop)
        XCTAssertNil(Phase.haptic(from: .idle, to: .idle))
    }

    func testEveryHapticMapsToASystemFeedback() {
        for haptic in MotionHaptic.allCases { _ = haptic.feedback }
        XCTAssertEqual(MotionHaptic.allCases.count, 6)
    }
}
