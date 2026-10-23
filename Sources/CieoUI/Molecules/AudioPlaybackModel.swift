import AVFoundation
import Observation

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
    @ObservationIgnored private var engine: Engine?
    @ObservationIgnored private var simulation: Task<Void, Never>?

    /// Plays the audio at `url` (a file or a remote address). `duration` is the length when known, so the
    /// clock is right before metadata loads.
    public init(url: URL, duration: TimeInterval? = nil, coordinator: AudioPlaybackCoordinator? = nil) {
        self.url = url
        self.duration = Self.usable(duration)
        self.coordinator = coordinator ?? .shared
        let engine = Engine(url: url)
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
    }

    /// Releases the audio and observers. Safe to call more than once; also runs when the model goes away.
    public func teardown() {
        simulation?.cancel()
        simulation = nil
        engine?.teardown()
        engine = nil
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
            engine.activateSession()
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
            let fresh = Engine(url: url)
            engine = fresh
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

    func engineLoaded(duration: TimeInterval?) {
        if let d = Self.usable(duration) { self.duration = d }
        apply(.loadedMetadata)
    }

    func engineTime(_ seconds: TimeInterval) {
        guard seconds.isFinite else { return }
        currentTime = Self.clamp(seconds, to: duration)
        onTimeUpdate?(currentTime)
    }

    func engineEnded() {
        engine?.seek(to: 0)
        currentTime = 0
        coordinator.release(self)
        apply(.ended)
    }

    func engineFailed() {
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
    private var timeObserver: Any?
    private var tokens: [NSObjectProtocol] = []
    private var observations: [NSKeyValueObservation] = []

    init(url: URL) {
        item = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: item)
        player.automaticallyWaitsToMinimizeStalling = true
    }

    @MainActor
    func attach(_ model: AudioPlaybackModel) {
        observations.append(item.observe(\.status, options: [.initial, .new]) { [weak model] item, _ in
            let status = item.status
            let length = item.duration.seconds
            Task { @MainActor [weak model] in
                switch status {
                case .readyToPlay: model?.engineLoaded(duration: length)
                case .failed: model?.engineFailed()
                default: break
                }
            }
        })
        observations.append(item.observe(\.duration, options: [.new]) { [weak model] item, _ in
            let length = item.duration.seconds
            Task { @MainActor [weak model] in
                if length.isFinite, length > 0 { model?.engineLoaded(duration: length) }
            }
        })
        timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: AudioPlaybackModel.tickInterval, preferredTimescale: 600),
            queue: .main
        ) { [weak model] time in
            MainActor.assumeIsolated {
                guard let model, model.state == .playing else { return }
                model.engineTime(time.seconds)
            }
        }
        tokens.append(NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: item, queue: .main) { [weak model] _ in
            MainActor.assumeIsolated { model?.engineEnded() }
        })
        tokens.append(NotificationCenter.default.addObserver(forName: .AVPlayerItemFailedToPlayToEndTime, object: item, queue: .main) { [weak model] _ in
            MainActor.assumeIsolated { model?.engineFailed() }
        })
    }

    /// Configures the audio session for playback, on iOS and only when the reader presses play.
    func activateSession() {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback)
        try? session.setActive(true)
        #endif
    }

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
        if let timeObserver { player.removeTimeObserver(timeObserver) }
        timeObserver = nil
        tokens.forEach(NotificationCenter.default.removeObserver)
        tokens.removeAll()
        observations.forEach { $0.invalidate() }
        observations.removeAll()
    }
}
