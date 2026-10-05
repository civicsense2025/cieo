import SwiftUI
import MotionKit

public struct AgentThreadAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentthread", category: "Agent activity", name: "Agent and human thread",
        summary: "The pin falls on the field and its thread grows out of it with the agent’s finding and a person’s question already in place. The agent’s three-dot indicator breathes on the clock, then its answer reveals word by word while the thread’s height eases open to follow it. Once it finishes, Accept and Dismiss fade in; either swaps to a one-line outcome with Undo. A reply from you appends a person’s message and the agent answers the same way. Resolve collapses the whole thread back into the pin.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Msg: Identifiable { let id = UUID(); let agent: Bool; let text: String }
    @State private var open = true
    @State private var msgs = [Msg(agent: true, text: "The email field has no visible label."), Msg(agent: false, text: "Is the placeholder enough?")]
    @State private var typing = false
    @State private var revealed = ""
    @State private var decision: String?
    @State private var awaiting = false
    @State private var reply = ""
    public init() {}

    private let answer = "Placeholders vanish while typing, so add a persistent label above the field."

    public var body: some View {
        AtomStage(hint: "Reply to the agent; Resolve folds the thread into the pin") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    AgPinMark(label: "1", resolved: !open && decision == "Accepted")
                    Text("input#work-email").font(.caption.monospaced())
                    Spacer()
                    Button(open ? "Resolve" : "Reopen") { withMotion(.base, reduceMotion: reduce) { open.toggle() } }.buttonStyle(AgPress())
                }
                AgReveal(open: open) {
                    AgCard {
                        VStack(alignment: .leading, spacing: 8) {
                            ForEach(msgs) { m in bubble(m.agent, m.text).transition(reduce ? .identity : .opacity.combined(with: .move(edge: .bottom))) }
                            if typing { bubble(true, revealed.isEmpty ? "···" : revealed).transition(.opacity) }
                            if awaiting && decision == nil {
                                HStack { Button("Accept") { decide("Accepted") }.buttonStyle(AgPress(tone: .success)); Button("Dismiss") { decide("Dismissed") }.buttonStyle(AgPress()) }
                                    .transition(.opacity)
                            }
                            if let d = decision {
                                HStack { Text(d).font(.caption.weight(.semibold)); Spacer(); Button("Undo") { withMotion(.base, reduceMotion: reduce) { decision = nil } }.buttonStyle(AgPress()) }
                                    .motionTransition(.swap())
                            }
                            HStack {
                                TextField("Reply", text: $reply).textFieldStyle(.roundedBorder).onSubmit { send() }
                                Button("Send") { send() }.buttonStyle(AgPress(tone: .info)).disabled(reply.isEmpty || typing)
                            }
                        }
                    }
                }
            }
            .frame(maxWidth: 380)
            .animation(reduce ? nil : .motion(.base), value: msgs.count)
            .animation(reduce ? nil : .motion(.base), value: typing)
            .animation(reduce ? nil : .motion(.base), value: awaiting)
        }
        .task { await answerFlow() }
    }

    private func bubble(_ agent: Bool, _ text: String) -> some View {
        HStack(alignment: .top, spacing: 6) {
            if agent { AgentMark(size: 18) } else { Circle().fill(Color.accentColor.opacity(0.25)).frame(width: 18, height: 18).overlay(Text("M").font(.system(size: 9, weight: .bold))) }
            Text(text).font(.caption).frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private func send() {
        guard !reply.isEmpty else { return }
        withMotion(.base, reduceMotion: reduce) { msgs.append(Msg(agent: false, text: reply)); reply = ""; awaiting = false; decision = nil }
        Task { await answerFlow() }
    }
    private func decide(_ d: String) { withMotion(.base, reduceMotion: reduce) { decision = d } }
    private func answerFlow() async {
        try? await Task.sleep(nanoseconds: 500_000_000)
        withMotion(.base, reduceMotion: reduce) { typing = true; revealed = "" }
        try? await Task.sleep(nanoseconds: 900_000_000)
        for w in answer.split(separator: " ") {
            revealed += (revealed.isEmpty ? "" : " ") + w
            try? await Task.sleep(nanoseconds: reduce ? 0 : 70_000_000)
        }
        let final = revealed
        withMotion(.base, reduceMotion: reduce) { typing = false; msgs.append(Msg(agent: true, text: final)); awaiting = true }
    }
}
