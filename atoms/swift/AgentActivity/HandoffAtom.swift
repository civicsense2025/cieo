import SwiftUI
import Cieo

public struct HandoffAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "handoff", category: "Agent activity", name: "Needs a human decision",
        summary: "The agent pauses on a pin it cannot settle alone. The pin falls with a question mark and a warning dot, and its card grows out of it with a Needs a human decision chip. Choosing an option slides a plate between the three rows (leading edge first). Send answer closes the options and the button away, echoes your choice, and the agent’s acknowledgement reveals word by word. Meanwhile both status chips morph in place from warning to success to running, the pin’s question mark swaps for its number, and a one-line run status steps through what the agent does next.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Phase { case asking, sent, running }
    @State private var phase = Phase.asking
    @State private var choice = 0
    @State private var ack = ""
    @State private var frames: [Int: CGRect] = [:]
    @State private var run = 0
    public init() {}

    private let options = ["Use the 14-day trial copy", "Use the 30-day trial copy", "Leave the copy as it is"]
    private let steps = ["Updating the heading", "Checking the pricing page", "Done"]
    @State private var stepIx = 0

    public var body: some View {
        AtomStage(hint: "Pick an option, then Send answer") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    AgentMark(size: 22)
                    AgChip(text: phase == .asking ? "Paused for your decision" : phase == .sent ? "Answered" : "Running", tone: phase == .asking ? .warning : phase == .sent ? .success : .info)
                    Spacer(); Button("Replay") { run += 1 }.buttonStyle(AgPress())
                }
                HStack(alignment: .top, spacing: 8) {
                    AgPinMark(label: phase == .asking ? "?" : "1", tone: phase == .asking ? .warning : .info).transition(.scale)
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Which trial length should the page promise?").font(.callout.weight(.semibold))
                        AgReveal(open: phase == .asking) {
                            ZStack(alignment: .topLeading) {
                                if let f = frames[choice] { AgSpan(lo: f.minY, hi: f.maxY, vertical: true, fill: Color.accentColor.opacity(0.15)) }
                                VStack(spacing: 2) {
                                    ForEach(options.indices, id: \.self) { i in
                                        Button { withMotion(.base, reduceMotion: reduce) { choice = i } } label: {
                                            HStack { Image(systemName: choice == i ? "largecircle.fill.circle" : "circle"); Text(options[i]); Spacer() }.font(.caption).padding(6).contentShape(Rectangle())
                                        }.buttonStyle(.plain).accessibilityAddTraits(choice == i ? .isSelected : [])
                                        .reportFrame(i, in: "opts")
                                    }
                                }
                            }
                            .coordinateSpace(name: "opts")
                            .onPreferenceChange(FramePreferenceKey.self) { v in frames = v.reduce(into: [:]) { if let k = $1.key as? Int { $0[k] = $1.value } } }
                            Button("Send answer") { send() }.buttonStyle(AgPress(tone: .info)).padding(.top, 4)
                        }
                        if phase != .asking {
                            Text("You chose: \(options[choice])").font(.caption).foregroundStyle(.secondary).transition(.opacity)
                            if !ack.isEmpty { Text(ack).font(.caption).transition(.opacity) }
                            if phase == .running { HStack(spacing: 6) { if stepIx < 2 { AgSpinner(size: 10) } else { Image(systemName: "checkmark").foregroundStyle(.green) }; SwapText(steps[stepIx]) }.font(.caption) }
                        }
                    }
                }
                .padding(10).background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 10))
            }
            .frame(maxWidth: 380)
            .animation(reduce ? nil : .motion(.base), value: phase)
        }
        .task(id: run) { phase = .asking; ack = ""; stepIx = 0; choice = 0 }
    }

    private func send() {
        withMotion(.base, reduceMotion: reduce) { phase = .sent }
        Task { @MainActor in
            for w in "Thanks. I will use that copy and update the page now.".split(separator: " ") {
                try? await Task.sleep(nanoseconds: reduce ? 0 : 70_000_000)
                ack += (ack.isEmpty ? "" : " ") + w
            }
            withMotion(.base, reduceMotion: reduce) { phase = .running }
            for i in 0..<3 { withMotion(.base, reduceMotion: reduce) { stepIx = i }; try? await Task.sleep(nanoseconds: 900_000_000) }
        }
    }
}
