import SwiftUI
import Cieo

public struct VoiceWaveformAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "voicewave", category: "AI chat", name: "Voice waveform",
        summary: "Bars pulse live off the clock while held. On release they spring back and the transcript bubble swaps in as the terminal state.")

    private let count = 14
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var holding = false
    @State private var transcript = false
    @State private var showTranscript = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hold the button, then release") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Voice reply").font(.system(size: 15, weight: .semibold))
                TimelineView(.animation(paused: reduce)) { ctx in
                    HStack(spacing: 3) {
                        ForEach(0..<count, id: \.self) { i in
                            RoundedRectangle(cornerRadius: 2).fill(Color.primary)
                                .frame(width: 4, height: barHeight(i, at: ctx.date.timeIntervalSinceReferenceDate))
                                .opacity(barOpacity(i, at: ctx.date.timeIntervalSinceReferenceDate))
                        }
                    }
                    .frame(height: 48)
                }
                if transcript {
                    Text("Ship it Thursday. QA signed off.")
                        .font(.system(size: 13.5)).lineSpacing(2)
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.secondary.opacity(0.18)))
                        .frame(maxWidth: 240, alignment: .leading)
                        .motionTransition(.swap())
                }
                HStack {
                    Label("Hold to talk", systemImage: "mic.fill")
                        .font(.footnote.weight(.medium))
                        .padding(.horizontal, 14).frame(height: 40)
                        .foregroundStyle(.white).background(RoundedRectangle(cornerRadius: 10).fill(Color.primary))
                        .contentShape(Rectangle())
                        .gesture(DragGesture(minimumDistance: 0)
                            .onChanged { _ in
                                if !holding {
                                    withMotion(.snap, reduceMotion: reduce) { holding = true }
                                }
                            }
                            .onEnded { _ in release() })
                        .accessibilityLabel("Hold to talk")
                    Spacer()
                    Toggle("Transcript", isOn: $showTranscript).font(.caption).foregroundStyle(.secondary)
                }
            }
            .frame(width: 300)
            .animation(reduce ? nil : .motion(.soft), value: holding)
        }
    }

    private func barHeight(_ i: Int, at t: Double) -> CGFloat {
        guard holding, !reduce else { return holding ? 14 : 6 }
        return 6 + 30 * (0.5 + 0.5 * sin(t * 9 - Double(i) * 0.55))
    }

    private func barOpacity(_ i: Int, at t: Double) -> Double {
        guard holding, !reduce else { return holding ? 0.8 : 0.4 }
        return 0.4 + 0.6 * (0.5 + 0.5 * sin(t * 9 - Double(i) * 0.55))
    }

    private func release() {
        guard holding else { return }
        withMotion(.soft, reduceMotion: reduce) { holding = false }
        if showTranscript {
            withMotion(.soft, reduceMotion: reduce) { transcript = true }
        }
    }
}
