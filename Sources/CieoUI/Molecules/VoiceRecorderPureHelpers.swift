import AVFoundation
import Foundation

public extension VoiceRecorderModel {
    enum Phase: Sendable, Equatable { case idle, requesting, recording, paused, done, error }
    enum ErrorReason: Sendable, Equatable { case denied, unsupported, failed }

    /// Where a take is: phase, whole seconds recorded so far, and the reason when it is in error.
    struct RecorderState: Sendable, Equatable {
        public var phase: Phase
        /// Whole seconds recorded so far.
        public var elapsed: Int
        /// Set only in the error phase.
        public var reason: ErrorReason?

        public init(phase: Phase = .idle, elapsed: Int = 0, reason: ErrorReason? = nil) {
            self.phase = phase; self.elapsed = elapsed; self.reason = reason
        }
    }

    enum Event: Sendable, Equatable {
        case start, granted, denied, unsupported, pause, resume, stop, cancel
        case tick(Double)
        case limit, fail, reset
    }

    /// Outcome of a hold-to-record gesture.
    enum HoldOutcome: Sendable, Equatable { case record, cancel }

    /// Discrete events that are announced to VoiceOver. The running clock never is.
    enum AnnouncementKind: Sendable, Equatable {
        case recording, paused, cancelled, denied, unsupported, failed, releaseToCancel, stopped, limit
    }

    /// A finished take. The file is an AAC `.m4a` in the temporary directory; move or upload it, the
    /// model never touches it again.
    struct Clip: Sendable, Equatable {
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
    struct Announcement: Sendable, Equatable {
        public let id: Int
        public let text: String
    }

    /// Asks for microphone permission. Replaceable so hosts and tests can supply their own answer.
    typealias PermissionRequest = @Sendable () async -> Bool

    nonisolated static let idle = RecorderState()

    /// True while a microphone, or a request for one, is in use.
    nonisolated static func isActive(_ phase: Phase) -> Bool {
        phase == .requesting || phase == .recording || phase == .paused
    }

    /// Pure recorder state machine. Cancel from any state goes back to idle, and only stop or limit reach
    /// done, so a cancelled take can never produce a clip.
    nonisolated static func step(_ state: RecorderState, _ event: Event) -> RecorderState {
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
    nonisolated static func shouldEmitClip(from previous: RecorderState, to next: RecorderState) -> Bool {
        isActive(previous.phase) && next.phase == .done
    }

    /// Shrinks loudness readings (0...1) to at most `AudioWaveform.maximumBarCount` bars, each the loudest
    /// reading in its slice. Empty input gives `[]`; non-finite readings count as silence.
    nonisolated static func downsamplePeaks(_ samples: [Double], count: Int = 64) -> [Double] { // literal-ok: waveform bar count shared with the web
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
    nonisolated static let holdCancelDistance: Double = HoldPolicy.slideCancelDistance

    /// Hold-to-record gesture: sliding left past 80 points means cancel, anything else keeps recording.
    nonisolated static func holdGesture(dx: Double) -> HoldOutcome {
        HoldPolicy.slideCancels(dx: dx) ? .cancel : .record
    }

    /// Whole seconds left before the limit, never below 0.
    nonisolated static func remainingSeconds(elapsed: Double, maxDuration: Double) -> Int {
        max(0, Int((maxDuration - elapsed).rounded(.up)))
    }

    /// True in the last 10 seconds of a take, when the clock switches to a countdown. Limits of 10 seconds
    /// or less never warn.
    nonisolated static func isNearLimit(elapsed: Double, maxDuration: Double) -> Bool {
        maxDuration > 10 && remainingSeconds(elapsed: elapsed, maxDuration: maxDuration) <= 10 // literal-ok: the web warning window
    }

    /// Clock text, m:ss under an hour and h:mm:ss above; the shared AudioTime format.
    nonisolated static func formatClock(_ seconds: Double) -> String {
        AudioTime.formatAudioTime(seconds)
    }

    /// Spoken time such as "1 minute 3 seconds"; the shared AudioTime wording.
    nonisolated static func spokenClock(_ seconds: Double) -> String {
        AudioTime.speakAudioTime(seconds)
    }

    /// Sentence for VoiceOver. Only discrete events are announced, never the running clock.
    nonisolated static func announcementText(_ kind: AnnouncementKind, seconds: Double = 0) -> String {
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
    nonisolated static let systemPermission: PermissionRequest = {
        #if os(iOS)
        return await AVAudioApplication.requestRecordPermission()
        #else
        return await AVCaptureDevice.requestAccess(for: .audio)
        #endif
    }
}
