@testable import CieoUI
import SwiftUI
import XCTest

@MainActor
private final class FakePlayer: AudioPausable {
    var pauses = 0
    func pause() { pauses += 1 }
}

private final class FakeAudioSessionManager: AudioSessionManaging, @unchecked Sendable {
    private let lock = NSLock()
    private var owner: UUID?
    private var deactivations = 0
    private var activationFailuresRemaining = 0

    var reconciliationStatus: AudioSessionReconciliationStatus { .ready }

    var activeOwner: UUID? {
        lock.lock(); defer { lock.unlock() }
        return owner
    }

    var deactivationCount: Int {
        lock.lock(); defer { lock.unlock() }
        return deactivations
    }

    func failNextActivation() {
        lock.lock(); defer { lock.unlock() }
        activationFailuresRemaining += 1
    }

    func activate(_ use: AudioSessionUse, owner: UUID) throws {
        lock.lock(); defer { lock.unlock() }
        if activationFailuresRemaining > 0 {
            activationFailuresRemaining -= 1
            throw CocoaError(.fileReadUnknown)
        }
        self.owner = owner
    }

    func deactivate(owner: UUID) throws {
        lock.lock(); defer { lock.unlock() }
        guard self.owner == owner else { return }
        self.owner = nil
        deactivations += 1
    }
}

private enum FakeAudioSessionFailure: Error { case category, activation, deactivation }

private final class FakeSystemAudioSessionBackend: AudioSessionBackend, @unchecked Sendable {
    private let lock = NSLock()
    private var configuredCategories: [AudioSessionCategory] = []
    private var activeChanges: [Bool] = []
    private var currentActive = false
    private var categoryFailuresRemaining = 0
    private var activationFailuresRemaining = 0
    private var deactivationFailuresRemaining = 0

    var categories: [AudioSessionCategory] {
        lock.lock(); defer { lock.unlock() }
        return configuredCategories
    }

    var activeValues: [Bool] {
        lock.lock(); defer { lock.unlock() }
        return activeChanges
    }

    var deactivationAttempts: Int {
        lock.lock(); defer { lock.unlock() }
        return activeChanges.filter { !$0 }.count
    }

    var isActive: Bool {
        lock.lock(); defer { lock.unlock() }
        return currentActive
    }

    func failNextActivation() {
        lock.lock(); defer { lock.unlock() }
        activationFailuresRemaining += 1
    }

    func failNextCategoryChange() {
        lock.lock(); defer { lock.unlock() }
        categoryFailuresRemaining += 1
    }

    func failCategoryChanges(_ count: Int) {
        lock.lock(); defer { lock.unlock() }
        categoryFailuresRemaining += max(0, count)
    }

    func failNextDeactivation() {
        lock.lock(); defer { lock.unlock() }
        deactivationFailuresRemaining += 1
    }

    func failDeactivations(_ count: Int) {
        lock.lock(); defer { lock.unlock() }
        deactivationFailuresRemaining += max(0, count)
    }

    func setCategory(_ category: AudioSessionCategory) throws {
        lock.lock(); defer { lock.unlock() }
        if categoryFailuresRemaining > 0 {
            categoryFailuresRemaining -= 1
            throw FakeAudioSessionFailure.category
        }
        configuredCategories.append(category)
    }

    func setActive(_ active: Bool) throws {
        lock.lock(); defer { lock.unlock() }
        activeChanges.append(active)
        if active, activationFailuresRemaining > 0 {
            activationFailuresRemaining -= 1
            throw FakeAudioSessionFailure.activation
        }
        if !active, deactivationFailuresRemaining > 0 {
            deactivationFailuresRemaining -= 1
            throw FakeAudioSessionFailure.deactivation
        }
        currentActive = active
    }
}

private final class ManualAudioSessionRetryTicket: AudioSessionRetryTicket, @unchecked Sendable {
    private let lock = NSLock()
    private var operation: (@Sendable () -> Void)?
    private var cancelled = false
    private var delivered = false

    init(operation: @escaping @Sendable () -> Void) { self.operation = operation }

    var isPending: Bool {
        lock.lock(); defer { lock.unlock() }
        return !cancelled && !delivered && operation != nil
    }

    var isCancelledAndUndelivered: Bool {
        lock.lock(); defer { lock.unlock() }
        return cancelled && !delivered
    }

    func cancel() {
        lock.lock(); defer { lock.unlock() }
        cancelled = true
        operation = nil
    }

    @discardableResult
    func deliver() -> Bool {
        lock.lock()
        guard !delivered else { lock.unlock(); return false }
        delivered = true
        let work = operation
        operation = nil
        lock.unlock()
        work?()
        return true
    }

    func takeOperationForDelivery() -> (@Sendable () -> Void)? {
        lock.lock(); defer { lock.unlock() }
        guard !delivered else { return nil }
        delivered = true
        let work = operation
        operation = nil
        return work
    }
}

private final class ManualAudioSessionRetryScheduler: AudioSessionRetryScheduler, @unchecked Sendable {
    private let lock = NSLock()
    private var tickets: [ManualAudioSessionRetryTicket] = []

    var pendingCount: Int {
        lock.lock(); defer { lock.unlock() }
        return tickets.filter(\.isPending).count
    }

    func schedule(after delay: TimeInterval, operation: @escaping @Sendable () -> Void) -> any AudioSessionRetryTicket {
        let ticket = ManualAudioSessionRetryTicket(operation: operation)
        lock.lock(); defer { lock.unlock() }
        tickets.append(ticket)
        return ticket
    }

    @discardableResult
    func runNext() -> Bool {
        lock.lock()
        let ticket = tickets.first(where: \.isPending)
        lock.unlock()
        return ticket?.deliver() ?? false
    }

    @discardableResult
    func deliverNextCancelledTicket() -> Bool {
        lock.lock()
        let ticket = tickets.first(where: \.isCancelledAndUndelivered)
        lock.unlock()
        return ticket?.deliver() ?? false
    }

    func takeNextOperation() -> (@Sendable () -> Void)? {
        lock.lock()
        let ticket = tickets.first(where: \.isPending)
        lock.unlock()
        return ticket?.takeOperationForDelivery()
    }
}

private final class WeaklyRetainingAudioSessionRetryScheduler: AudioSessionRetryScheduler, @unchecked Sendable {
    weak var ticket: ManualAudioSessionRetryTicket?

    func schedule(after delay: TimeInterval, operation: @escaping @Sendable () -> Void) -> any AudioSessionRetryTicket {
        let ticket = ManualAudioSessionRetryTicket(operation: operation)
        self.ticket = ticket
        return ticket
    }
}

private final class ImmediateAudioSessionRetryScheduler: AudioSessionRetryScheduler, @unchecked Sendable {
    func schedule(after delay: TimeInterval, operation: @escaping @Sendable () -> Void) -> any AudioSessionRetryTicket {
        let ticket = ManualAudioSessionRetryTicket(operation: operation)
        ticket.deliver()
        return ticket
    }
}

private final class WeakAudioSessionManager {
    weak var value: SystemAudioSessionManager?
}

final class AudioPlaybackTests: XCTestCase {
    // MARK: AudioTime

    func testFormatReadsMinutesThenHoursAndNeverNegative() {
        XCTAssertEqual(AudioTime.formatAudioTime(0), "0:00")
        XCTAssertEqual(AudioTime.formatAudioTime(63.9), "1:03")
        XCTAssertEqual(AudioTime.formatAudioTime(3605), "1:00:05")
        XCTAssertEqual(AudioTime.formatAudioTime(-4), "0:00")
        XCTAssertEqual(AudioTime.formatAudioTime(.infinity), "0:00")
        XCTAssertEqual(AudioTime.formatAudioTime(.nan), "0:00")
        XCTAssertEqual(AudioTime.speakAudioTime(63), "1 minute 3 seconds")
        XCTAssertEqual(AudioTime.speakAudioTime(0), "0 seconds")
        XCTAssertEqual(AudioTime.speakAudioTime(3660), "1 hour 1 minute")
        XCTAssertEqual(AudioTime.speakAudioTime(1), "1 second")
    }

    func testTimeModesShowElapsedRemainingTotalAndUnknownLength() {
        XCTAssertEqual(AudioTime.text(current: 12, duration: 63, mode: .elapsed), "0:12 / 1:03")
        XCTAssertEqual(AudioTime.text(current: 12, duration: nil, mode: .elapsed), "0:12")
        XCTAssertEqual(AudioTime.text(current: 12, duration: 63, mode: .remaining), "-0:51")
        XCTAssertEqual(AudioTime.text(current: 90, duration: 63, mode: .remaining), "-0:00")
        XCTAssertEqual(AudioTime.text(current: 12, duration: nil, mode: .remaining), "0:12")
        XCTAssertEqual(AudioTime.text(current: 0, duration: 63, mode: .total), "1:03")
        XCTAssertEqual(AudioTime.text(current: 0, duration: nil, mode: .total), "--:--")
        XCTAssertEqual(AudioTime.spoken(current: 12, duration: 63, mode: .elapsed), "12 seconds of 1 minute 3 seconds")
        XCTAssertEqual(AudioTime.spoken(current: 12, duration: 63, mode: .remaining), "51 seconds left")
        XCTAssertEqual(AudioTime.spoken(current: 0, duration: nil, mode: .total), "length unknown")
    }

    // MARK: AudioPlayButton and PlaybackRateButton

    func testPlayButtonNamesTheActionAfterTheClip() {
        XCTAssertEqual(AudioPlayButton.accessibleName(playing: false, label: "Note"), "Play Note")
        XCTAssertEqual(AudioPlayButton.accessibleName(playing: true, label: "Note"), "Pause Note")
    }

    func testPlayButtonSizesNeverDropBelowTheTouchTarget() {
        let metrics = ComponentMetrics()
        let sides = AudioPlayButton.Size.allCases.map { AudioPlayButton.diameter($0, metrics: metrics) }
        XCTAssertTrue(sides.allSatisfy { $0 >= metrics.touchTarget })
        XCTAssertEqual(sides, sides.sorted())
    }

    func testPlayPauseMorphMovesFromATriangleToTwoBars() {
        let play = PlayPauseShape.points(pause: 0), pause = PlayPauseShape.points(pause: 1), mid = PlayPauseShape.points(pause: 0.5)
        XCTAssertEqual(play[1].map(\.y).max(), 0.73, "play's right half narrows to the tip")
        XCTAssertEqual(pause[0].map(\.y).sorted(), [0, 0, 1, 1], "a pause bar runs the full height")
        XCTAssertLessThan(pause[0].map(\.x).max()!, pause[1].map(\.x).min()!, "two separate bars")
        XCTAssertNotEqual(mid, play)
        XCTAssertNotEqual(mid, pause)
        XCTAssertEqual(PlayPauseShape.points(pause: -3), play)
        XCTAssertEqual(PlayPauseShape.points(pause: 9), pause)
    }

    func testNextRateCyclesWrapsRestartsOnUnknownAndToleratesEmpty() {
        XCTAssertEqual(PlaybackRateButton.nextRate([1, 1.5, 2], after: 1), 1.5)
        XCTAssertEqual(PlaybackRateButton.nextRate([1, 1.5, 2], after: 2), 1)
        XCTAssertEqual(PlaybackRateButton.nextRate([1, 1.5, 2], after: 0.75), 1)
        XCTAssertEqual(PlaybackRateButton.nextRate([], after: 1.5), 1.5)
    }

    func testRateCycleSkipsInvalidRatesAndUsesASafeFallback() {
        XCTAssertEqual(PlaybackRateButton.nextRate([0, .nan, -1, 1.5, .infinity, 2], after: 1.5), 2)
        XCTAssertEqual(PlaybackRateButton.nextRate([0, .nan, -1], after: 1.5), 1)
        XCTAssertEqual(PlaybackRateButton.nextRate([], after: .nan), 1)
        XCTAssertEqual(PlaybackRateButton.display(.nan), PlaybackRateButton.display(1))
        XCTAssertEqual(PlaybackRateButton.accessibleName(0), "Playback speed, 1 time")
    }

    func testRateShowsTimesSignAndNamesItInWords() {
        XCTAssertEqual(PlaybackRateButton.display(1.5), "1.5×".replacingOccurrences(of: ".", with: Locale.current.decimalSeparator ?? "."))
        XCTAssertEqual(PlaybackRateButton.display(2), "2×")
        XCTAssertEqual(PlaybackRateButton.accessibleName(2), "Playback speed, 2 times")
        XCTAssertEqual(PlaybackRateButton.accessibleName(1), "Playback speed, 1 time")
        XCTAssertTrue(PlaybackRateButton.accessibleName(1.5).hasPrefix("Playback speed, 1"))
    }

    // MARK: AudioWaveform

    func testBarsBucketByMaxNormalizeToOneAndKeepTheFloor() {
        XCTAssertEqual(AudioWaveform.waveformBars([0.1, 0.5, 0.2, 1], count: 2), [0.5, 1])
        let bars = AudioWaveform.waveformBars([0, 0.2, 0.4], count: 3)
        XCTAssertEqual(bars[2], 1)
        XCTAssertEqual(bars[0], AudioWaveform.floor)
        XCTAssertTrue(bars.allSatisfy { $0 >= AudioWaveform.floor && $0 <= 1 })
    }

    func testBarEdgesEmptySilentFewPeaksBadValuesZeroCount() {
        XCTAssertEqual(AudioWaveform.waveformBars([], count: 4), [0.08, 0.08, 0.08, 0.08])
        XCTAssertEqual(AudioWaveform.waveformBars([0, 0], count: 3), [0.08, 0.08, 0.08])
        XCTAssertEqual(AudioWaveform.waveformBars([0.3, 0.9], count: 6).count, 6)
        XCTAssertTrue(AudioWaveform.waveformBars([.nan, 1, -1], count: 3).allSatisfy { $0.isFinite && $0 > 0 })
        XCTAssertEqual(AudioWaveform.waveformBars([1], count: 0), [])
        XCTAssertEqual(AudioWaveform.waveformBars([1], count: -3), [])
    }

    func testWaveformBarsAndFitCountRespectTheSharedAllocationLimit() {
        XCTAssertEqual(AudioWaveform.waveformBars([], count: 50_000).count, 128)
        XCTAssertLessThanOrEqual(AudioWaveform.fitCount(width: 1_000_000_000_000, metrics: ComponentMetrics()), 128)
    }

    func testSeekFromPointerMapsAndClamps() {
        XCTAssertEqual(AudioWaveform.seekFromPointer(50, width: 100, duration: 60), 30)
        XCTAssertEqual(AudioWaveform.seekFromPointer(-20, width: 100, duration: 60), 0)
        XCTAssertEqual(AudioWaveform.seekFromPointer(500, width: 100, duration: 60), 60)
        XCTAssertEqual(AudioWaveform.seekFromPointer(10, width: 0, duration: 60), 0)
        XCTAssertEqual(AudioWaveform.seekFromPointer(10, width: 100, duration: .nan), 0)
        XCTAssertEqual(AudioWaveform.seekFromPointer(10, width: 100, duration: 0), 0)
    }

    func testKeyStepMapArrowsFivePagesTenPercentEndsClampedOthersNil() {
        let step = AudioWaveform.waveformKeyStep
        XCTAssertEqual(step("ArrowRight", 10, 63), 15)
        XCTAssertEqual(step("ArrowUp", 10, 63), 15)
        XCTAssertEqual(step("ArrowLeft", 10, 63), 5)
        XCTAssertEqual(step("ArrowDown", 2, 63), 0)
        XCTAssertEqual(step("ArrowRight", 61, 63), 63)
        XCTAssertEqual(step("PageUp", 10, 100), 20)
        XCTAssertEqual(step("PageDown", 5, 100), 0)
        XCTAssertEqual(step("Home", 40, 100), 0)
        XCTAssertEqual(step("End", 40, 100), 100)
        XCTAssertNil(step("a", 40, 100))
        XCTAssertNil(step(" ", 40, 100))
    }

    func testSeekTextIsSpoken() {
        XCTAssertEqual(AudioWaveform.seekText(current: 12, duration: 63), "12 seconds of 1 minute 3 seconds")
    }

    // MARK: AudioPlayer state machine and coordinator

    func testEveryTransitionOfTheStateMachine() {
        let step = AudioPlaybackModel.step
        XCTAssertEqual(step(.loading, .loadedMetadata), .ready)
        XCTAssertEqual(step(.loading, .play), .playing)
        XCTAssertEqual(step(.loading, .error), .error)
        XCTAssertEqual(step(.ready, .play), .playing)
        XCTAssertEqual(step(.ready, .loadedMetadata), .ready)
        XCTAssertEqual(step(.playing, .pause), .ready)
        XCTAssertEqual(step(.playing, .loadedMetadata), .playing)
        XCTAssertEqual(step(.playing, .ended), .ended)
        XCTAssertEqual(step(.playing, .error), .error)
        XCTAssertEqual(step(.ended, .play), .playing)
        XCTAssertEqual(step(.ended, .pause), .ended)
        XCTAssertEqual(step(.ready, .pause), .ready)
    }

    func testPauseThenEndedLandsOnEndedErrorIsStickyUntilRetry() {
        let step = AudioPlaybackModel.step
        XCTAssertEqual(step(step(.playing, .pause), .ended), .ended)
        for event in [AudioPlaybackEvent.loadedMetadata, .play, .pause, .ended] {
            XCTAssertEqual(step(.error, event), .error)
        }
        XCTAssertEqual(step(.error, .retry), .loading)
        XCTAssertEqual(step(.playing, .retry), .playing)
        XCTAssertEqual(step(step(.error, .retry), .loadedMetadata), .ready)
    }

    @MainActor
    func testStartingOnePlayerPausesThePreviousOnly() {
        let coordinator = AudioPlaybackCoordinator()
        let a = FakePlayer(), b = FakePlayer()
        coordinator.claim(a)
        coordinator.claim(a)
        XCTAssertEqual(a.pauses, 0)
        coordinator.claim(b)
        XCTAssertEqual(a.pauses, 1)
        XCTAssertEqual(b.pauses, 0)
        coordinator.release(b)
        coordinator.claim(a)
        XCTAssertEqual(b.pauses, 0, "a released player is not paused again")
    }

    @MainActor
    func testModelsSharingACoordinatorPlayOneAtATime() {
        let coordinator = AudioPlaybackCoordinator()
        let a = AudioPlaybackModel(simulatedDuration: 30, coordinator: coordinator)
        let b = AudioPlaybackModel(simulatedDuration: 30, coordinator: coordinator)
        a.play()
        XCTAssertEqual(a.state, .playing)
        b.play()
        XCTAssertEqual(b.state, .playing)
        XCTAssertEqual(a.state, .ready, "the first clip pauses when the second starts")
        a.teardown(); b.teardown()
    }

    @MainActor
    func testModelSeekClampsAndEndedPlaysFromTheStart() {
        let model = AudioPlaybackModel(simulatedDuration: 10, coordinator: AudioPlaybackCoordinator())
        model.seek(to: 99)
        XCTAssertEqual(model.currentTime, 10)
        model.seek(to: -5)
        XCTAssertEqual(model.currentTime, 0)
        model.seek(to: .nan)
        XCTAssertEqual(model.currentTime, 0)
        let ended = AudioPlaybackModel(simulatedDuration: 10, state: .ended, currentTime: 10, coordinator: AudioPlaybackCoordinator())
        ended.play()
        XCTAssertEqual(ended.state, .playing)
        XCTAssertEqual(ended.currentTime, 0)
        ended.teardown(); model.teardown()
    }

    @MainActor
    func testRateRejectsNonsenseAndErrorBlocksPlayUntilRetry() {
        let model = AudioPlaybackModel(simulatedDuration: 10, state: .error, coordinator: AudioPlaybackCoordinator())
        model.play()
        XCTAssertEqual(model.state, .error)
        model.setRate(.nan); model.setRate(0); model.setRate(-1)
        XCTAssertEqual(model.rate, 1)
        model.setRate(1.5)
        XCTAssertEqual(model.rate, 1.5)
        model.retry()
        XCTAssertEqual(model.state, .ready)
        model.teardown()
    }

    @MainActor
    func testCallbacksFireOnPlayAndPause() {
        let model = AudioPlaybackModel(simulatedDuration: 10, coordinator: AudioPlaybackCoordinator())
        var log: [String] = []
        model.onPlay = { log.append("play") }
        model.onPause = { log.append("pause") }
        model.play(); model.pause()
        XCTAssertEqual(log, ["play", "pause"])
        model.teardown()
    }

    @MainActor
    func testRemoteModelStartsLoadingAndTearsDownTwiceWithoutHarm() {
        let model = AudioPlaybackModel(url: URL(string: "https://example.invalid/clip.m4a")!, duration: 63, coordinator: AudioPlaybackCoordinator())
        XCTAssertEqual(model.duration, 63)
        XCTAssertEqual(model.currentTime, 0)
        model.teardown()
        model.teardown()
    }

    @MainActor
    func testEngineReleasesItsSessionOnQuietPathsWithoutDeactivatingANewerPlayer() {
        let manager = FakeAudioSessionManager()
        let coordinator = AudioPlaybackCoordinator()
        let first = AudioPlaybackModel(url: URL(fileURLWithPath: "/dev/null"), coordinator: coordinator,
                                       sessionManager: manager)
        let second = AudioPlaybackModel(url: URL(fileURLWithPath: "/dev/null"), coordinator: coordinator,
                                        sessionManager: manager)

        first.play()
        let firstOwner = manager.activeOwner
        second.play()
        let secondOwner = manager.activeOwner
        XCTAssertNotEqual(firstOwner, secondOwner)
        XCTAssertEqual(manager.deactivationCount, 1, "claiming the second player quiets the first")

        first.engineFailed()
        XCTAssertEqual(manager.activeOwner, secondOwner, "a late old-player callback cannot quiet the current player")
        XCTAssertEqual(manager.deactivationCount, 1)

        second.pause()
        XCTAssertNil(manager.activeOwner)
        XCTAssertEqual(manager.deactivationCount, 2)
        second.play()
        second.engineEnded()
        XCTAssertNil(manager.activeOwner)
        XCTAssertEqual(manager.deactivationCount, 3)
        second.play()
        second.engineFailed()
        XCTAssertNil(manager.activeOwner)
        XCTAssertEqual(manager.deactivationCount, 4)
        second.retry()
        second.play()
        second.teardown()
        XCTAssertNil(manager.activeOwner)
        XCTAssertEqual(manager.deactivationCount, 5)
        second.teardown()
        XCTAssertEqual(manager.deactivationCount, 5, "teardown is idempotent")
        first.teardown()
    }

    @MainActor
    func testLateCallbackFromBeforeRetryCannotDeactivateTheRetriedEngine() throws {
        let manager = FakeAudioSessionManager()
        let model = AudioPlaybackModel(url: URL(fileURLWithPath: "/dev/null"), coordinator: AudioPlaybackCoordinator(),
                                       sessionManager: manager)
        model.play()
        let firstOwner = try XCTUnwrap(manager.activeOwner)
        model.engineFailed()
        model.retry()
        model.play()
        let retriedOwner = manager.activeOwner
        XCTAssertNotEqual(firstOwner, retriedOwner)

        model.engineFailed(owner: firstOwner)
        XCTAssertEqual(manager.activeOwner, retriedOwner)
        XCTAssertEqual(manager.deactivationCount, 1, "a stale failure belongs to the torn-down engine")
        model.teardown()
        XCTAssertNil(manager.activeOwner)
        XCTAssertEqual(manager.deactivationCount, 2)
    }

    @MainActor
    func testSessionActivationFailureDoesNotStartPlaybackAndCanBeRetried() {
        let manager = FakeAudioSessionManager()
        let model = AudioPlaybackModel(url: URL(fileURLWithPath: "/dev/null"),
                                       coordinator: AudioPlaybackCoordinator(), sessionManager: manager)
        var playCallbacks = 0
        model.onPlay = { playCallbacks += 1 }
        manager.failNextActivation()

        model.play()

        XCTAssertEqual(model.state, .error, "an activation failure is visible as the existing recoverable error state")
        XCTAssertEqual(playCallbacks, 0, "the play callback must not fire when no audio session was acquired")
        XCTAssertNil(manager.activeOwner)

        model.retry()
        model.play()
        XCTAssertEqual(model.state, .playing)
        XCTAssertEqual(playCallbacks, 1)
        model.teardown()
    }

    func testPlaybackAndRecordingLeasesRestoreTheRemainingCategoryInEitherOrder() throws {
        for recordingFirst in [false, true] {
            let backend = FakeSystemAudioSessionBackend()
            let manager = SystemAudioSessionManager(backend: backend)
            let playbackOwner = UUID()
            let recordingOwner = UUID()

            if recordingFirst {
                try manager.activate(.recording, owner: recordingOwner)
                try manager.activate(.playback, owner: playbackOwner)
                try manager.deactivate(owner: recordingOwner)
                XCTAssertEqual(backend.categories, [.playAndRecord, .playback])
            } else {
                try manager.activate(.playback, owner: playbackOwner)
                try manager.activate(.recording, owner: recordingOwner)
                try manager.deactivate(owner: recordingOwner)
                XCTAssertEqual(backend.categories, [.playback, .playAndRecord, .playback])
            }

            XCTAssertTrue(backend.isActive, "ending one use must not deactivate the other")
            try manager.deactivate(owner: playbackOwner)
            XCTAssertEqual(backend.activeValues, [true, false], "only the final lease deactivates the session")
            XCTAssertFalse(backend.isActive)
        }
    }

    func testConcurrentSessionOwnersStayActiveUntilTheLastLeaseEnds() throws {
        let backend = FakeSystemAudioSessionBackend()
        let manager = SystemAudioSessionManager(backend: backend)
        let owners = (0..<512).map { _ in UUID() }
        let failuresLock = NSLock()
        var failures = 0

        DispatchQueue.concurrentPerform(iterations: owners.count) { index in
            do { try manager.activate(.playback, owner: owners[index]) }
            catch { failuresLock.lock(); failures += 1; failuresLock.unlock() }
        }
        XCTAssertEqual(failures, 0)
        XCTAssertEqual(backend.activeValues, [true], "simultaneous owners share one activation")

        DispatchQueue.concurrentPerform(iterations: owners.count - 1) { index in
            do { try manager.deactivate(owner: owners[index]) }
            catch { failuresLock.lock(); failures += 1; failuresLock.unlock() }
        }
        XCTAssertEqual(failures, 0)
        XCTAssertTrue(backend.isActive, "one remaining owner keeps the session active")
        try manager.deactivate(owner: owners[owners.count - 1])
        XCTAssertEqual(backend.activeValues, [true, false])
        XCTAssertFalse(backend.isActive)
    }

    @MainActor
    func testPauseReleaseFailureIsRepairedByTheManagerAfterPlayerTeardown() {
        let backend = FakeSystemAudioSessionBackend()
        let scheduler = ManualAudioSessionRetryScheduler()
        let manager = SystemAudioSessionManager(backend: backend, retryScheduler: scheduler)
        let model = AudioPlaybackModel(url: URL(fileURLWithPath: "/dev/null"),
                                       coordinator: AudioPlaybackCoordinator(), sessionManager: manager)
        model.play()
        XCTAssertEqual(model.state, .playing)
        backend.failNextDeactivation()

        model.pause()
        XCTAssertEqual(model.state, .ready, "a failed release does not trap the player in playing")
        XCTAssertTrue(backend.isActive)
        model.teardown()

        XCTAssertEqual(scheduler.pendingCount, 1, "tearing down the player keeps the manager's repair")
        XCTAssertTrue(scheduler.runNext())
        XCTAssertFalse(backend.isActive)
        XCTAssertEqual(backend.activeValues, [true, false, false])
        XCTAssertEqual(manager.reconciliationStatus, .ready)
    }

    @MainActor
    func testFinalTeardownReleaseFailureIsRepairedAfterThePlayerIsGone() {
        let backend = FakeSystemAudioSessionBackend()
        let scheduler = ManualAudioSessionRetryScheduler()
        let manager = SystemAudioSessionManager(backend: backend, retryScheduler: scheduler)
        var model: AudioPlaybackModel? = AudioPlaybackModel(url: URL(fileURLWithPath: "/dev/null"),
                                                            coordinator: AudioPlaybackCoordinator(), sessionManager: manager)
        model?.play()
        backend.failDeactivations(2)

        model?.teardown()
        model = nil

        XCTAssertTrue(scheduler.runNext())
        XCTAssertTrue(scheduler.runNext())
        XCTAssertFalse(backend.isActive, "the manager releases audio after the player is gone")
        XCTAssertEqual(backend.deactivationAttempts, 3, "the original attempt plus two bounded retries")
        XCTAssertEqual(manager.reconciliationStatus, .ready)
        XCTAssertEqual(scheduler.pendingCount, 0)
    }

    func testPlaybackCanEndBeforeRecordingWithoutDeactivatingTheSession() throws {
        let backend = FakeSystemAudioSessionBackend()
        let manager = SystemAudioSessionManager(backend: backend)
        let playbackOwner = UUID()
        let recordingOwner = UUID()
        try manager.activate(.recording, owner: recordingOwner)
        try manager.activate(.playback, owner: playbackOwner)

        try manager.deactivate(owner: playbackOwner)

        XCTAssertTrue(backend.isActive)
        XCTAssertEqual(backend.categories, [.playAndRecord])
        XCTAssertEqual(backend.activeValues, [true])
        try manager.deactivate(owner: recordingOwner)
        XCTAssertFalse(backend.isActive)
        XCTAssertEqual(backend.activeValues, [true, false])
    }

    func testFailedRecordingCategoryChangeLeavesPlaybackLeaseActive() throws {
        let backend = FakeSystemAudioSessionBackend()
        let manager = SystemAudioSessionManager(backend: backend)
        let playbackOwner = UUID()
        let recordingOwner = UUID()
        try manager.activate(.playback, owner: playbackOwner)
        backend.failNextCategoryChange()

        XCTAssertThrowsError(try manager.activate(.recording, owner: recordingOwner))
        XCTAssertEqual(backend.categories, [.playback])
        XCTAssertEqual(backend.activeValues, [true])
        XCTAssertTrue(backend.isActive)

        try manager.activate(.recording, owner: recordingOwner)
        try manager.deactivate(owner: recordingOwner)
        try manager.deactivate(owner: playbackOwner)
        XCTAssertFalse(backend.isActive)
    }

    func testFailedSessionActivationIsNotRecordedAndCanBeRetried() throws {
        let backend = FakeSystemAudioSessionBackend()
        let manager = SystemAudioSessionManager(backend: backend)
        let owner = UUID()
        backend.failNextActivation()

        XCTAssertThrowsError(try manager.activate(.playback, owner: owner))
        try manager.activate(.playback, owner: owner)

        XCTAssertEqual(backend.categories, [.playback], "a failed activation keeps the successful category configuration")
        XCTAssertEqual(backend.activeValues, [true, true])
        XCTAssertTrue(backend.isActive)
        try manager.deactivate(owner: owner)
        XCTAssertFalse(backend.isActive)
    }

    func testFailedDeactivationRetriesSuccessfullyAndPublishesReady() throws {
        let backend = FakeSystemAudioSessionBackend()
        let scheduler = ManualAudioSessionRetryScheduler()
        let manager = SystemAudioSessionManager(backend: backend, retryScheduler: scheduler)
        let owner = UUID()
        try manager.activate(.recording, owner: owner)
        backend.failNextDeactivation()

        XCTAssertThrowsError(try manager.deactivate(owner: owner))
        XCTAssertEqual(manager.reconciliationStatus, .retrying(attempt: 1, maximumAttempts: 3, message: "deactivation"))
        XCTAssertEqual(scheduler.pendingCount, 1)

        XCTAssertTrue(scheduler.runNext())
        XCTAssertEqual(backend.activeValues, [true, false, false])
        XCTAssertFalse(backend.isActive)
        XCTAssertEqual(manager.reconciliationStatus, .ready)
        XCTAssertEqual(scheduler.pendingCount, 0)
    }

    func testRetryQueueIsSingleFlightAndGenerationChangeCancelsStaleTicket() throws {
        let backend = FakeSystemAudioSessionBackend()
        let scheduler = ManualAudioSessionRetryScheduler()
        let manager = SystemAudioSessionManager(backend: backend, retryScheduler: scheduler)
        let playbackOwner = UUID()
        let recordingOwner = UUID()
        try manager.activate(.playback, owner: playbackOwner)
        try manager.activate(.recording, owner: recordingOwner)
        backend.failCategoryChanges(2)

        XCTAssertThrowsError(try manager.deactivate(owner: recordingOwner))
        XCTAssertEqual(scheduler.pendingCount, 1)
        XCTAssertTrue(scheduler.runNext(), "the first repair attempt runs")
        XCTAssertEqual(scheduler.pendingCount, 1, "a failed repair replaces its consumed ticket with one live ticket")

        let replacementRecordingOwner = UUID()
        try manager.activate(.recording, owner: replacementRecordingOwner)
        XCTAssertEqual(scheduler.pendingCount, 0, "a new lease generation cancels the old category repair")
        backend.failNextCategoryChange()
        XCTAssertThrowsError(try manager.deactivate(owner: replacementRecordingOwner))
        XCTAssertEqual(scheduler.pendingCount, 1, "a new failure creates only one live ticket")

        XCTAssertTrue(scheduler.deliverNextCancelledTicket(), "a queued stale delivery can arrive after cancellation")
        XCTAssertEqual(manager.reconciliationStatus, .retrying(attempt: 1, maximumAttempts: 3, message: "category"))
        XCTAssertEqual(backend.categories, [.playback, .playAndRecord], "the cancelled callback has no backend effect")
        XCTAssertEqual(scheduler.pendingCount, 1)

        XCTAssertTrue(scheduler.runNext())
        XCTAssertEqual(backend.categories, [.playback, .playAndRecord, .playback])
        XCTAssertEqual(manager.reconciliationStatus, .ready)
        XCTAssertEqual(scheduler.pendingCount, 0)
        XCTAssertEqual(backend.activeValues, [true], "repairing the category for remaining playback never deactivates it")
        try manager.deactivate(owner: playbackOwner)
    }

    func testAlreadyDequeuedStaleRetryCannotTouchANewerLease() throws {
        let backend = FakeSystemAudioSessionBackend()
        let scheduler = ManualAudioSessionRetryScheduler()
        let manager = SystemAudioSessionManager(backend: backend, retryScheduler: scheduler)
        let recordingOwner = UUID()
        try manager.activate(.recording, owner: recordingOwner)
        backend.failNextDeactivation()
        XCTAssertThrowsError(try manager.deactivate(owner: recordingOwner))
        let staleCallback = try XCTUnwrap(scheduler.takeNextOperation())

        let playbackOwner = UUID()
        try manager.activate(.playback, owner: playbackOwner)
        let activeValues = backend.activeValues
        let categories = backend.categories
        staleCallback()

        XCTAssertEqual(backend.activeValues, activeValues)
        XCTAssertEqual(backend.categories, categories)
        XCTAssertTrue(backend.isActive)
        XCTAssertEqual(manager.reconciliationStatus, .ready)
        try manager.deactivate(owner: playbackOwner)
    }

    func testExhaustedRetriesPublishFailureAndStopScheduling() throws {
        let backend = FakeSystemAudioSessionBackend()
        let scheduler = ManualAudioSessionRetryScheduler()
        let manager = SystemAudioSessionManager(backend: backend, retryScheduler: scheduler)
        let recordingOwner = UUID()
        let playbackOwner = UUID()
        try manager.activate(.recording, owner: recordingOwner)
        backend.failDeactivations(4)

        XCTAssertThrowsError(try manager.deactivate(owner: recordingOwner))
        XCTAssertEqual(manager.reconciliationStatus, .retrying(attempt: 1, maximumAttempts: 3, message: "deactivation"))
        for _ in 0..<3 { XCTAssertTrue(scheduler.runNext()) }

        XCTAssertEqual(backend.deactivationAttempts, 4, "one original attempt plus three bounded retries")
        XCTAssertEqual(scheduler.pendingCount, 0)
        XCTAssertEqual(manager.reconciliationStatus, .failed(attempts: 4, message: "deactivation"))
        XCTAssertTrue(backend.isActive, "the failed system operation is reported separately from logical leases")

        try manager.activate(.playback, owner: playbackOwner)
        XCTAssertEqual(backend.categories.last, .playback, "an ended recording lease cannot pin playAndRecord")
        XCTAssertEqual(manager.reconciliationStatus, .ready)
        try manager.deactivate(owner: playbackOwner)
        XCTAssertFalse(backend.isActive)
    }

    func testRetryTicketRetainsManagerUntilCompletionThenReleasesIt() throws {
        let backend = FakeSystemAudioSessionBackend()
        let scheduler = ManualAudioSessionRetryScheduler()
        var manager: SystemAudioSessionManager? = SystemAudioSessionManager(backend: backend, retryScheduler: scheduler)
        let weakManager = WeakAudioSessionManager()
        weakManager.value = manager
        let owner = UUID()
        try XCTUnwrap(manager).activate(.playback, owner: owner)
        backend.failNextDeactivation()

        XCTAssertThrowsError(try XCTUnwrap(manager).deactivate(owner: owner))
        manager = nil
        XCTAssertNotNil(weakManager.value, "a live bounded retry retains its manager")

        XCTAssertTrue(scheduler.runNext())
        XCTAssertFalse(backend.isActive)
        XCTAssertNil(weakManager.value, "a completed ticket releases the manager")
    }

    func testManagerOwnsTicketEvenWhenSchedulerDoesNotRetainItsReturnValue() throws {
        let backend = FakeSystemAudioSessionBackend()
        let scheduler = WeaklyRetainingAudioSessionRetryScheduler()
        let manager = SystemAudioSessionManager(backend: backend, retryScheduler: scheduler)
        let recordingOwner = UUID()
        try manager.activate(.recording, owner: recordingOwner)
        backend.failNextDeactivation()

        XCTAssertThrowsError(try manager.deactivate(owner: recordingOwner))
        XCTAssertNotNil(scheduler.ticket, "the manager must keep its live cancellation ticket")

        try manager.activate(.playback, owner: UUID())

        XCTAssertNil(scheduler.ticket, "generation change cancels and releases the manager-owned ticket")
        XCTAssertEqual(manager.reconciliationStatus, .ready)
    }

    func testImmediateRetryCompletionIsNotStoredAsALiveTicket() throws {
        let backend = FakeSystemAudioSessionBackend()
        let manager = SystemAudioSessionManager(backend: backend, retryScheduler: ImmediateAudioSessionRetryScheduler())
        let owner = UUID()
        try manager.activate(.recording, owner: owner)
        backend.failNextDeactivation()

        XCTAssertThrowsError(try manager.deactivate(owner: owner))

        XCTAssertEqual(backend.activeValues, [true, false, false])
        XCTAssertFalse(backend.isActive)
        XCTAssertEqual(manager.reconciliationStatus, .ready)
    }

    func testCancellationReleasesManagerEvenIfSchedulerRetainsStaleTicket() throws {
        let backend = FakeSystemAudioSessionBackend()
        let scheduler = ManualAudioSessionRetryScheduler()
        var manager: SystemAudioSessionManager? = SystemAudioSessionManager(backend: backend, retryScheduler: scheduler)
        let weakManager = WeakAudioSessionManager()
        weakManager.value = manager
        let owner = UUID()
        try XCTUnwrap(manager).activate(.recording, owner: owner)
        backend.failNextDeactivation()

        XCTAssertThrowsError(try XCTUnwrap(manager).deactivate(owner: owner))
        try XCTUnwrap(manager).activate(.playback, owner: UUID())
        XCTAssertEqual(scheduler.pendingCount, 0)
        manager = nil

        XCTAssertNil(weakManager.value, "cancelling a stale ticket breaks its manager retention")
        XCTAssertTrue(scheduler.deliverNextCancelledTicket())
        XCTAssertTrue(backend.isActive)
        XCTAssertEqual(backend.activeValues, [true, false])
    }

    func testPublicAudioSessionStatusCenterExposesSharedState() {
        XCTAssertEqual(AudioSessionStatusCenter.current, .ready)
    }

    // MARK: AudioTranscript

    private let words = [AudioTranscript.Word("Hello", start: 1, end: 1.5), .init("there,", start: 1.6, end: 2), .init("friend.", start: 3, end: 3.6)]

    func testActiveWordBeforeFirstGapsBoundariesAndEnd() {
        let at = { AudioTranscript.activeWordIndex(self.words, at: $0) }
        XCTAssertEqual(at(0), -1)
        XCTAssertEqual(at(0.99), -1)
        XCTAssertEqual(at(1), 0)
        XCTAssertEqual(at(1.55), 0)
        XCTAssertEqual(at(1.6), 1)
        XCTAssertEqual(at(2.5), 1)
        XCTAssertEqual(at(3), 2)
        XCTAssertEqual(at(99), 2)
        XCTAssertEqual(AudioTranscript.activeWordIndex([], at: 5), -1)
        XCTAssertEqual(at(.nan), -1)
    }

    func testActiveWordScalesToLongTranscripts() {
        let long = (0..<5000).map { AudioTranscript.Word("w", start: Double($0), end: Double($0) + 0.9) }
        XCTAssertEqual(AudioTranscript.activeWordIndex(long, at: 2500.4), 2500)
        XCTAssertEqual(AudioTranscript.activeWordIndex(long, at: 4999.99), 4999)
    }

    func testKeyStepMovesTheMarkerAndClamps() {
        let step = AudioTranscript.transcriptKeyStep
        XCTAssertEqual(step("ArrowRight", 0, 3), 1)
        XCTAssertEqual(step("ArrowRight", 2, 3), 2)
        XCTAssertEqual(step("ArrowLeft", 0, 3), 0)
        XCTAssertEqual(step("ArrowLeft", 2, 3), 1)
        XCTAssertEqual(step("Home", 2, 3), 0)
        XCTAssertEqual(step("End", 0, 3), 2)
        XCTAssertNil(step("x", 0, 3))
        XCTAssertNil(step("ArrowRight", 0, 0))
    }

    func testAutoScrollYieldsToTheReaderForFourSecondsAndOnlyWhenOutOfView() {
        XCTAssertTrue(AudioTranscript.shouldAutoScroll(now: 10, lastUserScroll: nil))
        XCTAssertFalse(AudioTranscript.shouldAutoScroll(now: 10, lastUserScroll: 7))
        XCTAssertTrue(AudioTranscript.shouldAutoScroll(now: 10, lastUserScroll: 6))
        XCTAssertNil(AudioTranscript.transcriptScrollTop(wordTop: 100, wordHeight: 20, viewHeight: 200, scrollTop: 0))
        XCTAssertEqual(AudioTranscript.transcriptScrollTop(wordTop: 500, wordHeight: 20, viewHeight: 200, scrollTop: 0), 410)
        XCTAssertEqual(AudioTranscript.transcriptScrollTop(wordTop: 10, wordHeight: 20, viewHeight: 200, scrollTop: 300), 0)
    }

    // MARK: Rendering

    @MainActor
    func testEveryComponentRendersAtPhoneWidthInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let model = AudioPlaybackModel(simulatedDuration: 63, currentTime: 20, coordinator: AudioPlaybackCoordinator())
            let failed = AudioPlaybackModel(simulatedDuration: 63, state: .error, coordinator: AudioPlaybackCoordinator())
            let peaks = (0..<80).map { abs(sin(Double($0) / 5)) }
            let view = VStack(alignment: .leading, spacing: 16) {
                AudioTime(current: 12, duration: 63)
                HStack { AudioPlayButton(playing: false, label: "Note") {}; AudioPlayButton(playing: true, label: "Note") {}; AudioPlayButton(playing: false, loading: true, label: "Note") {} }
                AudioWaveform(peaks: peaks, duration: 63, current: 20, label: "Note") { _ in }
                AudioWaveform(peaks: peaks, duration: 63, current: 20, label: "Note")
                PlaybackRateButton(rate: 1.5) { _ in }
                AudioPlayer(model: model, label: "Voice note", peaks: peaks)
                AudioPlayer(model: model, label: "Voice note", variant: .full)
                AudioPlayer(model: failed, label: "Voice note")
                AudioTranscript(words: words, current: 1.7, label: "Transcript", scrolls: false) { _ in }
            }
            .padding()
            .environment(\.colorScheme, scheme)
            .frame(width: 390)
            let renderer = ImageRenderer(content: view)
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage)
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 600)
            try AtomTests.save(image, name: "audio-playback-\(scheme)")
            model.teardown(); failed.teardown()
        }
    }
}
