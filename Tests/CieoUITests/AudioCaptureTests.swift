@testable import CieoUI
import SwiftUI
import XCTest

typealias Recorder = VoiceRecorderModel

private final class ManualRecorderClock: @unchecked Sendable {
    private let lock = NSLock()
    private var value: TimeInterval

    init(_ value: TimeInterval = 0) { self.value = value }

    func now() -> TimeInterval {
        lock.lock(); defer { lock.unlock() }
        return value
    }

    func advance(by seconds: TimeInterval) {
        lock.lock(); defer { lock.unlock() }
        value += seconds
    }
}

private struct FakeRecorderFinishReceipt: Sendable {
    let successfully: Bool
    let finishedAt: TimeInterval
}

private final class FakeRecorderFinishReceiptStore: @unchecked Sendable {
    private let lock = NSLock()
    private var pending: FakeRecorderFinishReceipt?

    func store(_ receipt: FakeRecorderFinishReceipt) {
        lock.lock(); defer { lock.unlock() }
        if pending == nil { pending = receipt }
    }

    func take() -> FakeRecorderFinishReceipt? {
        lock.lock(); defer { lock.unlock() }
        defer { pending = nil }
        return pending
    }
}

@MainActor
private final class FakeVoiceRecorder: VoiceRecorderDevice {
    var isRecording = false
    var currentTime: TimeInterval = 4.2
    var averagePower: Float = -30
    var isMeteringEnabled = false
    var recordSucceeds = true
    var requestedDurations: [TimeInterval] = []
    var fileURL: URL?
    var stopCount = 0
    var meterUpdateCount = 0
    private var errorHandler: (@MainActor () -> Void)?
    private var delayedErrorHandler: (@MainActor () -> Void)?
    private var finishHandler: (@MainActor (Bool, TimeInterval) -> Void)?
    private var delayedFinishHandler: (@MainActor (Bool, TimeInterval) -> Void)?
    nonisolated private let pendingFinish = FakeRecorderFinishReceiptStore()

    var onFinished: (@MainActor (Bool, TimeInterval) -> Void)? {
        get { finishHandler }
        set {
            finishHandler = newValue
            if let newValue { delayedFinishHandler = newValue }
        }
    }

    var onEncodingError: (@MainActor () -> Void)? {
        get { errorHandler }
        set {
            errorHandler = newValue
            if let newValue { delayedErrorHandler = newValue }
        }
    }

    nonisolated func takePendingFinish() -> VoiceRecorderFinishReceipt? {
        guard let receipt = pendingFinish.take() else { return nil }
        return VoiceRecorderFinishReceipt(successfully: receipt.successfully, finishedAt: receipt.finishedAt)
    }

    func prepareToRecord() -> Bool { true }
    func record(forDuration seconds: TimeInterval) -> Bool {
        requestedDurations.append(seconds)
        isRecording = recordSucceeds
        return recordSucceeds
    }
    func pause() { isRecording = false }
    func stop() { stopCount += 1; isRecording = false }
    func updateMeters() { meterUpdateCount += 1 }
    func simulateUnexpectedStop() { isRecording = false }
    func emitEncodingError() { errorHandler?() }
    func emitLateEncodingError() { delayedErrorHandler?() }
    func emitFinished(successfully: Bool, at time: TimeInterval = 0) { finishHandler?(successfully, time) }
    func emitLateFinish(successfully: Bool, at time: TimeInterval = 0) { delayedFinishHandler?(successfully, time) }
    func captureFinishReceipt(successfully: Bool, at time: TimeInterval) {
        pendingFinish.store(.init(successfully: successfully, finishedAt: time))
    }
    func deliverPendingFinish() {
        guard let receipt = takePendingFinish() else { return }
        finishHandler?(receipt.successfully, receipt.finishedAt)
    }
}

private final class FakeCaptureSessionManager: AudioSessionManaging, @unchecked Sendable {
    private let lock = NSLock()
    private var owner: UUID?
    private var deactivations = 0

    var reconciliationStatus: AudioSessionReconciliationStatus { .ready }

    var activeOwner: UUID? {
        lock.lock(); defer { lock.unlock() }
        return owner
    }

    var deactivationCount: Int {
        lock.lock(); defer { lock.unlock() }
        return deactivations
    }

    func activate(_ use: AudioSessionUse, owner: UUID) throws {
        lock.lock(); defer { lock.unlock() }
        self.owner = owner
    }

    func deactivate(owner: UUID) throws {
        lock.lock(); defer { lock.unlock() }
        guard self.owner == owner else { return }
        self.owner = nil
        deactivations += 1
    }
}

private enum FakeCaptureSessionFailure: Error { case deactivation }

private final class FakeRecorderSessionBackend: AudioSessionBackend, @unchecked Sendable {
    private let lock = NSLock()
    private var active = false
    private var activeChanges: [Bool] = []
    private var deactivationFailuresRemaining = 0

    var isActive: Bool {
        lock.lock(); defer { lock.unlock() }
        return active
    }

    var deactivationAttempts: Int {
        lock.lock(); defer { lock.unlock() }
        return activeChanges.filter { !$0 }.count
    }

    func failDeactivations(_ count: Int) {
        lock.lock(); defer { lock.unlock() }
        deactivationFailuresRemaining += max(0, count)
    }

    func setCategory(_ category: AudioSessionCategory) throws {}

    func setActive(_ active: Bool) throws {
        lock.lock(); defer { lock.unlock() }
        activeChanges.append(active)
        if !active, deactivationFailuresRemaining > 0 {
            deactivationFailuresRemaining -= 1
            throw FakeCaptureSessionFailure.deactivation
        }
        self.active = active
    }
}

@MainActor
private final class WeakRecorderHolder {
    weak var value: Recorder?
}

private final class LockedRecorderReference: @unchecked Sendable {
    private let lock = NSLock()
    private var value: Recorder?

    @MainActor
    func hold(_ model: Recorder) {
        lock.lock(); defer { lock.unlock() }
        value = model
    }

    func release() {
        lock.lock(); defer { lock.unlock() }
        value = nil
    }
}

final class AudioCaptureTests: XCTestCase {
    private func run(_ events: [Recorder.Event], from state: Recorder.RecorderState = Recorder.idle) -> Recorder.RecorderState {
        events.reduce(state) { Recorder.step($0, $1) }
    }

    // MARK: AudioLevelMeter

    func testRmsLevelMapsLoudnessOnADecibelScale() {
        XCTAssertEqual(AudioLevelMeter.rmsLevel([Float]()), 0)
        XCTAssertEqual(AudioLevelMeter.rmsLevel([0, 0, 0] as [Double]), 0)
        XCTAssertEqual(AudioLevelMeter.rmsLevel([1, -1, 1, -1] as [Double]), 1)
        XCTAssertEqual(AudioLevelMeter.rmsLevel([5, -5] as [Double]), 1, "clamps above 0 dB")
        XCTAssertEqual(AudioLevelMeter.rmsLevel([0.001, -0.001] as [Double]), 0, accuracy: 1e-9)
        XCTAssertEqual(AudioLevelMeter.rmsLevel([0.1, -0.1] as [Double]), 2.0 / 3, accuracy: 1e-9)
        XCTAssertEqual(AudioLevelMeter.rmsLevel([0.0001] as [Double]), 0, "below the floor clamps to 0")
        let junk = AudioLevelMeter.rmsLevel([Double.nan, 0.5])
        XCTAssertTrue(junk > 0 && junk.isFinite, "NaN samples do not poison the result")
        XCTAssertGreaterThan(AudioLevelMeter.rmsLevel([0.5, -0.5] as [Float]), AudioLevelMeter.rmsLevel([0.05, -0.05] as [Float]))
    }

    func testDecibelReadingsShareTheSameFloor() {
        XCTAssertEqual(AudioLevelMeter.decibelsLevel(0), 1)
        XCTAssertEqual(AudioLevelMeter.decibelsLevel(-60), 0)
        XCTAssertEqual(AudioLevelMeter.decibelsLevel(-160), 0)
        XCTAssertEqual(AudioLevelMeter.decibelsLevel(-30), 0.5, accuracy: 1e-9)
        XCTAssertEqual(AudioLevelMeter.decibelsLevel(.nan), 0)
        XCTAssertEqual(AudioLevelMeter.decibelsLevel(12), 1)
    }

    func testLevelBarsRiseInTheMiddleAndStayBounded() {
        let b = AudioLevelMeter.levelBars(1, count: 5)
        XCTAssertEqual(b.count, 5)
        XCTAssertEqual(b[2], 1)
        XCTAssertTrue(b[2] > b[1] && b[1] > b[0])
        XCTAssertEqual(b[0], b[4], "symmetric")
        for v in AudioLevelMeter.levelBars(0, count: 5) { XCTAssertEqual(v, 0.1, "silence keeps a stub") }
        XCTAssertTrue(AudioLevelMeter.levelBars(2, count: 7).allSatisfy { $0 >= 0.1 && $0 <= 1 })
        XCTAssertTrue(AudioLevelMeter.levelBars(.nan, count: 3).allSatisfy { $0 == 0.1 })
        XCTAssertEqual(AudioLevelMeter.levelBars(0.5, count: 0), [])
        XCTAssertEqual(AudioLevelMeter.levelBars(1, count: 1), [1])
        XCTAssertEqual(AudioLevelMeter.levelBars(1, count: 1_000_000).count, 32, "the public helper has the same bounded bar count as the view")
    }

    // MARK: Recorder state machine

    func testHappyPathWithPauseAndStop() {
        XCTAssertEqual(run([.start]).phase, .requesting)
        XCTAssertEqual(run([.start, .granted]).phase, .recording)
        XCTAssertEqual(run([.start, .granted, .pause]).phase, .paused)
        XCTAssertEqual(run([.start, .granted, .pause, .resume]).phase, .recording)
        XCTAssertEqual(run([.start, .granted, .stop]).phase, .done)
        XCTAssertEqual(run([.start, .granted, .pause, .stop]).phase, .done)
        XCTAssertEqual(run([.start, .granted, .limit]).phase, .done)
        XCTAssertEqual(run([.start, .granted, .tick(12.9)]).elapsed, 12)
        XCTAssertEqual(run([.start, .granted, .pause, .tick(5)]).elapsed, 0, "no ticks while paused")
        XCTAssertEqual(run([.start, .granted, .tick(.nan)]).elapsed, 0)
    }

    func testErrorsCarryAReasonAndRecover() {
        XCTAssertEqual(run([.start, .denied]), .init(phase: .error, elapsed: 0, reason: .denied))
        XCTAssertEqual(run([.unsupported]).reason, .unsupported)
        XCTAssertEqual(run([.start, .unsupported]).reason, .unsupported)
        XCTAssertEqual(run([.start, .granted, .fail]).reason, .failed)
        XCTAssertEqual(run([.start, .granted, .pause, .fail]).phase, .error)
        XCTAssertEqual(run([.fail]).phase, .idle, "fail when nothing is active is ignored")
        XCTAssertEqual(run([.start, .denied, .start]).phase, .requesting, "try again")
        XCTAssertEqual(run([.start, .denied, .reset]).phase, .idle)
        XCTAssertNil(run([.start, .denied, .start]).reason)
    }

    func testCancelFromEveryActiveStateReturnsToIdleAndNeverEmitsAClip() {
        for path: [Recorder.Event] in [[.start], [.start, .granted], [.start, .granted, .pause], [.start, .granted, .tick(9)]] {
            let before = run(path)
            let after = run([.cancel], from: before)
            XCTAssertEqual(after, Recorder.idle)
            XCTAssertFalse(Recorder.shouldEmitClip(from: before, to: after), "cancel never emits a clip")
        }
    }

    func testInvalidEventsAreIgnored() {
        XCTAssertEqual(run([.stop]).phase, .idle)
        XCTAssertEqual(run([.pause]).phase, .idle)
        XCTAssertEqual(run([.granted]).phase, .idle)
        XCTAssertEqual(run([.start, .pause]).phase, .requesting)
        XCTAssertEqual(run([.start, .start]).phase, .requesting)
        XCTAssertEqual(run([.start, .stop]).phase, .requesting, "cannot stop before the mic is live")
        XCTAssertEqual(run([.start, .granted, .start]).phase, .recording, "cannot restart mid-take")
        XCTAssertEqual(run([.start, .granted, .stop, .stop]).phase, .done)
    }

    func testAClipIsEmittedOnlyByTheStepThatFinishesATake() {
        let recording = run([.start, .granted])
        XCTAssertTrue(Recorder.shouldEmitClip(from: recording, to: run([.stop], from: recording)))
        XCTAssertTrue(Recorder.shouldEmitClip(from: recording, to: run([.limit], from: recording)))
        XCTAssertFalse(Recorder.shouldEmitClip(from: recording, to: run([.fail], from: recording)))
        let done = run([.stop], from: recording)
        XCTAssertFalse(Recorder.shouldEmitClip(from: done, to: run([.stop], from: done)), "a finished take cannot emit twice")
        XCTAssertTrue(Recorder.isActive(.requesting) && Recorder.isActive(.paused) && !Recorder.isActive(.done) && !Recorder.isActive(.error))
    }

    // MARK: Peaks, gesture, limit, copy

    func testDownsamplePeaksKeepsTheLoudestReadingPerSlice() {
        XCTAssertEqual(Recorder.downsamplePeaks([]), [])
        XCTAssertEqual(Recorder.downsamplePeaks([0.5]).count, 64)
        let many = (0..<1000).map { $0 == 500 ? 0.9 : 0.1 }
        let out = Recorder.downsamplePeaks(many, count: 10)
        XCTAssertEqual(out.count, 10)
        XCTAssertEqual(out[5], 0.9)
        XCTAssertEqual(out[0], 0.1)
        XCTAssertEqual(Recorder.downsamplePeaks([0.2, 0.4, 0.6, 0.8], count: 2), [0.4, 0.8])
        XCTAssertEqual(Recorder.downsamplePeaks([1, 2, .nan, -0.5], count: 4), [1, 1, 0, 0.5], "clamps and cleans junk")
        XCTAssertEqual(Recorder.downsamplePeaks([0.5], count: 0), [])
        XCTAssertEqual(Recorder.downsamplePeaks([0.3, 0.3], count: 64).count, 64, "short clips still fill the waveform")
        XCTAssertEqual(Recorder.downsamplePeaks([0.5], count: 50_000).count, 128)
    }

    @MainActor
    func testEncodeFailureStopsDeletesAndPublishesOneFailedTake() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }

        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        XCTAssertEqual(model.state.phase, .recording)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNotNil(sessions.activeOwner)

        recorder.emitEncodingError()
        XCTAssertEqual(model.state.phase, .error)
        XCTAssertEqual(model.state.reason, .failed) // elapsed depends on runner speed, so it is not pinned
        XCTAssertEqual(model.announcement?.text, Recorder.announcementText(.failed))
        XCTAssertEqual(recorder.stopCount, 1)
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNil(sessions.activeOwner)
        XCTAssertEqual(sessions.deactivationCount, 1)
        XCTAssertTrue(clips.isEmpty)

        let announcementID = model.announcement?.id
        recorder.emitLateEncodingError()
        XCTAssertEqual(model.announcement?.id, announcementID, "a stale second error is ignored")
        XCTAssertEqual(recorder.stopCount, 1)
        XCTAssertEqual(sessions.deactivationCount, 1)
        XCTAssertTrue(clips.isEmpty)
        model.teardown()
    }

    @MainActor
    func testPollTreatsUnexpectedStopAsFailureButKeepsPauseSemantics() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)

        model.togglePause()
        model.poll()
        XCTAssertEqual(model.state.phase, .paused, "a paused AVAudioRecorder is expected to report isRecording false")
        XCTAssertEqual(sessions.deactivationCount, 0)
        model.togglePause()
        XCTAssertEqual(model.state.phase, .recording)

        recorder.simulateUnexpectedStop()
        model.poll()

        XCTAssertEqual(model.state.phase, .recording, "the delegate confirmation window preserves the take briefly")
        let timeout = Date().addingTimeInterval(1)
        while model.state.phase != .error && Date() < timeout {
            try await Task.sleep(for: .milliseconds(10))
        }

        XCTAssertEqual(model.state.phase, .error)
        XCTAssertEqual(model.state.reason, .failed) // elapsed depends on runner speed, so it is not pinned
        XCTAssertEqual(recorder.stopCount, 1)
        XCTAssertFalse(FileManager.default.fileExists(atPath: try XCTUnwrap(recorder.fileURL).path))
        XCTAssertEqual(sessions.deactivationCount, 1)
        model.teardown()
    }

    @MainActor
    func testFailedRecordReleasesSessionRecorderAndFile() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("x".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            recorder.recordSucceeds = false
            device = recorder
            return recorder
        }, sessionManager: sessions)
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        XCTAssertEqual(model.state.phase, .error)
        XCTAssertEqual(model.state.reason, .failed) // elapsed depends on runner speed, so it is not pinned
        XCTAssertNil(sessions.activeOwner)
        XCTAssertEqual(recorder.stopCount, 1)
        XCTAssertFalse(FileManager.default.fileExists(atPath: try XCTUnwrap(recorder.fileURL).path))
        XCTAssertEqual(model.level, 0)
    }

    @MainActor
    func testDisappearingMidRequestOrMidTakeReturnsToIdleAndAllowsANewTake() async throws {
        let gate = AsyncStream<Void>.makeStream()
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(permission: {
            for await _ in gate.stream { break }
            return true
        }, recorderFactory: { url, _ in FakeVoiceRecorder() }, sessionManager: sessions)
        model.start()
        XCTAssertEqual(model.state.phase, .requesting)
        model.teardown()
        XCTAssertEqual(model.state.phase, .idle)
        gate.continuation.yield()
        try await Task.sleep(for: .milliseconds(30))
        XCTAssertEqual(model.state.phase, .idle, "a grant that arrives after the view left is ignored")
        XCTAssertNil(sessions.activeOwner)
        gate.continuation.finish()

        let second = Recorder(permission: { true }, recorderFactory: { _, _ in FakeVoiceRecorder() }, sessionManager: sessions)
        second.start()
        try await Task.sleep(for: .milliseconds(30))
        XCTAssertEqual(second.state.phase, .recording)
        second.teardown()
        XCTAssertEqual(second.state.phase, .idle)
        XCTAssertNil(sessions.activeOwner)
        second.start()
        try await Task.sleep(for: .milliseconds(30))
        XCTAssertEqual(second.state.phase, .recording, "the model is reusable after a teardown")
        second.teardown()
    }

    @MainActor
    func testTheDeviceEnforcesTheLimitAndTheClipReportsTheRealLength() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let clock = ManualRecorderClock(100)
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("x".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        XCTAssertEqual(recorder.requestedDurations, [30], "the device is told the limit, so no timer has to catch it")

        recorder.currentTime = 12
        model.togglePause()
        model.togglePause()
        XCTAssertEqual(recorder.requestedDurations.last, 18, "resume only allows the time that is left")

        // The device reached its limit on its own, between two polls, and reset its clock.
        clock.advance(by: 18)
        recorder.currentTime = 0
        recorder.emitFinished(successfully: true, at: clock.now())
        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertEqual(try XCTUnwrap(clips.first).duration, 30)
        XCTAssertNil(sessions.activeOwner)
    }

    @MainActor
    func testSuccessfulEarlyRecorderCompletionFailsClosedWithoutEmittingAClip() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let clock = ManualRecorderClock()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)

        clock.advance(by: 10)
        let completionTime = clock.now()
        clock.advance(by: 21) // The MainActor receives the delegate callback after the requested endpoint.
        recorder.emitFinished(successfully: true, at: completionTime)

        XCTAssertEqual(model.state.phase, .error)
        XCTAssertEqual(model.state.reason, .failed)
        XCTAssertTrue(clips.isEmpty, "successful encoding does not prove the requested limit was reached")
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNil(sessions.activeOwner)
        XCTAssertEqual(sessions.deactivationCount, 1)
        model.teardown()
    }

    @MainActor
    func testSuccessfulCompletionTooFarAfterTheDeadlineFailsClosed() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let clock = ManualRecorderClock(100)
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        clock.advance(by: 30.2)

        recorder.emitFinished(successfully: true, at: clock.now())

        XCTAssertEqual(model.state.phase, .error)
        XCTAssertTrue(clips.isEmpty)
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNil(sessions.activeOwner)
        model.teardown()
    }

    @MainActor
    func testNearLimitResumeUsesTheActualPositiveRemainingDuration() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { _, _ in
            let recorder = FakeVoiceRecorder()
            device = recorder
            return recorder
        }, sessionManager: FakeCaptureSessionManager(), monotonicNow: { clock.now() })
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        recorder.currentTime = 29.95

        model.togglePause()
        XCTAssertEqual(model.state.phase, .paused)
        model.togglePause()

        XCTAssertEqual(recorder.requestedDurations.count, 2)
        XCTAssertEqual(recorder.requestedDurations.last ?? -1, 0.05, accuracy: 0.000_001)
        XCTAssertEqual(model.state.phase, .recording)
        model.teardown()
    }

    @MainActor
    func testImmediateSuccessfulCompletionAfterShortResumeDoesNotCountAsLimit() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock()
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        recorder.currentTime = 29.95
        model.togglePause()
        model.togglePause()
        XCTAssertEqual(recorder.requestedDurations.last ?? -1, 0.05, accuracy: 0.000_001)

        recorder.emitFinished(successfully: true, at: clock.now())

        XCTAssertEqual(model.state.phase, .error)
        XCTAssertTrue(clips.isEmpty)
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNil(sessions.activeOwner)
        model.teardown()
    }

    @MainActor
    func testExpiredResumeFinishesAtTheLimitWithoutStartingAnotherRecording() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: FakeCaptureSessionManager(), monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        recorder.currentTime = 30.05
        model.togglePause()
        XCTAssertEqual(model.state.phase, .paused)

        model.togglePause()

        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(recorder.requestedDurations, [30], "an expired take is finalized without a 0.1-second extra recording")
        XCTAssertEqual(clips.count, 1)
        XCTAssertEqual(clips.first?.duration, 30)
        if let url = clips.first?.url { try? FileManager.default.removeItem(at: url) }
        model.teardown()
    }

    @MainActor
    func testPollAtDeviceLimitFinishesWhileRecorderIsStillRecording() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        recorder.currentTime = 30
        XCTAssertTrue(recorder.isRecording)

        model.poll()

        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertEqual(clips.first?.duration, 30)
        XCTAssertNil(sessions.activeOwner)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        try? FileManager.default.removeItem(at: url)
        model.teardown()
    }

    @MainActor
    func testPollAtDeadlineWaitsForDelegateBeforeFinishingLimit() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock(50)
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        clock.advance(by: 30)
        recorder.currentTime = 0
        recorder.simulateUnexpectedStop()

        model.poll()

        XCTAssertEqual(model.state.phase, .recording)
        XCTAssertTrue(clips.isEmpty)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNotNil(sessions.activeOwner)

        recorder.emitFinished(successfully: true, at: 80)

        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertEqual(clips.first?.duration, 30)
        XCTAssertNil(sessions.activeOwner)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path), "the handed-off limit clip remains host-owned")
        recorder.emitLateFinish(successfully: true, at: clock.now())
        XCTAssertEqual(clips.count, 1, "the later delegate callback cannot emit a second clip")
        try? FileManager.default.removeItem(at: url)
        model.teardown()
    }

    @MainActor
    func testLatePollUsesNaturalLimitTimestampFromDelegate() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock(50)
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        clock.advance(by: 30.25)
        recorder.currentTime = 0
        recorder.simulateUnexpectedStop()

        model.poll()

        XCTAssertEqual(model.state.phase, .recording)
        XCTAssertTrue(clips.isEmpty)

        recorder.emitFinished(successfully: true, at: 80)

        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertEqual(clips.first?.duration, 30)
        XCTAssertNil(sessions.activeOwner)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        recorder.emitLateFinish(successfully: true, at: 80)
        XCTAssertEqual(clips.count, 1)
        try? FileManager.default.removeItem(at: url)
        model.teardown()
    }

    @MainActor
    func testCapturedNaturalLimitReceiptSurvivesLateMainActorDelivery() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock(50)
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        clock.advance(by: 30)
        recorder.currentTime = 0
        recorder.simulateUnexpectedStop()
        recorder.captureFinishReceipt(successfully: true, at: 80)
        clock.advance(by: 0.25)

        model.handleInterruptionBegan()
        XCTAssertEqual(model.state.phase, .recording)
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(1_000))
            recorder.deliverPendingFinish()
        }

        let timeout = Date().addingTimeInterval(0.75)
        while model.state.phase == .recording && Date() < timeout {
            try await Task.sleep(for: .milliseconds(10))
        }

        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertEqual(clips.first?.duration, 30)
        XCTAssertNil(sessions.activeOwner)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        try await Task.sleep(for: .milliseconds(1_000))
        XCTAssertEqual(clips.count, 1, "the late MainActor delivery cannot consume or emit the receipt twice")
        try? FileManager.default.removeItem(at: url)
        model.teardown()
    }

    @MainActor
    func testPollWellAfterTheDeadlineDoesNotTurnAnEarlyStopIntoAFullLengthClip() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock(50)
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        recorder.currentTime = 10
        clock.advance(by: 10)
        recorder.simulateUnexpectedStop()
        clock.advance(by: 21) // The first poll is delayed until well after the early stop.

        model.poll()
        model.poll()
        model.poll()

        XCTAssertEqual(model.state.phase, .recording, "the stopped take stays active during the delegate confirmation window")
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNotNil(sessions.activeOwner)

        let timeout = Date().addingTimeInterval(1)
        while model.state.phase != .error && Date() < timeout {
            try await Task.sleep(for: .milliseconds(10))
        }

        XCTAssertEqual(model.state.phase, .error)
        XCTAssertEqual(model.state.reason, .failed)
        XCTAssertTrue(clips.isEmpty)
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNil(sessions.activeOwner)
        XCTAssertEqual(recorder.stopCount, 1)
        let failureAnnouncement = try XCTUnwrap(model.announcement)
        try await Task.sleep(for: .milliseconds(100))
        XCTAssertEqual(model.announcement, failureAnnouncement, "the expired confirmation cannot fail or announce twice")
        XCTAssertEqual(recorder.stopCount, 1)
        model.teardown()
    }

    @MainActor
    func testTeardownCancelsPendingStoppedRecorderConfirmation() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        recorder.currentTime = 10
        recorder.simulateUnexpectedStop()

        model.poll()
        XCTAssertEqual(model.state.phase, .recording)
        model.teardown()

        let tornDownState = model.state
        let tornDownAnnouncement = model.announcement
        XCTAssertEqual(tornDownState, Recorder.idle)
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNil(sessions.activeOwner)
        try await Task.sleep(for: .milliseconds(350))
        XCTAssertEqual(model.state, tornDownState)
        XCTAssertEqual(model.announcement, tornDownAnnouncement)
        XCTAssertTrue(clips.isEmpty)
        XCTAssertEqual(recorder.stopCount, 1)
    }

    @MainActor
    func testPauseOnStoppedRecorderWaitsForNaturalLimitDelegate() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock(50)
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        recorder.currentTime = 29.95
        clock.advance(by: 29.95)
        recorder.simulateUnexpectedStop()

        model.togglePause()

        XCTAssertEqual(model.state.phase, .recording)
        XCTAssertTrue(clips.isEmpty)
        recorder.emitFinished(successfully: true, at: 80)
        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertEqual(clips.first?.duration, 30)
        XCTAssertNil(sessions.activeOwner)
        try? FileManager.default.removeItem(at: url)
        model.teardown()
    }

    @MainActor
    func testInterruptionNearDeadlineFailsAndDeletesStoppedTake() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock(50)
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        recorder.currentTime = 29.95
        clock.advance(by: 29.95)
        recorder.simulateUnexpectedStop()

        model.handleInterruptionBegan()

        XCTAssertEqual(model.state.phase, .recording, "interruption waits through the bounded delegate confirmation window")
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNotNil(sessions.activeOwner)
        let timeout = Date().addingTimeInterval(1)
        while model.state.phase == .recording && Date() < timeout {
            try await Task.sleep(for: .milliseconds(10))
        }

        XCTAssertEqual(model.state.phase, .error)
        XCTAssertEqual(model.state.reason, .failed)
        XCTAssertTrue(clips.isEmpty)
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNil(sessions.activeOwner)
        XCTAssertEqual(recorder.stopCount, 1)
        model.teardown()
    }

    @MainActor
    func testInterruptionWaitsForReceiptCapturedDuringConfirmationGrace() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock(50)
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        recorder.currentTime = 0
        recorder.simulateUnexpectedStop()
        clock.advance(by: 30.25)

        model.handleInterruptionBegan()
        XCTAssertEqual(model.state.phase, .recording)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        recorder.captureFinishReceipt(successfully: true, at: 80)
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(1_000))
            recorder.deliverPendingFinish()
        }

        let timeout = Date().addingTimeInterval(0.75)
        while model.state.phase == .recording && Date() < timeout {
            try await Task.sleep(for: .milliseconds(10))
        }

        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertEqual(clips.first?.duration, 30)
        XCTAssertNil(sessions.activeOwner)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        try await Task.sleep(for: .milliseconds(1_000))
        XCTAssertEqual(clips.count, 1, "the queued delegate cannot consume or emit the receipt a second time")
        try? FileManager.default.removeItem(at: url)
        model.teardown()
    }

    @MainActor
    func testInterruptionWhilePausedLeavesTakeAvailableToResume() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        model.togglePause()
        XCTAssertEqual(model.state.phase, .paused)
        let owner = try XCTUnwrap(sessions.activeOwner)

        model.handleInterruptionBegan()

        XCTAssertEqual(model.state.phase, .paused)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        XCTAssertEqual(sessions.activeOwner, owner)
        XCTAssertTrue(clips.isEmpty)

        model.togglePause()
        XCTAssertEqual(model.state.phase, .recording)
        model.stop()

        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertNil(sessions.activeOwner)
        if let clip = clips.first { try? FileManager.default.removeItem(at: clip.url) }
        model.teardown()
    }

    @MainActor
    func testUserStopAfterNaturalLimitPreservesDurationWhenDeviceClockAlreadyReset() async throws {
        var device: FakeVoiceRecorder?
        let clock = ManualRecorderClock(50)
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(maxDuration: 30, permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions, monotonicNow: { clock.now() })
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        clock.advance(by: 30)
        recorder.currentTime = 0
        recorder.simulateUnexpectedStop()

        model.stop()
        XCTAssertEqual(model.state.phase, .recording)
        XCTAssertTrue(clips.isEmpty)
        recorder.emitFinished(successfully: true, at: 80)

        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertEqual(clips.first?.duration, 30)
        XCTAssertNil(sessions.activeOwner)
        if let url = clips.first?.url { try? FileManager.default.removeItem(at: url) }
        model.teardown()
    }

    @MainActor
    func testADeviceThatEndsUnsuccessfullyFailsTheTakeAndReleasesEverything() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("x".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        recorder.emitFinished(successfully: false)
        XCTAssertEqual(model.state.phase, .error)
        XCTAssertEqual(model.state.reason, .failed) // elapsed depends on runner speed, so it is not pinned
        XCTAssertNil(sessions.activeOwner)
        XCTAssertFalse(FileManager.default.fileExists(atPath: try XCTUnwrap(recorder.fileURL).path))
    }

    @MainActor
    func testUnsuccessfulRecorderCompletionFailsClosedEvenWhilePaused() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }

        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        model.togglePause()
        XCTAssertEqual(model.state.phase, .paused)

        recorder.emitFinished(successfully: false)

        XCTAssertEqual(model.state, .init(phase: .error, elapsed: 0, reason: .failed))
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
        XCTAssertEqual(recorder.stopCount, 1)
        XCTAssertNil(sessions.activeOwner)
        XCTAssertTrue(clips.isEmpty)
        model.teardown()
    }

    @MainActor
    func testRecorderStopReportsAndRepairsAudioSessionReleaseFailure() async throws {
        var device: FakeVoiceRecorder?
        let backend = FakeRecorderSessionBackend()
        let sessions = SystemAudioSessionManager(backend: backend)
        let model = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        XCTAssertNotNil(device)
        backend.failDeactivations(1)

        model.stop()

        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(model.audioSessionStatus, .retrying(attempt: 1, maximumAttempts: 3, message: "deactivation"))
        let deadline = Date().addingTimeInterval(1)
        while backend.isActive && Date() < deadline {
            try await Task.sleep(for: .milliseconds(10))
        }
        XCTAssertFalse(backend.isActive, "the manager retains bounded repair after recorder cleanup")
        XCTAssertEqual(backend.deactivationAttempts, 2)
        model.teardown()
    }

    @MainActor
    func testIntentionalStopDetachesFinishCallbackAndIgnoresLateFailure() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let model = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        var clips: [Recorder.Clip] = []
        model.onRecorded = { clips.append($0) }
        model.start()
        try await Task.sleep(for: .milliseconds(30))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)

        model.stop()
        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1)
        XCTAssertNil(recorder.onFinished, "completion must be detached before intentional stop")
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path), "the delivered file belongs to the host")

        recorder.emitLateFinish(successfully: false)
        XCTAssertEqual(model.state.phase, .done)
        XCTAssertEqual(clips.count, 1, "a stale callback cannot replace or duplicate the delivered clip")
        XCTAssertEqual(sessions.deactivationCount, 1)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        model.teardown()
        try? FileManager.default.removeItem(at: url)
    }

    @MainActor
    func testDroppingLastModelReferenceCleansRecorderResourcesAndUnhandedFile() async throws {
        var device: FakeVoiceRecorder?
        let sessions = FakeCaptureSessionManager()
        let weakModel = WeakRecorderHolder()
        var model: Recorder? = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        weakModel.value = model
        model?.start()
        try await Task.sleep(for: .milliseconds(40))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNotNil(sessions.activeOwner)

        model = nil

        let deadline = Date().addingTimeInterval(1)
        while recorder.stopCount == 0 && Date() < deadline {
            try await Task.sleep(for: .milliseconds(10))
        }
        XCTAssertNil(weakModel.value)
        XCTAssertEqual(recorder.stopCount, 1)
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
        XCTAssertNil(sessions.activeOwner)
        XCTAssertEqual(sessions.deactivationCount, 1)
    }

    @MainActor
    func testRecorderDeinitRepairsSessionAfterLastReferenceLeavesMainActor() async throws {
        var device: FakeVoiceRecorder?
        let backend = FakeRecorderSessionBackend()
        let sessions = SystemAudioSessionManager(backend: backend)
        let weakModel = WeakRecorderHolder()
        let detachedReference = LockedRecorderReference()
        var model: Recorder? = Recorder(permission: { true }, recorderFactory: { url, _ in
            try Data("temporary voice data".utf8).write(to: url)
            let recorder = FakeVoiceRecorder()
            recorder.fileURL = url
            device = recorder
            return recorder
        }, sessionManager: sessions)
        weakModel.value = model
        detachedReference.hold(try XCTUnwrap(model))
        model?.start()
        try await Task.sleep(for: .milliseconds(40))
        let recorder = try XCTUnwrap(device)
        let url = try XCTUnwrap(recorder.fileURL)
        backend.failDeactivations(2)

        model = nil
        let releaseCompleted = DispatchSemaphore(value: 0)
        DispatchQueue.global(qos: .utility).async {
            detachedReference.release()
            releaseCompleted.signal()
        }
        XCTAssertEqual(releaseCompleted.wait(timeout: .now() + .seconds(1)), .success)
        XCTAssertNil(weakModel.value, "ordinary deinit must not wait for MainActor cleanup")

        let deadline = Date().addingTimeInterval(1)
        while backend.isActive && Date() < deadline {
            try await Task.sleep(for: .milliseconds(10))
        }
        XCTAssertNil(weakModel.value, "queued cleanup must not retain the model")
        XCTAssertFalse(backend.isActive, "the audio manager repairs release after model deinit")
        XCTAssertEqual(backend.deactivationAttempts, 3)
        XCTAssertEqual(recorder.stopCount, 1)
        XCTAssertFalse(FileManager.default.fileExists(atPath: url.path))
    }

    @MainActor
    func testStopDeletesAnUnclaimedTempClipButPreservesAHandedOffClip() async throws {
        func makeModel(sessions: FakeCaptureSessionManager, receiver: ((Recorder.Clip) -> Void)?) -> (Recorder, () -> FakeVoiceRecorder?) {
            var device: FakeVoiceRecorder?
            let model = Recorder(permission: { true }, recorderFactory: { url, _ in
                try Data("temporary voice data".utf8).write(to: url)
                let recorder = FakeVoiceRecorder()
                recorder.fileURL = url
                device = recorder
                return recorder
            }, sessionManager: sessions)
            model.onRecorded = receiver
            return (model, { device })
        }

        let unclaimedSessions = FakeCaptureSessionManager()
        let (unclaimed, unclaimedDevice) = makeModel(sessions: unclaimedSessions, receiver: nil)
        unclaimed.start()
        try await Task.sleep(for: .milliseconds(30))
        let unclaimedURL = try XCTUnwrap(unclaimedDevice()?.fileURL)
        unclaimed.stop()
        XCTAssertEqual(unclaimed.state.phase, .done)
        XCTAssertFalse(FileManager.default.fileExists(atPath: unclaimedURL.path))
        XCTAssertEqual(unclaimedSessions.deactivationCount, 1)

        let claimedSessions = FakeCaptureSessionManager()
        var deliveredURL: URL?
        let (claimed, claimedDevice) = makeModel(sessions: claimedSessions) { clip in
            deliveredURL = clip.url
            XCTAssertTrue(FileManager.default.fileExists(atPath: clip.url.path))
        }
        claimed.start()
        try await Task.sleep(for: .milliseconds(30))
        let claimedURL = try XCTUnwrap(claimedDevice()?.fileURL)
        claimed.stop()
        XCTAssertEqual(deliveredURL, claimedURL)
        XCTAssertTrue(FileManager.default.fileExists(atPath: claimedURL.path), "the host owns a successfully delivered file")
        XCTAssertEqual(claimedSessions.deactivationCount, 1)
        unclaimed.teardown()
        claimed.teardown()
        XCTAssertTrue(FileManager.default.fileExists(atPath: claimedURL.path))
        try? FileManager.default.removeItem(at: claimedURL)
    }

    func testHoldCancelsOnlyPastEightyPointsToTheLeft() {
        XCTAssertEqual(Recorder.holdGesture(dx: 0), .record)
        XCTAssertEqual(Recorder.holdGesture(dx: 40), .record)
        XCTAssertEqual(Recorder.holdGesture(dx: -80), .record)
        XCTAssertEqual(Recorder.holdGesture(dx: -81), .cancel)
        XCTAssertEqual(Recorder.holdGesture(dx: -300), .cancel)
        XCTAssertEqual(Recorder.holdGesture(dx: .nan), .record)
    }

    func testLimitWarningWindowAndAnnouncements() {
        XCTAssertFalse(Recorder.isNearLimit(elapsed: 109, maxDuration: 120))
        XCTAssertTrue(Recorder.isNearLimit(elapsed: 110, maxDuration: 120))
        XCTAssertTrue(Recorder.isNearLimit(elapsed: 119.5, maxDuration: 120))
        XCTAssertFalse(Recorder.isNearLimit(elapsed: 5, maxDuration: 8), "short limits do not warn")
        XCTAssertEqual(Recorder.remainingSeconds(elapsed: 115.2, maxDuration: 120), 5)
        XCTAssertEqual(Recorder.remainingSeconds(elapsed: 130, maxDuration: 120), 0)
        XCTAssertEqual(Recorder.announcementText(.recording), "Recording")
        XCTAssertEqual(Recorder.announcementText(.paused), "Paused")
        XCTAssertEqual(Recorder.announcementText(.cancelled), "Recording cancelled")
        XCTAssertEqual(Recorder.announcementText(.releaseToCancel), "Release to cancel")
        XCTAssertEqual(Recorder.announcementText(.stopped, seconds: 12), "Recording stopped, 12 seconds")
        XCTAssertEqual(Recorder.announcementText(.stopped, seconds: 1), "Recording stopped, 1 second")
        XCTAssertEqual(Recorder.announcementText(.limit, seconds: 63), "Time limit reached. Recording stopped, 1 minute 3 seconds")
        XCTAssertEqual(Recorder.announcementText(.denied), "Microphone access is blocked. Allow it in Settings.")
    }

    func testClockMatchesTheWebFormat() {
        XCTAssertEqual(Recorder.formatClock(0), "0:00")
        XCTAssertEqual(Recorder.formatClock(63.9), "1:03")
        XCTAssertEqual(Recorder.formatClock(3600), "1:00:00")
        XCTAssertEqual(Recorder.formatClock(-5), "0:00")
        XCTAssertEqual(Recorder.formatClock(.nan), "0:00")
        XCTAssertEqual(Recorder.spokenClock(0), "0 seconds")
        XCTAssertEqual(Recorder.spokenClock(3723), "1 hour 2 minutes 3 seconds")
    }

    // MARK: Recorder model behavior

    @MainActor
    func testDeniedPermissionEndsInTheDeniedStateWithoutAClip() async throws {
        let model = Recorder(permission: { false })
        var clips = 0
        model.onRecorded = { _ in clips += 1 }
        XCTAssertEqual(model.state.phase, .idle, "creating a model never asks for the microphone")
        model.start()
        XCTAssertEqual(model.state.phase, .requesting)
        try await Task.sleep(for: .milliseconds(100))
        XCTAssertEqual(model.state, .init(phase: .error, elapsed: 0, reason: .denied))
        XCTAssertEqual(model.announcement?.text, Recorder.announcementText(.denied))
        XCTAssertEqual(clips, 0)
    }

    @MainActor
    func testCancellingWhileWaitingForPermissionDropsTheLateAnswer() async throws {
        let model = Recorder(permission: { try? await Task.sleep(for: .milliseconds(50)); return true })
        var cancelled = 0
        model.onCancel = { cancelled += 1 }
        model.start()
        model.cancel()
        try await Task.sleep(for: .milliseconds(150))
        XCTAssertEqual(model.state.phase, .idle, "a late grant after cancel is ignored")
        XCTAssertEqual(cancelled, 1)
    }

    @MainActor
    func testTeardownLeavesNoTakeAndNoCallbacks() {
        let model = Recorder(permission: { true })
        var called = false
        model.onCancel = { called = true }
        model.onRecorded = { _ in called = true }
        model.start()
        model.teardown()
        XCTAssertEqual(model.state.phase, .idle)
        XCTAssertFalse(called)
    }

    // MARK: SpeakerTile

    func testSpeakingHasHysteresis() {
        XCTAssertFalse(SpeakerTile.speakingStep(false, level: 0.12))
        XCTAssertTrue(SpeakerTile.speakingStep(false, level: 0.13))
        XCTAssertFalse(SpeakerTile.speakingStep(false, level: 0.09))
        XCTAssertTrue(SpeakerTile.speakingStep(true, level: 0.09), "stays on between thresholds")
        XCTAssertTrue(SpeakerTile.speakingStep(true, level: 0.06))
        XCTAssertFalse(SpeakerTile.speakingStep(true, level: 0.05))
        XCTAssertFalse(SpeakerTile.speakingStep(true, level: .nan))
        XCTAssertTrue(SpeakerTile.speakingStep(false, level: 5))
    }

    func testSpeakerLabelReadsRoleMuteSpeakingAndHand() {
        XCTAssertEqual(SpeakerTile.speakerLabel(name: "Ava", role: .host, speaking: true), "Ava, host, speaking")
        XCTAssertEqual(SpeakerTile.speakerLabel(name: "Ben", muted: true, handRaised: true), "Ben, muted, hand raised")
        XCTAssertEqual(SpeakerTile.speakerLabel(name: "Cy", muted: true, speaking: true), "Cy, muted", "muted is never speaking")
        XCTAssertEqual(SpeakerTile.speakerLabel(name: "Di"), "Di")
    }

    func testTheRingSwellsAndFadesWithTheVoice() {
        XCTAssertEqual(SpeakerTile.ringScale(0), 1)
        XCTAssertEqual(SpeakerTile.ringScale(1), 1.22, accuracy: 1e-9)
        XCTAssertEqual(SpeakerTile.ringScale(9), 1.22, accuracy: 1e-9)
        XCTAssertEqual(SpeakerTile.ringOpacity(0), 0)
        XCTAssertEqual(SpeakerTile.ringOpacity(0.2), 0.5, accuracy: 1e-9)
        XCTAssertEqual(SpeakerTile.ringOpacity(1), 1)
        XCTAssertEqual(SpeakerTile.ringOpacity(.nan), 0)
    }

    // MARK: AudioRoom

    func testStageKeyChangesWhenPeopleJoinLeaveOrReorder() {
        func key(_ ids: [String]) -> String { AudioRoom.stageKey(ids.map { .init(id: $0, name: $0) }) }
        XCTAssertNotEqual(key(["a", "b"]), key(["b", "a"]))
        XCTAssertNotEqual(key(["a"]), key(["a", "b"]))
        XCTAssertEqual(key(["a", "b"]), key(["a", "b"]))
        XCTAssertNotEqual(key(["ab", "c"]), key(["a", "bc"]))
    }

    func testListenerCountIsShortOnScreenAndExactForVoiceOver() {
        let en = Locale(identifier: "en")
        XCTAssertEqual(AudioRoom.compactCount(1240, locale: en), "1.2K")
        XCTAssertEqual(AudioRoom.compactCount(0, locale: en), "0")
        XCTAssertEqual(AudioRoom.compactCount(-5, locale: en), "0")
        XCTAssertEqual(AudioRoom.compactCount(26_300, locale: en), "26.3K")
        XCTAssertEqual(AudioRoom.exactCount(1240, locale: en), "1,240")
    }

    // MARK: Rendering

    @MainActor
    func testComponentsRenderAtPhoneWidthInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let content = Self.specimens.environment(\.colorScheme, scheme).frame(width: 390)
            let renderer = ImageRenderer(content: content)
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage)
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 400)
            try AtomTests.save(image, name: "audio-capture-\(scheme)")
        }
    }

    @MainActor
    func testTheMeterKeepsOneFrameWhateverTheLevel() throws {
        func height(_ level: Double) throws -> Int {
            try XCTUnwrap(ImageRenderer(content: AudioLevelMeter(level: level).fixedSize()).cgImage).height
        }
        XCTAssertEqual(try height(0), try height(1), "the meter keeps one frame; only the bars move")
    }

    @MainActor
    static var specimens: some View {
        VStack(alignment: .leading, spacing: 20) {
            AudioLevelMeter(level: 0.7)
            VoiceRecorder(onRecorded: { _ in })
            HStack(spacing: 16) {
                SpeakerTile(name: "Ava", role: .host, level: 0.6) { Color.gray }
                SpeakerTile(name: "Ben", isMuted: true, handRaised: true) { Color.gray }
            }
            AudioRoom(title: Text("Friday jam"),
                      speakers: [.init(id: "a", name: "Ava", role: .host, level: 0.5), .init(id: "b", name: "Ben", isMuted: true, handRaised: true)],
                      listenerCount: 1240, me: .init(canSpeak: true), onToggleMute: {}, onToggleHand: {}, onLeave: {}) { _ in Color.gray }
        }
        .padding()
    }
}
