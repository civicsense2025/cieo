import SwiftUI
import Cieo

public struct HumanHandoffAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "humanhandoff", category: "AI chat", name: "Human handoff",
        summary: "The avatar swaps to your teammate while the queue pill drops in on base. Digits count the wait down, then the transcript unfolds to a joined terminal.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var asked = false
    @State private var joined = false
    @State private var wait = 3
    @State private var showTranscript = true
    @State private var ticket = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Ask for a person, then watch the queue") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Talk to a person").font(.system(size: 15, weight: .semibold))
                HStack(spacing: 10) {
                    ZStack {
                        if !asked {
                            Image(systemName: "sparkles").font(.system(size: 15))
                                .frame(width: 36, height: 36)
                                .background(Circle().fill(Color.secondary.opacity(0.18)))
                                .motionTransition(.swap())
                        } else {
                            Text("M").font(.system(size: 15, weight: .semibold))
                                .frame(width: 36, height: 36)
                                .foregroundStyle(.white).background(Circle().fill(Color.primary))
                                .motionTransition(.swap())
                        }
                    }
                    VStack(alignment: .leading, spacing: 0) {
                        SwapText(asked ? "Maya · Support" : "Assistant").font(.system(size: 13))
                        Text("Typically replies in minutes").font(.caption).foregroundStyle(.secondary)
                    }
                    Spacer()
                    if asked {
                        SwapText(joined ? "Maya joined" : "#2 in queue")
                            .font(.caption).foregroundStyle(joined ? .green : .primary)
                            .padding(.horizontal, 12).frame(height: 26)
                            .background(Capsule().fill(Color.secondary.opacity(0.18)))
                            .motionTransition(.swap())
                    }
                }
                if asked {
                    HStack(spacing: 6) {
                        Text("Wait").font(.caption).foregroundStyle(.secondary)
                        RollingDigits(String(format: "%02d", wait)).font(.system(size: 13))
                        Text("min").font(.caption).foregroundStyle(.secondary)
                    }
                }
                if joined && showTranscript {
                    Text("Summary sent: launch date plus the pricing question.")
                        .font(.system(size: 13)).lineSpacing(2)
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.secondary.opacity(0.18)))
                        .frame(maxWidth: 240, alignment: .leading)
                        .motionTransition(.presence)
                }
                HStack {
                    Button(joined ? "Chatting with Maya" : "Talk to a person") { ask() }
                        .buttonStyle(.borderedProminent).controlSize(.small).disabled(asked)
                    Spacer()
                    Toggle("Transcript", isOn: $showTranscript).font(.caption).foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: 300)
            .animation(reduce ? nil : .motion(.base), value: asked)
            .animation(reduce ? nil : .motion(.base), value: joined)
        }
    }

    private func ask() {
        guard !asked else { return }
        withMotion(.base, reduceMotion: reduce) { asked = true }
        wait = 3
        ticket += 1
        let id = ticket
        Task {
            for _ in 0..<3 {
                try? await Task.sleep(for: .seconds(1.1))
                guard id == ticket else { return }
                wait -= 1
            }
            guard id == ticket else { return }
            withMotion(.base, reduceMotion: reduce) { joined = true }
        }
    }
}
