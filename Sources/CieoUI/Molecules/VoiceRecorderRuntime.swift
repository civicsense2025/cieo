import AVFoundation
import Foundation

extension VoiceRecorderModel {
    func beginRecording() {
        #if os(macOS)
        guard AVCaptureDevice.default(for: .audio) != nil else {
            send(.unsupported)
            announce(.unsupported)
            return
        }
        #endif
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
            recorder.onFinished = { [weak self, weak recorder] successfully, finishedAt in
                guard let self, let recorder, self.recorder === recorder else { return }
                self.handleRecorderFinish(
                    VoiceRecorderFinishReceipt(successfully: successfully, finishedAt: finishedAt),
                    from: recorder
                )
            }
            guard recorder.prepareToRecord() else { throw CocoaError(.fileWriteUnknown) }
            let startedAt = monotonicNow()
            guard startedAt.isFinite, (startedAt + maxDuration).isFinite else { throw CocoaError(.fileWriteUnknown) }
            activeDeadline = startedAt + maxDuration
            activeSegmentDuration = maxDuration
            remainingWhenPaused = nil
            guard recorder.record(forDuration: maxDuration) else { throw CocoaError(.fileWriteUnknown) }
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

    func remainingTake(_ recorder: any VoiceRecorderDevice) -> TimeInterval {
        let deviceRemaining = remainingOnDevice(recorder)
        guard deviceRemaining.isFinite else { return .nan }
        guard let activeDeadline else { return deviceRemaining }
        let now = monotonicNow()
        guard now.isFinite else { return deviceRemaining }
        return min(deviceRemaining, max(0, activeDeadline - now))
    }

    func remainingOnDevice(_ recorder: any VoiceRecorderDevice) -> TimeInterval {
        let elapsed = recorder.currentTime
        guard elapsed.isFinite else { return .nan }
        return max(0, maxDuration - elapsed)
    }

    func hasReachedLimit(at time: TimeInterval) -> Bool {
        guard let activeDeadline, let activeSegmentDuration, time.isFinite else { return false }
        return abs(time - activeDeadline) <= Self.limitTolerance(for: activeSegmentDuration)
    }

    func handleRecorderFinish(_ receipt: VoiceRecorderFinishReceipt, from recorder: any VoiceRecorderDevice) {
        guard self.recorder === recorder else { return }
        if receipt.successfully, hasReachedLimit(at: receipt.finishedAt) { finish(.limit) }
        else { fail() }
    }

    func awaitStoppedRecorderCompletion() {
        guard state.phase == .recording || state.phase == .paused,
              stopConfirmationTimer == nil else { return }
        timer?.invalidate()
        timer = nil
        let confirmationTimer = Timer(timeInterval: Self.stoppedRecorderDelegateGrace, repeats: false) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self, let recorder = self.recorder else { return }
                guard let receipt = recorder.takePendingFinish() else { self.fail(); return }
                self.handleRecorderFinish(receipt, from: recorder)
            }
        }
        RunLoop.main.add(confirmationTimer, forMode: .common)
        stopConfirmationTimer = confirmationTimer
    }

    static func limitTolerance(for segmentDuration: TimeInterval) -> TimeInterval {
        min(limitCompletionTolerance, segmentDuration * limitCompletionToleranceFraction)
    }

    func startPolling() {
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
            if state.phase == .recording { awaitStoppedRecorderCompletion() }
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

    func finish(_ event: Event) {
        guard state.phase == .recording || state.phase == .paused, let recorder, let url = fileURL else { return }
        let duration = event == .limit ? maxDuration : min(maxDuration, (recorder.currentTime * 10).rounded() / 10) // literal-ok: tenths of a second
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

    func fail() {
        guard state.phase == .recording || state.phase == .paused else { return }
        releaseRecorder(deleteFile: true)
        level = 0
        send(.fail)
        announce(.failed)
    }

    func handleInterruptionBegan() {
        guard state.phase == .recording else { return }
        awaitStoppedRecorderCompletion()
    }

    func releaseRecorder(deleteFile: Bool) {
        session += 1
        activeDeadline = nil
        activeSegmentDuration = nil
        remainingWhenPaused = nil
        let snapshot = cleanupState.takeSnapshot()
        snapshot.clean(deleteFile: deleteFile)
        peaks = []
    }

    #if os(iOS)
    func observeInterruptions() {
        guard interruption == nil else { return }
        interruption = NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification, object: nil, queue: .main
        ) { [weak self] note in
            let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt
            MainActor.assumeIsolated {
                if raw == AVAudioSession.InterruptionType.began.rawValue { self?.handleInterruptionBegan() }
            }
        }
    }
    #endif

    func send(_ event: Event) { state = Self.step(state, event) }

    func announce(_ kind: AnnouncementKind, seconds: Double = 0) {
        announced += 1
        announcement = Announcement(id: announced, text: Self.announcementText(kind, seconds: seconds))
    }
}
