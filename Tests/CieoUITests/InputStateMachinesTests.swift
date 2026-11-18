import XCTest
@testable import CieoUI

final class InputStateMachinesTests: XCTestCase {
    func testDisclosureReversesMidFlightAndIgnoresImpossibleEvents() {
        var state = DisclosureState()
        XCTAssertEqual(state.send(.open).direction, 1)
        XCTAssertEqual(state.phase, .opening)
        XCTAssertEqual(state.send(.close).direction, -1, "closing while opening reverses instead of waiting")
        XCTAssertEqual(state.phase, .closing)
        XCTAssertFalse(state.send(.opened).changed, "a late 'opened' after reversal must not reopen it")
        XCTAssertEqual(state.send(.closed).next, .closed)
        XCTAssertFalse(state.send(.close).changed)
    }

    func testFieldRewardsEarlyAndPunishesLate() {
        var field = FieldValidationState()
        let rule: (String) -> String? = { $0.contains("@") ? nil : "Enter an email address" }
        XCTAssertEqual(field.send(.input("ada"), validate: rule).next, .idle, "typing alone never shows an error")
        XCTAssertFalse(field.showsMessage)
        let blur = field.send(.blur, validate: rule)
        XCTAssertEqual(blur.next, .invalid)
        XCTAssertEqual(blur.announcement, "Enter an email address")
        XCTAssertEqual(blur.haptic, .error)
        let fixed = field.send(.input("ada@x.org"), validate: rule)
        XCTAssertEqual(fixed.next, .valid, "the fix is acknowledged while typing, not on the next blur")
        XCTAssertFalse(field.showsMessage)
        XCTAssertEqual(field.message, "Enter an email address", "message is kept so it can fade out")
        field.send(.input("ada"), validate: rule)
        XCTAssertEqual(field.status, .idle, "breaking a valid value relaxes to idle, not invalid")
        field.send(.reset, validate: rule)
        XCTAssertEqual(field, FieldValidationState())
    }

    func testSelectionRovesWithDirectionAndHonorsSingleVersusMultiple() {
        var single = SelectionState(items: ["a", "b", "c"], selected: ["b"])
        XCTAssertEqual(single.focusedIndex, 1)
        XCTAssertEqual(single.send(.moveFocus(1, select: true)).direction, 1)
        XCTAssertEqual(single.selected, ["c"])
        single.send(.moveFocus(1, select: false))
        XCTAssertEqual(single.focusedIndex, 0, "focus loops past the end")
        XCTAssertEqual(single.send(.end(select: false)).direction, 1)

        var multi = SelectionState(items: [1, 2, 3], allowsMultiple: true, loops: false)
        multi.send(.toggle(1)); multi.send(.toggle(3))
        XCTAssertEqual(multi.selected, [1, 3])
        multi.send(.toggle(1))
        XCTAssertEqual(multi.selected, [3])
        multi.send(.focus(0))
        XCTAssertFalse(multi.send(.moveFocus(-1, select: false)).changed, "no wrap when loops is off")
        XCTAssertEqual(multi.send(.select(9)).haptic, nil, "unknown items are ignored")
    }
}
