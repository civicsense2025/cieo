import AVFoundation
import Foundation
import Observation

@MainActor
protocol VoiceRecorderDevice: AnyObject {
    var isRecording: Bool { get }
    var currentTime: TimeInterval { get }
    var averagePower: Float { get }
    var isMeteringEnabled: Bool { get set }
    var onEncodingError: (@MainActor () -> Void)? { get set }
    var onFinished: (@MainActor (Bool) -> Void)? { get set }
    func prepareToRecord() -> Bool
    func record() -> Bool
    func pause()
    func stop()
    func updateMeters()
}

typealias VoiceRecorderFactory = @MainActor (URL, [String: Any]) throws -> any VoiceRecorderDevice

@MainActor
private final class SystemVoiceRecorderDevice: NSObject, VoiceRecorderDevice, AVAudioRecorderDelegate {
    private let recorder: AVAudioRecorder
    var onEncodingError: (@MainActor () -> Void)?
    var onFinished: (@MainActor (Bool) -> Void)?

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
    func record() -> Bool { recorder.record() }
    func pause() { recorder.pause() }
    func stop() { recorder.stop() }
    func updateMeters() { recorder.updateMeters() }

    nonisolated func audioRecorderEncodeErrorDidOccur(_ recorder: AVAudioRecorder, error: Error?) {
        let recorderID = ObjectIdentifier(recorder)
        Task { @MainActor [weak self] in
            guard let self, ObjectIdentifier(self.recorder) == recorderID else { return }
            self.onEncodingError?()
        }
    }

    nonisolated func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        let recorderID = ObjectIdentifier(recorder)
        Task { @MainActor [weak self] in
            guard let self, ObjectIdentifier(self.recorder) == recorderID else { return }
            self.onFinished?(flag)
        }
    }
}

/// Records a voice clip from the microphone with `AVAudioRecorder` and hands it to the host as a file with
/// its length and waveform peaks. The host owns what happens to the file; the model owns the microphone.
///
/// Create one and pass it to `VoiceRecorder(model:)`, or let `VoiceRecorder` make its own. Permission is
/// requested only when `start()` is called, never on creation. The host app needs an
/// `NSMicrophoneUsageDescription` (and, in a sandboxed Mac app, the audio-input entitlement).
@MainActor
@Observable
public final class VoiceRecorderModel {
    // MARK: - Types

    public enum Phase: Sendable, Equatable { case idle, requesting, recording, paused, done, error }
    public enum ErrorReason: Sendable, Equatable { case denied, unsupported, failed }

    /// Where a take is: phase, whole seconds recorded so far, and the reason when it is in error.
    public struct RecorderState: Sendable, Equatable {
        public var phase: Phase
        /// Whole seconds recorded so far.
        public var elapsed: Int
        /// Set only in the error phase.
        public var reason: ErrorReason?

        public init(phase: Phase = .idle, elapsed: Int = 0, reason: ErrorReason? = nil) {
            self.phase = phase; self.elapsed = elapsed; self.reason = reason
        }
    }

    public enum Event: Sendable, Equatable {
        case start, granted, denied, unsupported, pause, resume, stop, cancel
        case tick(Double)
        case limit, fail, reset
    }

    /// Outcome of a hold-to-record gesture.
    public enum HoldOutcome: Sendable, Equatable { case record, cancel }

    /// Discrete events that are announced to VoiceOver. The running clock never is.
    public enum AnnouncementKind: Sendable, Equatable {
        case recording, paused, cancelled, denied, unsupported, failed, releaseToCancel, stopped, limit
    }

    /// A finished take. The file is an AAC `.m4a` in the temporary directory; move or upload it, the
    /// model never touches it again.
    public struct Clip: Sendable, Equatable {
        public let url: URL
        /// Length in seconds, paused time excluded.
        public let duration: TimeInterval
        /// 64 loudness readings from 0 to 1, ready for a waveform.
        public let peaks: [Double]

        public init(url: URL, duration: TimeInterval, peaks: [Double]) {
            self.url = url; self.duration = duration; self.peaks = peaks
        }
    }

    /// One spoken message. `id` changes every time, so the same sentence can be announced twice.
    public struct Announcement: Sendable, Equatable {
        public let id: Int
        public let text: String
    }

    /// Asks for microphone permission. Replaceable so hosts and tests can supply their own answer.
    public typealias PermissionRequest = @Sendable () async -> Bool

    // MARK: - Observable state

    /// The recorder's state machine position.
    public private(set) var state = VoiceRecorderModel.idle
    /// Live loudness from 0 to 1 while recording, 0 otherwise. Steps of 0.02 so views do not churn.
    public private(set) var level: Double = 0
    /// The latest discrete announcement, for the view to post to VoiceOver.
    public private(set) var announcement: Announcement?

    // MARK: - Configuration

    /// Longest take in seconds. Recording stops by itself at the limit. Defaults to 120.
    public let maxDuration: TimeInterval
    /// Called once with the finished clip when the person stops or the limit is reached. Never after a cancel.
    @ObservationIgnored public var onRecorded: ((Clip) -> Void)?
    /// Called when the person cancels an active take.
    @ObservationIgnored public var onCancel: (() -> Void)?

    // MARK: - Internals

    @ObservationIgnored private let permission: PermissionRequest
    @ObservationIgnored private let recorderFactory: VoiceRecorderFactory
    @ObservationIgnored private let audioSession: AudioSessionManaging
    @ObservationIgnored private var recorder: (any VoiceRecorderDevice)?
    @ObservationIgnored private var fileURL: URL?
    @ObservationIgnored private var sessionOwner: UUID?
    @ObservationIgnored private var timer: Timer?
    @ObservationIgnored private var peaks: [Double] = []
    @ObservationIgnored private var session = 0
    @ObservationIgnored private var announced = 0
    @ObservationIgnored private var interruption: NSObjectProtocol?

    /// `maxDuration` is clamped to at least one second.
    public convenience init(maxDuration: TimeInterval = 120, // literal-ok: default take limit
                            permission: @escaping PermissionRequest = VoiceRecorderModel.systemPermission) {
        self.init(maxDuration: maxDuration, permission: permission,
                  recorderFactory: { url, settings in try SystemVoiceRecorderDevice(url: url, settings: settings) },
                  sessionManager: SystemAudioSessionManager.shared)
    }

    init(maxDuration: TimeInterval = 120, permission: @escaping PermissionRequest,
         recorderFactory: @escaping VoiceRecorderFactory, sessionManager: AudioSessionManaging) {
        self.maxDuration = maxDuration.isFinite ? max(1, maxDuration) : 120 // literal-ok: default take limit
        self.permission = permission
        self.recorderFactory = recorderFactory
        audioSession = sessionManager
    }

    isolated deinit {
        releaseRecorder(deleteFile: true)
    }

    // MARK: - Pure helpers

    nonisolated public static let idle = RecorderState()

    /// True while a microphone, or a request for one, is in use.
    nonisolated public static func isActive(_ phase: Phase) -> Bool {
        phase == .requesting || phase == .recording || phase == .paused
    }

    /// Pure recorder state machine. Cancel from any state goes back to idle, and only stop or limit reach
    /// done, so a cancelled take can never produce a clip.
    nonisolated public static func step(_ state: RecorderState, _ event: Event) -> RecorderState {
        let phase = state.phase
        func to(_ next: Phase, elapsed: Int? = nil, reason: ErrorReason? = nil) -> RecorderState {
            RecorderState(phase: next, elapsed: elapsed ?? state.elapsed, reason: reason)
        }
        switch event {
        case .start:
            return phase == .idle || phase == .done || phase == .error ? to(.requesting, elapsed: 0) : state
        case .granted:
            return phase == .requesting ? to(.recording) : state
        case .denied:
            return phase == .requesting ? to(.error, reason: .denied) : state
        case .unsupported:
            return phase == .idle || phase == .requesting ? to(.error, elapsed: 0, reason: .unsupported) : state
        case .pause:
            return phase == .recording ? to(.paused) : state
        case .resume:
            return phase == .paused ? to(.recording) : state
        case .stop, .limit:
            return phase == .recording || phase == .paused ? to(.done) : state
        case .tick(let seconds):
            guard phase == .recording else { return state }
            let elapsed = seconds.isFinite ? max(0, Int(seconds.rounded(.down))) : state.elapsed
            return elapsed == state.elapsed ? state : RecorderState(phase: phase, elapsed: elapsed, reason: state.reason)
        case .fail:
            return isActive(phase) ? to(.error, reason: .failed) : state
        case .cancel, .reset:
            return phase == .idle && state.elapsed == 0 ? state : idle
        }
    }

    /// True when a step finished a take, which is the only moment a clip may be handed to the host.
    nonisolated public static func shouldEmitClip(from previous: RecorderState, to next: RecorderState) -> Bool {
        isActive(previous.phase) && next.phase == .done
    }

    /// Shrinks loudness readings (0...1) to at most `AudioWaveform.maximumBarCount` bars, each the loudest
    /// reading in its slice. Empty input gives `[]`; non-finite readings count as silence.
    nonisolated public static func downsamplePeaks(_ samples: [Double], count: Int = 64) -> [Double] { // literal-ok: waveform bar count shared with the web
        let n = samples.count
        guard n > 0, count > 0 else { return [] }
        let outputCount = min(count, AudioWaveform.maximumBarCount)
        return (0..<outputCount).map { i in
            let start = min(n - 1, i * n / outputCount)
            let end = max(start + 1, (i + 1) * n / outputCount)
            var peak = 0.0
            var j = start
            while j < end && j < n {
                let v = samples[j]
                if v.isFinite { peak = max(peak, min(1, abs(v))) }
                j += 1
            }
            return peak
        }
    }

    /// Points the finger may slide left in hold mode before the take is thrown away.
    nonisolated public static let holdCancelDistance: Double = 80 // literal-ok: the web slide-to-cancel distance

    /// Hold-to-record gesture: sliding left past 80 points means cancel, anything else keeps recording.
    nonisolated public static func holdGesture(dx: Double) -> HoldOutcome {
        dx.isFinite && dx < -holdCancelDistance ? .cancel : .record
    }

    /// Whole seconds left before the limit, never below 0.
    nonisolated public static func remainingSeconds(elapsed: Double, maxDuration: Double) -> Int {
        max(0, Int((maxDuration - elapsed).rounded(.up)))
    }

    /// True in the last 10 seconds of a take, when the clock switches to a countdown. Limits of 10 seconds
    /// or less never warn.
    nonisolated public static func isNearLimit(elapsed: Double, maxDuration: Double) -> Bool {
        maxDuration > 10 && remainingSeconds(elapsed: elapsed, maxDuration: maxDuration) <= 10 // literal-ok: the web warning window
    }

    /// Clock text, m:ss under an hour and h:mm:ss above; the shared AudioTime format.
    nonisolated public static func formatClock(_ seconds: Double) -> String {
        AudioTime.formatAudioTime(seconds)
    }

    /// Spoken time such as "1 minute 3 seconds"; the shared AudioTime wording.
    nonisolated public static func spokenClock(_ seconds: Double) -> String {
        AudioTime.speakAudioTime(seconds)
    }

    /// Sentence for VoiceOver. Only discrete events are announced, never the running clock.
    nonisolated public static func announcementText(_ kind: AnnouncementKind, seconds: Double = 0) -> String {
        switch kind {
        case .recording: "Recording"
        case .paused: "Paused"
        case .cancelled: "Recording cancelled"
        case .denied: "Microphone access is blocked. Allow it in Settings."
        case .unsupported: "Voice recording is not supported on this device."
        case .failed: "Recording failed. Try again."
        case .releaseToCancel: "Release to cancel"
        case .limit: "Time limit reached. Recording stopped, \(spokenClock(seconds))"
        case .stopped: "Recording stopped, \(spokenClock(seconds))"
        }
    }

    /// Asks the system for microphone access: `AVAudioApplication` on iOS, `AVCaptureDevice` on the Mac.
    nonisolated public static let systemPermission: PermissionRequest = {
        #if os(iOS)
        return await AVAudioApplication.requestRecordPermission()
        #else
        return await AVCaptureDevice.requestAccess(for: .audio)
        #endif
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
            recorder.pause()
            level = 0
            send(.pause)
            announce(.paused)
        case .paused:
            guard recorder.record() else { fail(); return }
            send(.resume)
            announce(.recording)
        default: break
        }
    }

    /// Finishes the take and hands the clip to `onRecorded`.
    public func stop() { finish(.stop) }

    /// Throws the take away without ever emitting a clip, and deletes its file.
    public func cancel(notify: Bool = true) {
        let wasActive = Self.isActive(state.phase)
        releaseRecorder(deleteFile: true)
        guard wasActive else { return }
        level = 0
        send(.cancel)
        announce(.cancelled)
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

    // MARK: - Recording

    private func beginRecording() {
        #if os(macOS)
        guard AVCaptureDevice.default(for: .audio) != nil else {
            send(.unsupported)
            announce(.unsupported)
            return
        }
        #endif
        if let previousOwner = sessionOwner {
            do {
                try audioSession.deactivate(owner: previousOwner)
                sessionOwner = nil
            } catch {
                send(.fail)
                announce(.failed)
                return
            }
        }
        do {
            let owner = UUID()
            try audioSession.activate(.recording, owner: owner)
            sessionOwner = owner
            #if os(iOS)
            observeInterruptions()
            #endif
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("voice-\(UUID().uuidString).m4a")
            fileURL = url
            let settings: [String: Any] = [
                AVFormatIDKey: kAudioFormatMPEG4AAC,
                AVSampleRateKey: 44_100, // literal-ok: CD-quality sample rate
                AVNumberOfChannelsKey: 1, // literal-ok: mono voice
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
            ]
            let recorder = try recorderFactory(url, settings)
            self.recorder = recorder
            recorder.isMeteringEnabled = true
            recorder.onEncodingError = { [weak self, weak recorder] in
                guard let self, let recorder, self.recorder === recorder else { return }
                self.fail()
            }
            recorder.onFinished = { [weak self, weak recorder] successfully in
                guard !successfully, let self, let recorder, self.recorder === recorder else { return }
                self.fail()
            }
            guard recorder.prepareToRecord(), recorder.record() else { throw CocoaError(.fileWriteUnknown) }
            peaks = []
            send(.granted)
            announce(.recording)
            startPolling()
        } catch {
            releaseRecorder(deleteFile: true)
            send(.fail)
            announce(.failed)
        }
    }

    private func startPolling() {
        timer?.invalidate()
        let timer = Timer(timeInterval: 0.05, repeats: true) { [weak self] _ in // literal-ok: 20 Hz metering
            MainActor.assumeIsolated { self?.poll() }
        }
        RunLoop.main.add(timer, forMode: .common)
        self.timer = timer
    }

    func poll() {
        guard let recorder else { return }
        guard recorder.isRecording else {
            if state.phase == .recording { fail() }
            return
        }
        recorder.updateMeters()
        let heard = AudioLevelMeter.decibelsLevel(Double(recorder.averagePower))
        peaks.append(heard)
        let quantized = (heard * 50).rounded() / 50 // literal-ok: 0.02 steps
        if quantized != level { level = quantized }
        let elapsed = recorder.currentTime
        send(.tick(elapsed))
        if elapsed >= maxDuration { finish(.limit) }
    }

    private func finish(_ event: Event) {
        guard state.phase == .recording || state.phase == .paused, let recorder, let url = fileURL else { return }
        let duration = min(maxDuration, (recorder.currentTime * 10).rounded() / 10) // literal-ok: tenths of a second
        let previous = state
        let readings = peaks
        releaseRecorder(deleteFile: false)
        level = 0
        send(event)
        announce(event == .limit ? .limit : .stopped, seconds: duration)
        if Self.shouldEmitClip(from: previous, to: state) {
            let clip = Clip(url: url, duration: duration, peaks: Self.downsamplePeaks(readings))
            if let onRecorded { onRecorded(clip) }
            else { try? FileManager.default.removeItem(at: url) }
        }
    }

    private func fail() {
        guard state.phase == .recording || state.phase == .paused else { return }
        releaseRecorder(deleteFile: true)
        level = 0
        send(.fail)
        announce(.failed)
    }

    /// Stops the timer and recorder and deactivates the audio session; optionally deletes the file.
    private func releaseRecorder(deleteFile: Bool) {
        session += 1
        timer?.invalidate()
        timer = nil
        if let recorder {
            recorder.onEncodingError = nil
            recorder.onFinished = nil
            recorder.stop()
        }
        recorder = nil
        if deleteFile, let url = fileURL { try? FileManager.default.removeItem(at: url) }
        fileURL = nil
        peaks = []
        #if os(iOS)
        if let interruption { NotificationCenter.default.removeObserver(interruption) }
        interruption = nil
        #endif
        if let sessionOwner {
            do {
                try audioSession.deactivate(owner: sessionOwner)
                self.sessionOwner = nil
            } catch {
                // Keep ownership so teardown, another start, or deinit can retry release.
            }
        }
    }

    #if os(iOS)
    /// A phone call or alarm pauses the take instead of silently ending it.
    private func observeInterruptions() {
        guard interruption == nil else { return }
        interruption = NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification, object: nil, queue: .main
        ) { [weak self] note in
            let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt
            MainActor.assumeIsolated {
                if raw == AVAudioSession.InterruptionType.began.rawValue, self?.state.phase == .recording { self?.togglePause() }
            }
        }
    }
    #endif

    private func send(_ event: Event) { state = Self.step(state, event) }

    private func announce(_ kind: AnnouncementKind, seconds: Double = 0) {
        announced += 1
        announcement = Announcement(id: announced, text: Self.announcementText(kind, seconds: seconds))
    }
}
