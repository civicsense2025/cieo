import SwiftUI

/// One audio clip with play/pause, a waveform or progress scrubber, the clock and, in the full variant,
/// speed and time left. Only one player plays at a time per process.
///
/// Drop it in with a URL and it owns its audio; or create an `AudioPlaybackModel` yourself and pass it
/// when the host needs to control or observe the clip. Nothing is requested until the reader presses play.
public struct AudioPlayer: View {
    /// Compact is the voice-note pill for comments and message bubbles; full adds speed and time left.
    public enum Variant: Sendable, CaseIterable { case compact, full }

    @Environment(\.componentMetrics) private var metrics
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var ownedModel: AudioPlaybackModel?
    private let injected: AudioPlaybackModel?
    private let url: URL?
    private let knownDuration: TimeInterval?
    private let label: String
    private let peaks: [Double]
    private let variant: Variant
    private let rates: [Double]

    /// Plays the clip at `url` with a model the view creates and keeps. `peaks` draw a waveform scrubber;
    /// without them a thin progress track is drawn. `duration` makes the clock right before metadata loads.
    public init(url: URL, label: String, peaks: [Double] = [], duration: TimeInterval? = nil,
                variant: Variant = .compact, rates: [Double] = PlaybackRateButton.defaultRates) {
        self.injected = nil
        self.url = url
        self.knownDuration = duration
        self.label = label
        self.peaks = peaks
        self.variant = variant
        self.rates = rates
    }

    /// Plays a model the host owns, so the host can pause it, seek it or read its state.
    public init(model: AudioPlaybackModel, label: String, peaks: [Double] = [],
                variant: Variant = .compact, rates: [Double] = PlaybackRateButton.defaultRates) {
        self.injected = model
        self.url = nil
        self.knownDuration = nil
        self.label = label
        self.peaks = peaks
        self.variant = variant
        self.rates = rates
    }

    private var activeModel: AudioPlaybackModel? {
        injected ?? ownedModel
    }

    public var body: some View {
        content(activeModel)
            .accessibilityElement(children: .contain)
            .accessibilityLabel(label)
            .onAppear {
                if injected == nil, ownedModel == nil, let url {
                    ownedModel = AudioPlaybackModel(url: url, duration: knownDuration)
                }
            }
            .onChange(of: url) { _, nextURL in
                guard injected == nil else { return }
                ownedModel?.teardown()
                ownedModel = nextURL.map { AudioPlaybackModel(url: $0, duration: knownDuration) }
            }
            .onDisappear {
                activeModel?.pause()
            }
    }

    @ViewBuilder
    private func content(_ model: AudioPlaybackModel?) -> some View {
        let state = model?.state ?? .loading
        let current = model?.currentTime ?? 0
        let known = model?.duration ?? AudioPlaybackModel.usable(knownDuration)
        let currentRate = model?.rate ?? 1
        let playing = state == .playing
        let button = AudioPlayButton(playing: playing, loading: state == .loading, label: label,
                                     size: variant == .full ? .large : .medium) { model?.toggle() }
        let scrubber = scrubber(model, state: state, current: current, duration: known ?? 0)
        if typeSize.isAccessibilitySize {
            VStack(alignment: .leading, spacing: metrics.compact) {
                button
                scrubber
                clocks(state: state, current: current, known: known)
                if variant == .full && state != .error { rate(model, currentRate: currentRate) }
            }
        } else if variant == .full {
            HStack(spacing: metrics.medium) {
                button
                VStack(alignment: .leading, spacing: metrics.tight) {
                    scrubber
                    clocks(state: state, current: current, known: known)
                }
                if state != .error { rate(model, currentRate: currentRate) }
            }
        } else {
            HStack(spacing: metrics.compact) {
                button
                scrubber
                if state != .error { clocks(state: state, current: current, known: known) }
            }
        }
    }

    @ViewBuilder
    private func clocks(state: AudioPlaybackState, current: TimeInterval, known: TimeInterval?) -> some View {
        switch variant {
        case .compact:
            let resting = current < 1 && state != .playing
            AudioTime(current: current, duration: known, mode: resting ? .total : .remaining)
        case .full:
            HStack {
                AudioTime(current: current)
                Spacer(minLength: metrics.compact)
                AudioTime(current: current, duration: known, mode: known == nil ? .elapsed : .remaining)
            }
        }
    }

    private func rate(_ model: AudioPlaybackModel?, currentRate: Double) -> some View {
        PlaybackRateButton(rate: currentRate, rates: rates) { model?.setRate($0) }
    }

    @ViewBuilder
    private func scrubber(_ model: AudioPlaybackModel?, state: AudioPlaybackState,
                          current: TimeInterval, duration: TimeInterval) -> some View {
        if state == .error {
            HStack(spacing: metrics.compact) {
                StatusLabel("Couldn't play this clip", icon: .error, tone: .danger)
                Button("Retry") { model?.retry() }
                    .buttonStyle(ActionButtonStyle(.quiet))
            }
        } else if peaks.isEmpty {
            ProgressTrack(current: current, duration: duration, label: "Seek in \(label)") {
                model?.seek(to: $0)
            }
        } else {
            AudioWaveform(peaks: peaks, duration: duration, current: current,
                          label: "Seek in \(label)") { model?.seek(to: $0) }
        }
    }
}

/// A thin progress track that scrubs, for a clip with no peaks.
private struct ProgressTrack: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    let current: TimeInterval
    let duration: TimeInterval
    let label: String
    let onSeek: (TimeInterval) -> Void
    @FocusState private var focused: Bool

    var body: some View {
        let progress = duration > 0 ? min(1, max(0, current / duration)) : 0
        GeometryReader { proxy in
            ZStack(alignment: .leading) {
                Capsule().fill(theme.track)
                Capsule().fill(theme.accent).frame(width: proxy.size.width * progress)
            }
            .frame(height: metrics.thinBar)
            .frame(maxHeight: .infinity)
            .contentShape(.rect)
            .gesture(DragGesture(minimumDistance: 0).onChanged {
                onSeek(AudioWaveform.seekFromPointer($0.location.x, width: proxy.size.width, duration: duration))
            })
        }
        .frame(height: metrics.touchTarget)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
        .modifier(SeekSemantics(onSeek: onSeek, current: current, duration: duration, focused: $focused))
    }
}

#Preview("Compact and full") {
    VStack(spacing: 16) { // literal-ok: preview layout
        AudioPlayer(model: AudioPlaybackModel(simulatedDuration: 63, currentTime: 20), label: "Voice note from Ava",
                    peaks: (0..<60).map { abs(sin(Double($0) / 5)) })
        AudioPlayer(model: AudioPlaybackModel(simulatedDuration: 252), label: "Committee briefing", variant: .full)
        AudioPlayer(model: AudioPlaybackModel(simulatedDuration: 63, state: .error), label: "Missing clip")
    }
    .padding()
}
