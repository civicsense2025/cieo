import CieoUI
import SwiftUI

/// Every audio playback component with local fixtures: no network and no audio session until a button is pressed.
struct AudioPlaybackExamples: View {
    @State private var playing = false
    @State private var rate = 1.0
    @State private var position = 20.0
    @State private var transcriptTime = 0.0
    @State private var voiceNote = AudioPlaybackModel(simulatedDuration: 63)
    @State private var memo = AudioPlaybackModel(simulatedDuration: 252, currentTime: 80)
    @State private var broken = AudioPlaybackModel(simulatedDuration: 63, state: .error)

    private let peaks: [Double] = (0..<120).map { abs(sin(Double($0) / 7)) * (0.4 + 0.6 * abs(cos(Double($0) / 3))) }
    private let words: [AudioTranscript.Word] = {
        let text = "Thanks for calling back so quickly. I wanted to walk you through what changed in the committee vote and what happens next for the bill on the floor tomorrow morning."
        return text.split(separator: " ").enumerated().map { AudioTranscript.Word(String($1), start: Double($0) * 0.45, end: Double($0) * 0.45 + 0.4) }
    }()

    var body: some View {
        VStack(spacing: 24) {
            Specimen(title: "Time") {
                AudioTime(current: position, duration: 63)
                AudioTime(current: position, duration: 63, mode: .remaining)
                AudioTime(current: 0, duration: 63, mode: .total)
            }
            Specimen(title: "Play button") {
                HStack {
                    AudioPlayButton(playing: playing, label: "Voice note", size: .small) { playing.toggle() }
                    AudioPlayButton(playing: playing, label: "Voice note") { playing.toggle() }
                    AudioPlayButton(playing: playing, label: "Voice note", size: .large) { playing.toggle() }
                    AudioPlayButton(playing: false, loading: true, label: "Voice note") {}
                }
            }
            Specimen(title: "Waveform and speed") {
                AudioWaveform(peaks: peaks, duration: 63, current: position, label: "Voice note") { position = $0 }
                AudioWaveform(peaks: peaks, duration: 63, current: position, label: "Voice note")
                PlaybackRateButton(rate: rate) { rate = $0 }
            }
            Specimen(title: "Player") {
                AudioPlayer(model: voiceNote, label: "Voice note from Ava", peaks: peaks)
                AudioPlayer(model: memo, label: "Committee briefing", variant: .full)
                AudioPlayer(model: broken, label: "Missing clip")
            }
            Specimen(title: "Transcript") {
                AudioTranscript(words: words, current: transcriptTime, label: "Transcript of Voice note from Ava") { transcriptTime = $0 }
                    .frame(height: 140)
                Slider(value: $transcriptTime, in: 0...(words.last?.end ?? 1)).accessibilityLabel("Transcript position")
            }
        }
        .onDisappear { voiceNote.teardown(); memo.teardown(); broken.teardown() }
    }
}

#Preview { ScrollView { AudioPlaybackExamples().padding() } }
