@testable import CieoUI
import SwiftUI
import XCTest

@MainActor
private final class FakePlayer: AudioPausable {
    var pauses = 0
    func pause() { pauses += 1 }
}

final class AudioPlaybackTests: XCTestCase {
    // MARK: AudioTime

    func testFormatReadsMinutesThenHoursAndNeverNegative() {
        XCTAssertEqual(AudioTime.formatAudioTime(0), "0:00")
        XCTAssertEqual(AudioTime.formatAudioTime(63.9), "1:03")
        XCTAssertEqual(AudioTime.formatAudioTime(3605), "1:00:05")
        XCTAssertEqual(AudioTime.formatAudioTime(-4), "0:00")
        XCTAssertEqual(AudioTime.formatAudioTime(.infinity), "0:00")
        XCTAssertEqual(AudioTime.formatAudioTime(.nan), "0:00")
        XCTAssertEqual(AudioTime.speakAudioTime(63), "1 minute 3 seconds")
        XCTAssertEqual(AudioTime.speakAudioTime(0), "0 seconds")
        XCTAssertEqual(AudioTime.speakAudioTime(3660), "1 hour 1 minute")
        XCTAssertEqual(AudioTime.speakAudioTime(1), "1 second")
    }

    func testTimeModesShowElapsedRemainingTotalAndUnknownLength() {
        XCTAssertEqual(AudioTime.text(current: 12, duration: 63, mode: .elapsed), "0:12 / 1:03")
        XCTAssertEqual(AudioTime.text(current: 12, duration: nil, mode: .elapsed), "0:12")
        XCTAssertEqual(AudioTime.text(current: 12, duration: 63, mode: .remaining), "-0:51")
        XCTAssertEqual(AudioTime.text(current: 90, duration: 63, mode: .remaining), "-0:00")
        XCTAssertEqual(AudioTime.text(current: 12, duration: nil, mode: .remaining), "0:12")
        XCTAssertEqual(AudioTime.text(current: 0, duration: 63, mode: .total), "1:03")
        XCTAssertEqual(AudioTime.text(current: 0, duration: nil, mode: .total), "--:--")
        XCTAssertEqual(AudioTime.spoken(current: 12, duration: 63, mode: .elapsed), "12 seconds of 1 minute 3 seconds")
        XCTAssertEqual(AudioTime.spoken(current: 12, duration: 63, mode: .remaining), "51 seconds left")
        XCTAssertEqual(AudioTime.spoken(current: 0, duration: nil, mode: .total), "length unknown")
    }

    // MARK: AudioPlayButton and PlaybackRateButton

    func testPlayButtonNamesTheActionAfterTheClip() {
        XCTAssertEqual(AudioPlayButton.accessibleName(playing: false, label: "Note"), "Play Note")
        XCTAssertEqual(AudioPlayButton.accessibleName(playing: true, label: "Note"), "Pause Note")
    }

    func testPlayButtonSizesNeverDropBelowTheTouchTarget() {
        let metrics = ComponentMetrics()
        let sides = AudioPlayButton.Size.allCases.map { AudioPlayButton.diameter($0, metrics: metrics) }
        XCTAssertTrue(sides.allSatisfy { $0 >= metrics.touchTarget })
        XCTAssertEqual(sides, sides.sorted())
    }

    func testPlayPauseMorphMovesFromATriangleToTwoBars() {
        let play = PlayPauseShape.points(pause: 0), pause = PlayPauseShape.points(pause: 1), mid = PlayPauseShape.points(pause: 0.5)
        XCTAssertEqual(play[1].map(\.y).max(), 0.73, "play's right half narrows to the tip")
        XCTAssertEqual(pause[0].map(\.y).sorted(), [0, 0, 1, 1], "a pause bar runs the full height")
        XCTAssertLessThan(pause[0].map(\.x).max()!, pause[1].map(\.x).min()!, "two separate bars")
        XCTAssertNotEqual(mid, play)
        XCTAssertNotEqual(mid, pause)
        XCTAssertEqual(PlayPauseShape.points(pause: -3), play)
        XCTAssertEqual(PlayPauseShape.points(pause: 9), pause)
    }

    func testNextRateCyclesWrapsRestartsOnUnknownAndToleratesEmpty() {
        XCTAssertEqual(PlaybackRateButton.nextRate([1, 1.5, 2], after: 1), 1.5)
        XCTAssertEqual(PlaybackRateButton.nextRate([1, 1.5, 2], after: 2), 1)
        XCTAssertEqual(PlaybackRateButton.nextRate([1, 1.5, 2], after: 0.75), 1)
        XCTAssertEqual(PlaybackRateButton.nextRate([], after: 1.5), 1.5)
    }

    func testRateShowsTimesSignAndNamesItInWords() {
        XCTAssertEqual(PlaybackRateButton.display(1.5), "1.5×".replacingOccurrences(of: ".", with: Locale.current.decimalSeparator ?? "."))
        XCTAssertEqual(PlaybackRateButton.display(2), "2×")
        XCTAssertEqual(PlaybackRateButton.accessibleName(2), "Playback speed, 2 times")
        XCTAssertEqual(PlaybackRateButton.accessibleName(1), "Playback speed, 1 time")
        XCTAssertTrue(PlaybackRateButton.accessibleName(1.5).hasPrefix("Playback speed, 1"))
    }

    // MARK: AudioWaveform

    func testBarsBucketByMaxNormalizeToOneAndKeepTheFloor() {
        XCTAssertEqual(AudioWaveform.waveformBars([0.1, 0.5, 0.2, 1], count: 2), [0.5, 1])
        let bars = AudioWaveform.waveformBars([0, 0.2, 0.4], count: 3)
        XCTAssertEqual(bars[2], 1)
        XCTAssertEqual(bars[0], AudioWaveform.floor)
        XCTAssertTrue(bars.allSatisfy { $0 >= AudioWaveform.floor && $0 <= 1 })
    }

    func testBarEdgesEmptySilentFewPeaksBadValuesZeroCount() {
        XCTAssertEqual(AudioWaveform.waveformBars([], count: 4), [0.08, 0.08, 0.08, 0.08])
        XCTAssertEqual(AudioWaveform.waveformBars([0, 0], count: 3), [0.08, 0.08, 0.08])
        XCTAssertEqual(AudioWaveform.waveformBars([0.3, 0.9], count: 6).count, 6)
        XCTAssertTrue(AudioWaveform.waveformBars([.nan, 1, -1], count: 3).allSatisfy { $0.isFinite && $0 > 0 })
        XCTAssertEqual(AudioWaveform.waveformBars([1], count: 0), [])
        XCTAssertEqual(AudioWaveform.waveformBars([1], count: -3), [])
    }

    func testSeekFromPointerMapsAndClamps() {
        XCTAssertEqual(AudioWaveform.seekFromPointer(50, width: 100, duration: 60), 30)
        XCTAssertEqual(AudioWaveform.seekFromPointer(-20, width: 100, duration: 60), 0)
        XCTAssertEqual(AudioWaveform.seekFromPointer(500, width: 100, duration: 60), 60)
        XCTAssertEqual(AudioWaveform.seekFromPointer(10, width: 0, duration: 60), 0)
        XCTAssertEqual(AudioWaveform.seekFromPointer(10, width: 100, duration: .nan), 0)
        XCTAssertEqual(AudioWaveform.seekFromPointer(10, width: 100, duration: 0), 0)
    }

    func testKeyStepMapArrowsFivePagesTenPercentEndsClampedOthersNil() {
        let step = AudioWaveform.waveformKeyStep
        XCTAssertEqual(step("ArrowRight", 10, 63), 15)
        XCTAssertEqual(step("ArrowUp", 10, 63), 15)
        XCTAssertEqual(step("ArrowLeft", 10, 63), 5)
        XCTAssertEqual(step("ArrowDown", 2, 63), 0)
        XCTAssertEqual(step("ArrowRight", 61, 63), 63)
        XCTAssertEqual(step("PageUp", 10, 100), 20)
        XCTAssertEqual(step("PageDown", 5, 100), 0)
        XCTAssertEqual(step("Home", 40, 100), 0)
        XCTAssertEqual(step("End", 40, 100), 100)
        XCTAssertNil(step("a", 40, 100))
        XCTAssertNil(step(" ", 40, 100))
    }

    func testSeekTextIsSpoken() {
        XCTAssertEqual(AudioWaveform.seekText(current: 12, duration: 63), "12 seconds of 1 minute 3 seconds")
    }

    // MARK: AudioPlayer state machine and coordinator

    func testEveryTransitionOfTheStateMachine() {
        let step = AudioPlaybackModel.step
        XCTAssertEqual(step(.loading, .loadedMetadata), .ready)
        XCTAssertEqual(step(.loading, .play), .playing)
        XCTAssertEqual(step(.loading, .error), .error)
        XCTAssertEqual(step(.ready, .play), .playing)
        XCTAssertEqual(step(.ready, .loadedMetadata), .ready)
        XCTAssertEqual(step(.playing, .pause), .ready)
        XCTAssertEqual(step(.playing, .loadedMetadata), .playing)
        XCTAssertEqual(step(.playing, .ended), .ended)
        XCTAssertEqual(step(.playing, .error), .error)
        XCTAssertEqual(step(.ended, .play), .playing)
        XCTAssertEqual(step(.ended, .pause), .ended)
        XCTAssertEqual(step(.ready, .pause), .ready)
    }

    func testPauseThenEndedLandsOnEndedErrorIsStickyUntilRetry() {
        let step = AudioPlaybackModel.step
        XCTAssertEqual(step(step(.playing, .pause), .ended), .ended)
        for event in [AudioPlaybackEvent.loadedMetadata, .play, .pause, .ended] {
            XCTAssertEqual(step(.error, event), .error)
        }
        XCTAssertEqual(step(.error, .retry), .loading)
        XCTAssertEqual(step(.playing, .retry), .playing)
        XCTAssertEqual(step(step(.error, .retry), .loadedMetadata), .ready)
    }

    @MainActor
    func testStartingOnePlayerPausesThePreviousOnly() {
        let coordinator = AudioPlaybackCoordinator()
        let a = FakePlayer(), b = FakePlayer()
        coordinator.claim(a)
        coordinator.claim(a)
        XCTAssertEqual(a.pauses, 0)
        coordinator.claim(b)
        XCTAssertEqual(a.pauses, 1)
        XCTAssertEqual(b.pauses, 0)
        coordinator.release(b)
        coordinator.claim(a)
        XCTAssertEqual(b.pauses, 0, "a released player is not paused again")
    }

    @MainActor
    func testModelsSharingACoordinatorPlayOneAtATime() {
        let coordinator = AudioPlaybackCoordinator()
        let a = AudioPlaybackModel(simulatedDuration: 30, coordinator: coordinator)
        let b = AudioPlaybackModel(simulatedDuration: 30, coordinator: coordinator)
        a.play()
        XCTAssertEqual(a.state, .playing)
        b.play()
        XCTAssertEqual(b.state, .playing)
        XCTAssertEqual(a.state, .ready, "the first clip pauses when the second starts")
        a.teardown(); b.teardown()
    }

    @MainActor
    func testModelSeekClampsAndEndedPlaysFromTheStart() {
        let model = AudioPlaybackModel(simulatedDuration: 10, coordinator: AudioPlaybackCoordinator())
        model.seek(to: 99)
        XCTAssertEqual(model.currentTime, 10)
        model.seek(to: -5)
        XCTAssertEqual(model.currentTime, 0)
        model.seek(to: .nan)
        XCTAssertEqual(model.currentTime, 0)
        let ended = AudioPlaybackModel(simulatedDuration: 10, state: .ended, currentTime: 10, coordinator: AudioPlaybackCoordinator())
        ended.play()
        XCTAssertEqual(ended.state, .playing)
        XCTAssertEqual(ended.currentTime, 0)
        ended.teardown(); model.teardown()
    }

    @MainActor
    func testRateRejectsNonsenseAndErrorBlocksPlayUntilRetry() {
        let model = AudioPlaybackModel(simulatedDuration: 10, state: .error, coordinator: AudioPlaybackCoordinator())
        model.play()
        XCTAssertEqual(model.state, .error)
        model.setRate(.nan); model.setRate(0); model.setRate(-1)
        XCTAssertEqual(model.rate, 1)
        model.setRate(1.5)
        XCTAssertEqual(model.rate, 1.5)
        model.retry()
        XCTAssertEqual(model.state, .ready)
        model.teardown()
    }

    @MainActor
    func testCallbacksFireOnPlayAndPause() {
        let model = AudioPlaybackModel(simulatedDuration: 10, coordinator: AudioPlaybackCoordinator())
        var log: [String] = []
        model.onPlay = { log.append("play") }
        model.onPause = { log.append("pause") }
        model.play(); model.pause()
        XCTAssertEqual(log, ["play", "pause"])
        model.teardown()
    }

    @MainActor
    func testRemoteModelStartsLoadingAndTearsDownTwiceWithoutHarm() {
        let model = AudioPlaybackModel(url: URL(string: "https://example.invalid/clip.m4a")!, duration: 63, coordinator: AudioPlaybackCoordinator())
        XCTAssertEqual(model.duration, 63)
        XCTAssertEqual(model.currentTime, 0)
        model.teardown()
        model.teardown()
    }

    // MARK: AudioTranscript

    private let words = [AudioTranscript.Word("Hello", start: 1, end: 1.5), .init("there,", start: 1.6, end: 2), .init("friend.", start: 3, end: 3.6)]

    func testActiveWordBeforeFirstGapsBoundariesAndEnd() {
        let at = { AudioTranscript.activeWordIndex(self.words, at: $0) }
        XCTAssertEqual(at(0), -1)
        XCTAssertEqual(at(0.99), -1)
        XCTAssertEqual(at(1), 0)
        XCTAssertEqual(at(1.55), 0)
        XCTAssertEqual(at(1.6), 1)
        XCTAssertEqual(at(2.5), 1)
        XCTAssertEqual(at(3), 2)
        XCTAssertEqual(at(99), 2)
        XCTAssertEqual(AudioTranscript.activeWordIndex([], at: 5), -1)
        XCTAssertEqual(at(.nan), -1)
    }

    func testActiveWordScalesToLongTranscripts() {
        let long = (0..<5000).map { AudioTranscript.Word("w", start: Double($0), end: Double($0) + 0.9) }
        XCTAssertEqual(AudioTranscript.activeWordIndex(long, at: 2500.4), 2500)
        XCTAssertEqual(AudioTranscript.activeWordIndex(long, at: 4999.99), 4999)
    }

    func testKeyStepMovesTheMarkerAndClamps() {
        let step = AudioTranscript.transcriptKeyStep
        XCTAssertEqual(step("ArrowRight", 0, 3), 1)
        XCTAssertEqual(step("ArrowRight", 2, 3), 2)
        XCTAssertEqual(step("ArrowLeft", 0, 3), 0)
        XCTAssertEqual(step("ArrowLeft", 2, 3), 1)
        XCTAssertEqual(step("Home", 2, 3), 0)
        XCTAssertEqual(step("End", 0, 3), 2)
        XCTAssertNil(step("x", 0, 3))
        XCTAssertNil(step("ArrowRight", 0, 0))
    }

    func testAutoScrollYieldsToTheReaderForFourSecondsAndOnlyWhenOutOfView() {
        XCTAssertTrue(AudioTranscript.shouldAutoScroll(now: 10, lastUserScroll: nil))
        XCTAssertFalse(AudioTranscript.shouldAutoScroll(now: 10, lastUserScroll: 7))
        XCTAssertTrue(AudioTranscript.shouldAutoScroll(now: 10, lastUserScroll: 6))
        XCTAssertNil(AudioTranscript.transcriptScrollTop(wordTop: 100, wordHeight: 20, viewHeight: 200, scrollTop: 0))
        XCTAssertEqual(AudioTranscript.transcriptScrollTop(wordTop: 500, wordHeight: 20, viewHeight: 200, scrollTop: 0), 410)
        XCTAssertEqual(AudioTranscript.transcriptScrollTop(wordTop: 10, wordHeight: 20, viewHeight: 200, scrollTop: 300), 0)
    }

    // MARK: Rendering

    @MainActor
    func testEveryComponentRendersAtPhoneWidthInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let model = AudioPlaybackModel(simulatedDuration: 63, currentTime: 20, coordinator: AudioPlaybackCoordinator())
            let failed = AudioPlaybackModel(simulatedDuration: 63, state: .error, coordinator: AudioPlaybackCoordinator())
            let peaks = (0..<80).map { abs(sin(Double($0) / 5)) }
            let view = VStack(alignment: .leading, spacing: 16) {
                AudioTime(current: 12, duration: 63)
                HStack { AudioPlayButton(playing: false, label: "Note") {}; AudioPlayButton(playing: true, label: "Note") {}; AudioPlayButton(playing: false, loading: true, label: "Note") {} }
                AudioWaveform(peaks: peaks, duration: 63, current: 20, label: "Note") { _ in }
                AudioWaveform(peaks: peaks, duration: 63, current: 20, label: "Note")
                PlaybackRateButton(rate: 1.5) { _ in }
                AudioPlayer(model: model, label: "Voice note", peaks: peaks)
                AudioPlayer(model: model, label: "Voice note", variant: .full)
                AudioPlayer(model: failed, label: "Voice note")
                AudioTranscript(words: words, current: 1.7, label: "Transcript", scrolls: false) { _ in }
            }
            .padding()
            .environment(\.colorScheme, scheme)
            .frame(width: 390)
            let renderer = ImageRenderer(content: view)
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage)
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 600)
            try AtomTests.save(image, name: "audio-playback-\(scheme)")
            model.teardown(); failed.teardown()
        }
    }
}
