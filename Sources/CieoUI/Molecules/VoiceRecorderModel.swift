import AVFoundation
import Foundation
import Observation

/// Records a voice clip from the microphone with `AVAudioRecorder` and hands it to the host as a file with
/// its length and waveform peaks. The host owns what happens to the file; the model owns the microphone.
///
/// Create one and pass it to `VoiceRecorder(model:)`, or let `VoiceRecorder` make its own. Permission is
/// requested only when `start()` is called, never on creation. The host app needs an
/// `NSMicrophoneUsageDescription` (and, in a sandboxed Mac app, the audio-input entitlement).
@MainActor
@Observable
public final class VoiceRecorderModel {
    // MARK: - Observable state

    /// The recorder's state machine position.
    public internal(set) var state = VoiceRecorderModel.idle
    /// Snapshot of the shared audio-session repair state.
    public var audioSessionStatus: AudioSessionReconciliationStatus { audioSession.reconciliationStatus }
    /// Live loudness from 0 to 1 while recording, 0 otherwise. Steps of 0.02 so views do not churn.
    public internal(set) var level: Double = 0
    /// The latest discrete announcement, for the view to post to VoiceOver.
    public internal(set) var announcement: Announcement?

    // MARK: - Configuration

    /// Longest take in seconds. Recording stops by itself at the limit. Defaults to 120.
    public let maxDuration: TimeInterval
    /// Called once with the finished clip when the person stops or the limit is reached. Never after a cancel.
    @ObservationIgnored public var onRecorded: ((Clip) -> Void)?
    /// Called when the person cancels an active take.
    @ObservationIgnored public var onCancel: (() -> Void)?

    // MARK: - Internals

    static let limitCompletionTolerance: TimeInterval = 0.1 // literal-ok: bound delegate and timer ordering jitter at the requested endpoint
    static let limitCompletionToleranceFraction: TimeInterval = 0.1 // literal-ok: scale the tolerance down for short recording segments
    static let stoppedRecorderDelegateGrace: TimeInterval = 0.25 // literal-ok: bounded time for AVAudioRecorder's queued finish callback to reach MainActor

    @ObservationIgnored let permission: PermissionRequest
    @ObservationIgnored let recorderFactory: VoiceRecorderFactory
    @ObservationIgnored let audioSession: AudioSessionManaging
    @ObservationIgnored let cleanupState: VoiceRecorderCleanupState
    @ObservationIgnored let monotonicNow: @Sendable () -> TimeInterval
    @ObservationIgnored var peaks: [Double] = []
    @ObservationIgnored var session = 0
    @ObservationIgnored var announced = 0
    @ObservationIgnored var activeDeadline: TimeInterval?
    @ObservationIgnored var activeSegmentDuration: TimeInterval?
    @ObservationIgnored var remainingWhenPaused: TimeInterval?

    var recorder: (any VoiceRecorderDevice)? {
        get { cleanupState.recorder }
        set { cleanupState.recorder = newValue }
    }
    var fileURL: URL? {
        get { cleanupState.fileURL }
        set { cleanupState.fileURL = newValue }
    }
    var sessionOwner: UUID? {
        get { cleanupState.sessionOwner }
        set { cleanupState.sessionOwner = newValue }
    }
    var timer: Timer? {
        get { cleanupState.timer }
        set { cleanupState.timer = newValue }
    }
    var stopConfirmationTimer: Timer? {
        get { cleanupState.stopConfirmationTimer }
        set { cleanupState.stopConfirmationTimer = newValue }
    }
    var interruption: NSObjectProtocol? {
        get { cleanupState.interruption }
        set { cleanupState.interruption = newValue }
    }

    /// `maxDuration` is clamped to at least one second.
    public convenience init(maxDuration: TimeInterval = 120, // literal-ok: default take limit
                            permission: @escaping PermissionRequest = VoiceRecorderModel.systemPermission) {
        self.init(maxDuration: maxDuration, permission: permission,
                  recorderFactory: { url, settings in try SystemVoiceRecorderDevice(url: url, settings: settings) },
                  sessionManager: SystemAudioSessionManager.shared)
    }

    init(maxDuration: TimeInterval = 120, permission: @escaping PermissionRequest,
         recorderFactory: @escaping VoiceRecorderFactory, sessionManager: AudioSessionManaging,
         monotonicNow: @escaping @Sendable () -> TimeInterval = { ProcessInfo.processInfo.systemUptime }) {
        self.maxDuration = maxDuration.isFinite ? max(1, maxDuration) : 120 // literal-ok: default take limit
        self.permission = permission
        self.recorderFactory = recorderFactory
        audioSession = sessionManager
        cleanupState = VoiceRecorderCleanupState(audioSession: sessionManager)
        self.monotonicNow = monotonicNow
    }

    deinit {
        cleanupState.scheduleCleanup()
    }

    // MARK: - Intents

    /// Asks for the microphone and starts a take. Call it only from an explicit user action.
    public func start() {
        guard !Self.isActive(state.phase) else { return }
        session += 1
        let mine = session
        send(.start)
        announcement = nil
        Task { @MainActor [weak self] in
            guard let self else { return }
            let granted = await self.permission()
            guard mine == self.session else { return }
            if granted { self.beginRecording() } else {
                self.send(.denied)
                self.announce(.denied)
            }
        }
    }

    /// Pauses a take, or resumes a paused one.
    public func togglePause() {
        guard let recorder else { return }
        switch state.phase {
        case .recording:
            guard recorder.isRecording else { awaitStoppedRecorderCompletion(); return }
            recorder.pause()
            let remaining = remainingTake(recorder)
            guard remaining.isFinite else { fail(); return }
            remainingWhenPaused = remaining
            activeDeadline = nil
            activeSegmentDuration = nil
            level = 0
            send(.pause)
            announce(.paused)
        case .paused:
            let deviceRemaining = remainingOnDevice(recorder)
            guard deviceRemaining.isFinite else { fail(); return }
            let remaining = min(remainingWhenPaused ?? deviceRemaining, deviceRemaining)
            guard remaining.isFinite else { fail(); return }
            guard remaining > 0 else { finish(.limit); return }
            let resumedAt = monotonicNow()
            guard resumedAt.isFinite, (resumedAt + remaining).isFinite else { fail(); return }
            guard recorder.record(forDuration: remaining) else { fail(); return }
            activeDeadline = resumedAt + remaining
            activeSegmentDuration = remaining
            remainingWhenPaused = nil
            send(.resume)
            announce(.recording)
        default: break
        }
    }

    /// Finishes the take and hands the clip to `onRecorded`.
    public func stop() {
        if state.phase == .recording, let recorder, !recorder.isRecording {
            awaitStoppedRecorderCompletion()
        } else {
            finish(.stop)
        }
    }

    /// Throws the take away without ever emitting a clip, and deletes its file.
    public func cancel(notify: Bool = true) {
        let wasActive = Self.isActive(state.phase)
        releaseRecorder(deleteFile: true)
        guard wasActive else { return }
        level = 0
        send(.cancel)
        announce(.canceled)
        if notify { onCancel?() }
    }

    /// Announces that a hold gesture has slid into the cancel zone.
    public func announceReleaseToCancel() { announce(.releaseToCancel) }

    /// Stops the microphone and drops the take with no clip and no `onCancel`. Call on disappear.
    public func teardown() {
        releaseRecorder(deleteFile: true)
        level = 0
        if Self.isActive(state.phase) { send(.cancel) }
    }
}
