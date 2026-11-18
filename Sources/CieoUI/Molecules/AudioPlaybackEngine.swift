import AVFoundation
import Foundation

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

/// The AVFoundation side: one AVPlayer and the observers on it. Not main-actor isolated so a model's
/// deinit can tear it down.
final class AudioPlaybackEngine: @unchecked Sendable {
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
