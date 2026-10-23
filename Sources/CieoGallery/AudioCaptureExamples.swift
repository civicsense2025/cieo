import CieoUI
import SwiftUI

/// Gallery examples for the voice-capture and live-room components. Fixtures are local; nothing asks for
/// the microphone until the person taps record.
struct AudioCaptureExamples: View {
    @State private var level = 0.4
    @State private var clips: [VoiceRecorderModel.Clip] = []
    @State private var me = AudioRoom.Me(isMuted: false, handRaised: false, canSpeak: true)
    @State private var speakers: [AudioRoom.Speaker] = [
        .init(id: "ava", name: "Ava", role: .host, level: 0.6),
        .init(id: "ben", name: "Ben", isMuted: true),
        .init(id: "cy", name: "Cy", handRaised: true),
    ]
    @State private var joined = 0

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Specimen(title: "Level meter") {
                    AudioLevelMeter(level: level)
                    Slider(value: $level, in: 0...1) { Text("Level") }
                }
                Specimen(title: "Voice recorder, tap") {
                    VoiceRecorder(onRecorded: { clips.append($0) })
                    ForEach(Array(clips.enumerated()), id: \.offset) { _, clip in
                        Text("Clip, \(clip.duration, format: .number.precision(.fractionLength(1))) seconds, \(clip.peaks.count) peaks")
                    }
                }
                Specimen(title: "Voice recorder, hold to talk") {
                    VoiceRecorder(mode: .hold, onRecorded: { clips.append($0) })
                }
                Specimen(title: "Speaker tiles") {
                    HStack(spacing: 16) {
                        SpeakerTile(name: "Ava", role: .host, level: level) { Color.gray }
                        SpeakerTile(name: "Ben", isMuted: true) { Color.gray }
                        SpeakerTile(name: "Cy", handRaised: true, size: .small) { Color.gray }
                    }
                }
                Specimen(title: "Audio room") {
                    AudioRoom(title: Text("Friday jam"), speakers: speakers.map { var s = $0; if s.id == "ava" { s.level = level }; return s },
                              listenerCount: 1240 + joined, me: me,
                              onToggleMute: { me.isMuted.toggle() }, onToggleHand: { me.handRaised.toggle() }, onLeave: {},
                              avatar: { _ in Color.gray }, listeners: { EmptyView() }, reactions: { Button("Clap") {} })
                    HStack {
                        Button("Add speaker") { joined += 1; speakers.append(.init(id: "n\(joined)", name: "Guest \(joined)")) }
                        Button("Remove speaker") { if speakers.count > 1 { speakers.removeLast() } }
                    }
                }
            }
            .padding()
        }
    }
}
