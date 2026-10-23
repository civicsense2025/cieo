import AVFoundation
import Foundation
import Observation

enum AudioSessionUse: Sendable { case playback, recording }

enum AudioSessionCategory: Sendable, Equatable { case playback, playAndRecord }

public enum AudioSessionReconciliationStatus: Sendable, Equatable {
    case ready
    case retrying(attempt: Int, maximumAttempts: Int, message: String)
    case failed(attempts: Int, message: String)
}

protocol AudioSessionBackend: Sendable {
    func setCategory(_ category: AudioSessionCategory) throws
    func setActive(_ active: Bool) throws
}

protocol AudioSessionRetryScheduler: AnyObject, Sendable {
    func schedule(after delay: TimeInterval, operation: @escaping @Sendable () -> Void)
}

private final class SystemAudioSessionRetryScheduler: AudioSessionRetryScheduler, @unchecked Sendable {
    static let shared = SystemAudioSessionRetryScheduler()

    func schedule(after delay: TimeInterval, operation: @escaping @Sendable () -> Void) {
        DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + delay, execute: operation)
    }
}

private struct SystemAudioSessionBackend: AudioSessionBackend {
    func setCategory(_ category: AudioSessionCategory) throws {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        switch category {
        case .playback:
            try session.setCategory(.playback)
        case .playAndRecord:
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
        }
        #endif
    }

    func setActive(_ active: Bool) throws {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        if active {
            try session.setActive(true)
        } else {
            try session.setActive(false, options: .notifyOthersOnDeactivation)
        }
        #endif
    }
}

protocol AudioSessionManaging: Sendable {
    var reconciliationStatus: AudioSessionReconciliationStatus { get }
    func activate(_ use: AudioSessionUse, owner: UUID) throws
    /// Removes the logical owner immediately; on backend failure, the manager retains bounded repair state.
    func deactivate(owner: UUID) throws
}

final class SystemAudioSessionManager: AudioSessionManaging, @unchecked Sendable {
    static let shared = SystemAudioSessionManager()

    private struct RetryRequest {
        let scheduler: AudioSessionRetryScheduler
        let generation: UInt64
        let attempt: Int
        let delay: TimeInterval
    }

    private static let retryDelays: [TimeInterval] = [0.05, 0.1, 0.2]

    private let lock = NSLock()
    private let backend: AudioSessionBackend
    private weak var retryScheduler: AudioSessionRetryScheduler?
    /// Logical owners only. Ended owners leave immediately, even if the OS is still active.
    private var leases: [UUID: AudioSessionUse] = [:]
    /// Last backend state confirmed by a successful call; may temporarily differ from `leases`.
    private var activeCategory: AudioSessionCategory?
    private var isActive = false
    private var status: AudioSessionReconciliationStatus = .ready
    private var retryGeneration: UInt64 = 0
    private var retriesScheduled = 0

    init() {
        backend = SystemAudioSessionBackend()
        retryScheduler = SystemAudioSessionRetryScheduler.shared
    }

    init(backend: AudioSessionBackend) {
        self.backend = backend
        retryScheduler = SystemAudioSessionRetryScheduler.shared
    }

    init(backend: AudioSessionBackend, retryScheduler: AudioSessionRetryScheduler) {
        self.backend = backend
        self.retryScheduler = retryScheduler
    }

    var reconciliationStatus: AudioSessionReconciliationStatus {
        lock.lock(); defer { lock.unlock() }
        return status
    }

    func activate(_ use: AudioSessionUse, owner: UUID) throws {
        lock.lock()
        var nextLeases = leases
        nextLeases[owner] = use
        do {
            try reconcileLocked(to: Self.category(for: nextLeases))
            leases = nextLeases
            cancelRetriesLocked()
            lock.unlock()
        } catch {
            let activationError = error
            var retryRequest: RetryRequest?
            if case .retrying = status {
                // A retry is already queued for the existing logical owners.
            } else {
                retryGeneration &+= 1
                retriesScheduled = 0
                status = .ready
                do {
                    try reconcileLocked(to: Self.category(for: leases))
                } catch {
                    retryRequest = scheduleRetryLocked(after: error)
                }
            }
            lock.unlock()
            enqueue(retryRequest)
            throw activationError
        }
    }

    func deactivate(owner: UUID) throws {
        lock.lock()
        guard leases.removeValue(forKey: owner) != nil else {
            lock.unlock()
            return
        }
        retryGeneration &+= 1
        retriesScheduled = 0
        status = .ready
        do {
            try reconcileLocked(to: Self.category(for: leases))
            lock.unlock()
        } catch {
            let retryRequest = scheduleRetryLocked(after: error)
            lock.unlock()
            enqueue(retryRequest)
            throw error
        }
    }

    /// Applies the desired state while holding `lock`. Logical leases are not restored on failure.
    private func reconcileLocked(to desiredCategory: AudioSessionCategory?) throws {
        if let desiredCategory {
            if activeCategory != desiredCategory {
                try backend.setCategory(desiredCategory)
                activeCategory = desiredCategory
            }
            if !isActive {
                try backend.setActive(true)
                isActive = true
            }
        } else if isActive {
            try backend.setActive(false)
            isActive = false
        }
    }

    /// Queues at most three retries after the original operation fails.
    private func scheduleRetryLocked(after error: Error) -> RetryRequest? {
        let message = String(describing: error)
        guard let retryScheduler else {
            status = .failed(attempts: retriesScheduled + 1, message: "Retry scheduler unavailable: \(message)")
            return nil
        }
        let attempt = retriesScheduled + 1
        guard attempt <= Self.retryDelays.count else {
            status = .failed(attempts: retriesScheduled + 1, message: message)
            return nil
        }
        retriesScheduled = attempt
        status = .retrying(attempt: attempt, maximumAttempts: Self.retryDelays.count, message: message)
        return RetryRequest(scheduler: retryScheduler, generation: retryGeneration, attempt: attempt,
                            delay: Self.retryDelays[attempt - 1])
    }

    private func enqueue(_ request: RetryRequest?) {
        guard let request else { return }
        // The scheduler owns one bounded ticket. The manager does not retain tickets, avoiding a cycle.
        let generation = request.generation
        let attempt = request.attempt
        request.scheduler.schedule(after: request.delay) { [self] in
            retryReconciliation(generation: generation, attempt: attempt)
        }
    }

    private func retryReconciliation(generation: UInt64, attempt: Int) {
        lock.lock()
        guard retryGeneration == generation,
              case .retrying(let currentAttempt, _, _) = status,
              currentAttempt == attempt else {
            lock.unlock()
            return
        }
        var retryRequest: RetryRequest?
        do {
            try reconcileLocked(to: Self.category(for: leases))
            status = .ready
            retriesScheduled = 0
        } catch {
            retryRequest = scheduleRetryLocked(after: error)
        }
        lock.unlock()
        enqueue(retryRequest)
    }

    private func cancelRetriesLocked() {
        retryGeneration &+= 1
        retriesScheduled = 0
        status = .ready
    }

    private static func category(for leases: [UUID: AudioSessionUse]) -> AudioSessionCategory? {
        guard !leases.isEmpty else { return nil }
        if leases.values.contains(where: { if case .recording = $0 { true } else { false } }) {
            return .playAndRecord
        }
        return .playback
    }
}

/// Read the process-wide audio-session repair state even after an audio model is gone.
public enum AudioSessionStatusCenter {
    public static var current: AudioSessionReconciliationStatus {
        SystemAudioSessionManager.shared.reconciliationStatus
    }
}

/// Anything the coordinator can pause when another clip starts.
@MainActor
public protocol AudioPausable: AnyObject {
    /// Stops playback, keeping the position.
    func pause()
}

/// Keeps one clip playing at a time per process: starting a model pauses the one that was playing.
@MainActor
public final class AudioPlaybackCoordinator {
    /// The coordinator every `AudioPlaybackModel` uses.
    public static let shared = AudioPlaybackCoordinator()

    private weak var current: AudioPausable?

    /// A coordinator of its own, for tests and for hosts that group clips.
    public init() {}

    /// Called when `player` starts: pauses the previous one if it is a different player.
    public func claim(_ player: AudioPausable) {
        if let previous = current, previous !== player { previous.pause() }
        current = player
    }

    /// Called when `player` stops, so a later claim does not pause a clip that is already quiet.
    public func release(_ player: AudioPausable) {
        if current === player { current = nil }
    }
}

/// The clip's lifecycle, driven by the player's events.
public enum AudioPlaybackState: Sendable, Equatable, CaseIterable {
    case loading, ready, playing, ended, error
}

/// What happens to a clip that moves its state.
public enum AudioPlaybackEvent: Sendable, Equatable, CaseIterable {
    case loadedMetadata, play, pause, ended, error, retry
}

/// One audio clip, local or remote, played with AVPlayer. Create one and hand it to `AudioPlayer`, or use
/// `AudioPlayer(url:)` and let the view own it. Playing it pauses any other model (one clip at a time),
/// and it tears down its observers when released.
///
/// Nothing here asks for permissions or touches the audio session until the first `play()`.
@MainActor
@Observable
public final class AudioPlaybackModel: AudioPausable {
    /// Where the clip is in its life.
    public private(set) var state: AudioPlaybackState = .loading
    /// Snapshot of the shared audio-session repair state. `.failed` means bounded retries were exhausted.
    public var audioSessionStatus: AudioSessionReconciliationStatus { sessionManager.reconciliationStatus }
    /// Playhead in seconds.
    public private(set) var currentTime: TimeInterval = 0
    /// Clip length in seconds once known (or given up front).
    public private(set) var duration: TimeInterval?
    /// Playback speed, where 1 is normal.
    public private(set) var rate: Double = 1

    /// Fires when playback starts.
    @ObservationIgnored public var onPlay: (() -> Void)?
    /// Fires when playback pauses (not when the clip ends).
    @ObservationIgnored public var onPause: (() -> Void)?
    /// Fires when the clip reaches its end.
    @ObservationIgnored public var onEnded: (() -> Void)?
    /// Fires with the playhead as it moves.
    @ObservationIgnored public var onTimeUpdate: ((TimeInterval) -> Void)?

    /// Seconds between playhead updates while playing: fine enough for a smooth fill.
    public nonisolated static let tickInterval: TimeInterval = 0.05

    @ObservationIgnored private let url: URL?
    @ObservationIgnored private let coordinator: AudioPlaybackCoordinator
    @ObservationIgnored private let sessionManager: AudioSessionManaging
    @ObservationIgnored private var engineSessionOwner: UUID?
    @ObservationIgnored private var engine: Engine?
    @ObservationIgnored private var simulation: Task<Void, Never>?

    /// Plays the audio at `url` (a file or a remote address). `duration` is the length when known, so the
    /// clock is right before metadata loads.
    public convenience init(url: URL, duration: TimeInterval? = nil, coordinator: AudioPlaybackCoordinator? = nil) {
        self.init(url: url, duration: duration, coordinator: coordinator, sessionManager: SystemAudioSessionManager.shared)
    }

    init(url: URL, duration: TimeInterval? = nil, coordinator: AudioPlaybackCoordinator? = nil,
         sessionManager: AudioSessionManaging) {
        self.url = url
        self.duration = Self.usable(duration)
        self.coordinator = coordinator ?? .shared
        self.sessionManager = sessionManager
        let owner = UUID()
        engineSessionOwner = owner
        let engine = Engine(url: url, sessionManager: sessionManager, sessionOwner: owner)
        self.engine = engine
        engine.attach(self)
    }

    /// A model with no audio behind it: it moves through the same states and advances time on its own, so
    /// previews, galleries and tests never touch the network or the speakers.
    public init(simulatedDuration: TimeInterval, state: AudioPlaybackState = .ready,
                currentTime: TimeInterval = 0, coordinator: AudioPlaybackCoordinator? = nil) {
        self.url = nil
        self.duration = Self.usable(simulatedDuration)
        self.state = state
        self.currentTime = currentTime
        self.coordinator = coordinator ?? .shared
        self.sessionManager = SystemAudioSessionManager.shared
        engineSessionOwner = nil
    }

    /// Releases the audio and observers. Safe to call more than once; also runs when the model goes away.
    public func teardown() {
        simulation?.cancel()
        simulation = nil
        engine?.teardown()
        engine = nil
        engineSessionOwner = nil
        coordinator.release(self)
    }

    deinit {
        simulation?.cancel()
        engine?.teardown()
    }

    // MARK: Controls

    /// Starts or resumes playback, from the start when the clip had ended. Pauses any other clip.
    public func play() {
        guard state != .error else { return }
        if state == .ended { seek(to: 0) }
        coordinator.claim(self)
        if let engine {
            do { try engine.activateSession() }
            catch {
                finishFailure(owner: engineSessionOwner)
                return
            }
            engine.play(rate: rate)
        } else {
            startSimulation()
        }
        apply(.play)
    }

    /// Pauses playback, keeping the position.
    public func pause() {
        guard state == .playing else { return }
        engine?.pause()
        engine?.deactivateSession()
        simulation?.cancel()
        simulation = nil
        coordinator.release(self)
        apply(.pause)
    }

    /// Play when paused, pause when playing.
    public func toggle() {
        if state == .playing { pause() } else { play() }
    }

    /// Moves the playhead, clamped to the clip.
    public func seek(to seconds: TimeInterval) {
        let t = Self.clamp(seconds, to: duration)
        currentTime = t
        engine?.seek(to: t)
        onTimeUpdate?(t)
    }

    /// Changes the playback speed; applies at once while playing.
    public func setRate(_ newRate: Double) {
        guard newRate.isFinite, newRate > 0 else { return }
        rate = newRate
        engine?.setRate(newRate, playing: state == .playing)
    }

    /// Tries a clip that failed to load again.
    public func retry() {
        guard state == .error else { return }
        apply(.retry)
        if let url {
            engine?.teardown()
            let owner = UUID()
            let fresh = Engine(url: url, sessionManager: sessionManager, sessionOwner: owner)
            engine = fresh
            engineSessionOwner = owner
            fresh.attach(self)
        } else {
            apply(.loadedMetadata)
        }
    }

    // MARK: State machine

    /// The state after `event`. Error is sticky until retry; ended returns to ready-to-play on the next
    /// play; pause only moves a playing clip.
    public nonisolated static func step(_ state: AudioPlaybackState, _ event: AudioPlaybackEvent) -> AudioPlaybackState {
        if event == .retry { return state == .error ? .loading : state }
        if state == .error { return state }
        switch event {
        case .error: return .error
        case .loadedMetadata: return state == .loading ? .ready : state
        case .play: return .playing
        case .pause: return state == .playing ? .ready : state
        case .ended: return .ended
        case .retry: return state
        }
    }

    func apply(_ event: AudioPlaybackEvent) {
        let before = state
        state = Self.step(state, event)
        guard before != state else { return }
        switch (event, state) {
        case (.play, .playing): onPlay?()
        case (.pause, _): onPause?()
        case (.ended, .ended): onEnded?()
        default: break
        }
    }

    // MARK: Engine callbacks

    func engineLoaded(duration: TimeInterval?, owner: UUID) {
        guard engineSessionOwner == owner else { return }
        if let d = Self.usable(duration) { self.duration = d }
        apply(.loadedMetadata)
    }

    func engineTime(_ seconds: TimeInterval) {
        guard seconds.isFinite else { return }
        currentTime = Self.clamp(seconds, to: duration)
        onTimeUpdate?(currentTime)
    }

    func engineTime(_ seconds: TimeInterval, owner: UUID) {
        guard engineSessionOwner == owner else { return }
        engineTime(seconds)
    }

    func engineEnded() {
        finishPlayback(owner: engineSessionOwner)
    }

    func engineEnded(owner: UUID) {
        guard engineSessionOwner == owner else { return }
        finishPlayback(owner: owner)
    }

    private func finishPlayback(owner: UUID?) {
        engine?.seek(to: 0)
        if owner != nil { engine?.deactivateSession() }
        currentTime = 0
        coordinator.release(self)
        apply(.ended)
    }

    func engineFailed() {
        finishFailure(owner: engineSessionOwner)
    }

    func engineFailed(owner: UUID) {
        guard engineSessionOwner == owner else { return }
        finishFailure(owner: owner)
    }

    private func finishFailure(owner: UUID?) {
        if owner != nil { engine?.deactivateSession() }
        coordinator.release(self)
        apply(.error)
    }

    private func startSimulation() {
        simulation?.cancel()
        simulation = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(Self.tickInterval))
                guard let self, !Task.isCancelled, self.state == .playing else { return }
                let next = self.currentTime + Self.tickInterval * self.rate
                if let d = self.duration, next >= d { self.engineEnded(); return }
                self.engineTime(next)
            }
        }
    }

    nonisolated static func usable(_ seconds: TimeInterval?) -> TimeInterval? {
        guard let seconds, seconds.isFinite, seconds > 0 else { return nil }
        return seconds
    }

    nonisolated static func clamp(_ seconds: TimeInterval, to duration: TimeInterval?) -> TimeInterval {
        guard seconds.isFinite else { return 0 }
        let low = max(0, seconds)
        return duration.map { min($0, low) } ?? low
    }
}

/// The AVFoundation side: one AVPlayer and the observers on it. Not main-actor isolated so a model's
/// deinit can tear it down.
private final class Engine: @unchecked Sendable {
    private let player: AVPlayer
    private let item: AVPlayerItem
    private let sessionManager: AudioSessionManaging
    private let sessionOwner: UUID
    private var timeObserver: Any?
    private var tokens: [NSObjectProtocol] = []
    private var observations: [NSKeyValueObservation] = []

    init(url: URL, sessionManager: AudioSessionManaging, sessionOwner: UUID) {
        item = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: item)
        self.sessionManager = sessionManager
        self.sessionOwner = sessionOwner
        player.automaticallyWaitsToMinimizeStalling = true
    }

    @MainActor
    func attach(_ model: AudioPlaybackModel) {
        let owner = sessionOwner
        observations.append(item.observe(\.status, options: [.initial, .new]) { [weak model] item, _ in
            let status = item.status
            let length = item.duration.seconds
            Task { @MainActor [weak model] in
                switch status {
                case .readyToPlay: model?.engineLoaded(duration: length, owner: owner)
                case .failed: model?.engineFailed(owner: owner)
                default: break
                }
            }
        })
        observations.append(item.observe(\.duration, options: [.new]) { [weak model] item, _ in
            let length = item.duration.seconds
            Task { @MainActor [weak model] in
                if length.isFinite, length > 0 { model?.engineLoaded(duration: length, owner: owner) }
            }
        })
        timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: AudioPlaybackModel.tickInterval, preferredTimescale: 600),
            queue: .main
        ) { [weak model] time in
            MainActor.assumeIsolated {
                guard let model, model.state == .playing else { return }
                model.engineTime(time.seconds, owner: owner)
            }
        }
        tokens.append(NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: item, queue: .main) { [weak model] _ in
            MainActor.assumeIsolated { model?.engineEnded(owner: owner) }
        })
        tokens.append(NotificationCenter.default.addObserver(forName: .AVPlayerItemFailedToPlayToEndTime, object: item, queue: .main) { [weak model] _ in
            MainActor.assumeIsolated { model?.engineFailed(owner: owner) }
        })
    }

    /// Configures the audio session for playback, on iOS and only when the reader presses play.
    func activateSession() throws {
        try sessionManager.activate(.playback, owner: sessionOwner)
    }

    func deactivateSession() { try? sessionManager.deactivate(owner: sessionOwner) }

    func play(rate: Double) {
        player.defaultRate = Float(rate)
        player.play()
    }

    func pause() { player.pause() }

    func setRate(_ rate: Double, playing: Bool) {
        player.defaultRate = Float(rate)
        if playing { player.rate = Float(rate) }
    }

    func seek(to seconds: TimeInterval) {
        player.seek(to: CMTime(seconds: seconds, preferredTimescale: 600))
    }

    func teardown() {
        player.pause()
        deactivateSession()
        if let timeObserver { player.removeTimeObserver(timeObserver) }
        timeObserver = nil
        tokens.forEach(NotificationCenter.default.removeObserver)
        tokens.removeAll()
        observations.forEach { $0.invalidate() }
        observations.removeAll()
    }
}
