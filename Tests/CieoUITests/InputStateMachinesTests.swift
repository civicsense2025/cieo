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

final class AsyncActionLateAnswerTests: XCTestCase {
    func testLateSuccessAfterCancelCannotFlipCancelled() {
        var machine = AsyncActionState()
        machine.begin()
        machine.cancel()
        let late = machine.succeed()
        XCTAssertFalse(late.changed)
        XCTAssertEqual(machine.phase, .cancelled)
        XCTAssertNil(late.haptic)
    }

    func testAnswersOutsidePendingAreIgnored() {
        var machine = AsyncActionState()
        XCTAssertFalse(machine.fail("x").changed)
        XCTAssertFalse(machine.timeout().changed)
        XCTAssertFalse(machine.cancel().changed)
        XCTAssertEqual(machine.phase, .idle)
        machine.begin()
        machine.succeed()
        XCTAssertFalse(machine.fail("late").changed)
        XCTAssertEqual(machine.phase, .succeeded)
    }

    func testAnswerForSupersededAttemptIsIgnored() {
        var machine = AsyncActionState()
        machine.begin()
        let first = machine.attemptID
        machine.cancel()
        machine.begin()
        XCTAssertNotEqual(machine.attemptID, first)
        XCTAssertFalse(machine.succeed(attemptID: first).changed)
        XCTAssertEqual(machine.phase, .pending)
        XCTAssertTrue(machine.succeed(attemptID: machine.attemptID).changed)
        XCTAssertEqual(machine.phase, .succeeded)
    }
}

@MainActor
final class ToastQueueVisibilityClockTests: XCTestCase {
    func testQueuedToastsAreNotExpiredBeforeTheyAreSeen() {
        let queue = ToastQueueModel(maxCapacity: 12, maxVisible: 3)
        let ids = (0..<5).map { queue.enqueue(title: "T\($0)", duration: 4, now: 0) }
        queue.tick(at: 4.1)
        XCTAssertEqual(queue.items.map(\.id), Array(ids[3...]), "the first three expire; the waiting two are still unseen")
        XCTAssertEqual(queue.visibleItems.count, 2)
        queue.tick(at: 8.0)
        XCTAssertEqual(queue.items.count, 2, "promoted toasts get a full duration from the moment they appear")
        queue.tick(at: 8.2)
        XCTAssertTrue(queue.items.isEmpty)
    }

    func testToastPushedOutOfViewFreezesItsTimer() {
        let queue = ToastQueueModel(maxCapacity: 12, maxVisible: 2)
        let low = queue.enqueue(title: "Low", priority: .neutral, duration: 4, now: 0)
        _ = queue.enqueue(title: "Mid", priority: .info, duration: 40, now: 0)
        queue.tick(at: 3.0)
        _ = queue.enqueue(title: "Urgent", priority: .danger, duration: 40, now: 3.0)
        XCTAssertFalse(queue.visibleItems.contains { $0.id == low })
        queue.tick(at: 30.0)
        XCTAssertTrue(queue.items.contains { $0.id == low }, "hidden toast keeps its remaining second")
        XCTAssertEqual(queue.items.first { $0.id == low }?.remaining ?? 0, 1.0, accuracy: 0.001)
    }
}

final class AuthOtpSanitizeTests: XCTestCase {
    func testNonAsciiDigitsMapToAsciiAndOthersDrop() {
        XCTAssertEqual(AuthOtpInput.sanitize("١٢٣٤٥٦", length: 6), "123456", "Arabic-Indic digits")
        XCTAssertEqual(AuthOtpInput.sanitize("１２３abc４", length: 6), "1234", "full-width digits")
        XCTAssertEqual(AuthOtpInput.sanitize("²³⑦", length: 6), "", "superscripts and circled digits are not decimal digits")
    }

    func testExtraKeystrokesAreTrimmedSoBackspaceRemovesOneDigit() {
        XCTAssertEqual(AuthOtpInput.sanitize("1234567", length: 6), "123456")
        XCTAssertEqual(AuthOtpInput.sanitize("", length: 6), "")
    }
}
