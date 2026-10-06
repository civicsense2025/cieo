import SwiftUI
import Cieo

public struct RecDotAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "recdot", category: "Video calls", name: "Recording dot",
        summary: "The dot pulses on the clock while tape rolls. Starting swaps in Rec plus a digit timer; stopping swaps back and lands on a saved terminal.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var recording = false
    @State private var start = Date()
    @State private var tenths = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Start the take, then stop to save it") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Recording dot").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("One tap to roll.").font(.system(size: 12)).foregroundStyle(.secondary)
                TimelineView(.periodic(from: .now, by: 0.25)) { context in
                    let elapsed = recording ? context.date.timeIntervalSince(start) : 0
                    HStack(spacing: 12) {
                        Button {
                            withMotion(.base, reduceMotion: reduce) {
                                if recording { started = true }
                                else { start = Date() }
                                recording.toggle()
                            }
                        } label: {
                            Circle().fill(Color.red).frame(width: 13, height: 13)
                                .frame(width: 40, height: 40)
                                .background(Circle().stroke(.quaternary))
                        }
                        .accessibilityLabel(recording ? "Stop" : "Record")
                        SwapText(recording ? "Recording…" : "Record a take").font(.system(size: 13.5))
                        Spacer()
                        Text(timer(elapsed)).font(.system(size: 13)).monospacedDigit()
                    }
                    .opacity(1)
                    .overlay {
                        if recording, !reduce {
                            Circle().fill(Color.red)
                                .frame(width: 13, height: 13)
                                .opacity(0.45 + 0.55 * (0.5 + 0.5 * sin(context.date.timeIntervalSinceReferenceDate * 2 * .pi)))
                                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                                .padding(.leading, 13.5)
                                .allowsHitTesting(false)
                        }
                    }
                }
                if !recording, started {
                    Text("✓ Saved to library").font(.system(size: 12.5, weight: .semibold))
                        .foregroundStyle(.green).padding(.horizontal, 10).padding(.vertical, 5)
                        .background(Capsule().fill(.green.opacity(0.12)))
                        .motionTransition(.swap(drift: 0))
                }
                Toggle("Tenths", isOn: $tenths)
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .padding(14)
        }
    }

    @State private var started = false

    private func timer(_ elapsed: TimeInterval) -> String {
        let m = Int(elapsed) / 60, s = Int(elapsed) % 60
        if tenths {
            return String(format: "%2d:%02d.%d", m, s, Int(elapsed * 10) % 10)
        }
        return String(format: "%2d:%02d", m, s)
    }
}
