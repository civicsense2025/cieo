import AVFoundation
import Foundation

struct VoiceRecorderFinishReceipt: Sendable {
    let successfully: Bool
    let finishedAt: TimeInterval
}

private final class VoiceRecorderFinishReceiptStore: @unchecked Sendable {
    private let lock = NSLock()
    private var pending: VoiceRecorderFinishReceipt?

    func store(_ receipt: VoiceRecorderFinishReceipt) {
        lock.lock(); defer { lock.unlock() }
        if pending == nil { pending = receipt }
    }

    func take() -> VoiceRecorderFinishReceipt? {
        lock.lock(); defer { lock.unlock() }
        defer { pending = nil }
        return pending
    }
}

@MainActor
protocol VoiceRecorderDevice: AnyObject {
    var isRecording: Bool { get }
    var currentTime: TimeInterval { get }
    var averagePower: Float { get }
    var isMeteringEnabled: Bool { get set }
    var onEncodingError: (@MainActor () -> Void)? { get set }
    /// Called when the device stops by itself, with the monotonic time of its delegate event.
    var onFinished: (@MainActor (Bool, TimeInterval) -> Void)? { get set }
    /// One-shot receipt captured by the nonisolated delegate before its MainActor delivery is queued.
    nonisolated func takePendingFinish() -> VoiceRecorderFinishReceipt?
    func prepareToRecord() -> Bool
    /// Records for at most `seconds`; the device stops itself at the limit, with no timer needed.
    func record(forDuration seconds: TimeInterval) -> Bool
    func pause()
    func stop()
    func updateMeters()
}

typealias VoiceRecorderFactory = @MainActor (URL, [String: Any]) throws -> any VoiceRecorderDevice

@MainActor
final class SystemVoiceRecorderDevice: NSObject, VoiceRecorderDevice, AVAudioRecorderDelegate {
    private let recorder: AVAudioRecorder
    nonisolated private let finishReceipts = VoiceRecorderFinishReceiptStore()
    var onEncodingError: (@MainActor () -> Void)?
    var onFinished: (@MainActor (Bool, TimeInterval) -> Void)?

    init(url: URL, settings: [String: Any]) throws {
        recorder = try AVAudioRecorder(url: url, settings: settings)
        super.init()
        recorder.delegate = self
    }

    var isRecording: Bool { recorder.isRecording }
    var currentTime: TimeInterval { recorder.currentTime }
    var averagePower: Float { recorder.averagePower(forChannel: 0) }
    var isMeteringEnabled: Bool {
        get { recorder.isMeteringEnabled }
        set { recorder.isMeteringEnabled = newValue }
    }

    func prepareToRecord() -> Bool { recorder.prepareToRecord() }
    func record(forDuration seconds: TimeInterval) -> Bool { recorder.record(forDuration: seconds) }
    func pause() { recorder.pause() }
    func stop() { recorder.stop() }
    func updateMeters() { recorder.updateMeters() }
    nonisolated func takePendingFinish() -> VoiceRecorderFinishReceipt? { finishReceipts.take() }

    nonisolated func audioRecorderEncodeErrorDidOccur(_ recorder: AVAudioRecorder, error: Error?) {
        let recorderID = ObjectIdentifier(recorder)
        Task { @MainActor [weak self] in
            guard let self, ObjectIdentifier(self.recorder) == recorderID else { return }
            self.onEncodingError?()
        }
    }

    nonisolated func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        let recorderID = ObjectIdentifier(recorder)
        finishReceipts.store(VoiceRecorderFinishReceipt(successfully: flag, finishedAt: ProcessInfo.processInfo.systemUptime))
        Task { @MainActor [weak self] in
            guard let self, ObjectIdentifier(self.recorder) == recorderID,
                  let receipt = self.takePendingFinish() else { return }
            self.onFinished?(receipt.successfully, receipt.finishedAt)
        }
    }
}

/// A one-shot transfer from a nonisolated deinitializer to MainActor.
struct VoiceRecorderCleanupSnapshot: @unchecked Sendable {
    let recorder: (any VoiceRecorderDevice)?
    let timer: Timer?
    let stopConfirmationTimer: Timer?
    let fileURL: URL?
    let sessionOwner: UUID?
    let interruption: NSObjectProtocol?
    let audioSession: AudioSessionManaging

    var hasResources: Bool {
        recorder != nil || timer != nil || stopConfirmationTimer != nil || fileURL != nil || sessionOwner != nil || interruption != nil
    }

    @MainActor
    func clean(deleteFile: Bool) {
        timer?.invalidate()
        stopConfirmationTimer?.invalidate()
        if let recorder {
            recorder.onEncodingError = nil
            recorder.onFinished = nil
            recorder.stop()
        }
        if deleteFile, let fileURL { try? FileManager.default.removeItem(at: fileURL) }
        #if os(iOS)
        if let interruption { NotificationCenter.default.removeObserver(interruption) }
        #endif
        if let sessionOwner { try? audioSession.deactivate(owner: sessionOwner) }
    }
}

/// Lock-backed resource ownership lets ordinary `deinit` transfer cleanup without touching MainActor state.
final class VoiceRecorderCleanupState: @unchecked Sendable {
    private let lock = NSLock()
    private let audioSession: AudioSessionManaging
    private var storedRecorder: (any VoiceRecorderDevice)?
    private var storedTimer: Timer?
    private var storedStopConfirmationTimer: Timer?
    private var storedFileURL: URL?
    private var storedSessionOwner: UUID?
    private var storedInterruption: NSObjectProtocol?

    init(audioSession: AudioSessionManaging) { self.audioSession = audioSession }

    @MainActor var recorder: (any VoiceRecorderDevice)? {
        get { lock.lock(); defer { lock.unlock() }; return storedRecorder }
        set { lock.lock(); defer { lock.unlock() }; storedRecorder = newValue }
    }

    @MainActor var timer: Timer? {
        get { lock.lock(); defer { lock.unlock() }; return storedTimer }
        set { lock.lock(); defer { lock.unlock() }; storedTimer = newValue }
    }

    @MainActor var stopConfirmationTimer: Timer? {
        get { lock.lock(); defer { lock.unlock() }; return storedStopConfirmationTimer }
        set { lock.lock(); defer { lock.unlock() }; storedStopConfirmationTimer = newValue }
    }

    @MainActor var fileURL: URL? {
        get { lock.lock(); defer { lock.unlock() }; return storedFileURL }
        set { lock.lock(); defer { lock.unlock() }; storedFileURL = newValue }
    }

    @MainActor var sessionOwner: UUID? {
        get { lock.lock(); defer { lock.unlock() }; return storedSessionOwner }
        set { lock.lock(); defer { lock.unlock() }; storedSessionOwner = newValue }
    }

    @MainActor var interruption: NSObjectProtocol? {
        get { lock.lock(); defer { lock.unlock() }; return storedInterruption }
        set { lock.lock(); defer { lock.unlock() }; storedInterruption = newValue }
    }

    func takeSnapshot() -> VoiceRecorderCleanupSnapshot {
        lock.lock(); defer { lock.unlock() }
        let snapshot = VoiceRecorderCleanupSnapshot(
            recorder: storedRecorder,
            timer: storedTimer,
            stopConfirmationTimer: storedStopConfirmationTimer,
            fileURL: storedFileURL,
            sessionOwner: storedSessionOwner,
            interruption: storedInterruption,
            audioSession: audioSession
        )
        storedRecorder = nil
        storedTimer = nil
        storedStopConfirmationTimer = nil
        storedFileURL = nil
        storedSessionOwner = nil
        storedInterruption = nil
        return snapshot
    }

    func scheduleCleanup() {
        let snapshot = takeSnapshot()
        guard snapshot.hasResources else { return }
        Task { @MainActor in snapshot.clean(deleteFile: true) }
    }
}
