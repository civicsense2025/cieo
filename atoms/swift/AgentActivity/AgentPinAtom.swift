import SwiftUI
import MotionKit

public struct AgentPinAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentpin", category: "Agent activity", name: "Agent pin and comment",
        summary: "The agent scrolls the page to the element, its cursor glides over, and a selector frame snaps around the target with the leading edges first. Then the pin falls onto the element and only then does the comment card grow out of the pin, carrying the agent’s name, an Agent badge shaped differently from a person’s round avatar, a severity chip and the element selector. Resolving collapses the card back into the pin, which turns to a check.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var frames: [String: CGRect] = [:]
    @State private var target = "field"
    @State private var cursor = CGPoint(x: 10, y: 150)
    @State private var ring = false
    @State private var pinDropped = false
    @State private var card = false
    @State private var resolved = false
    @State private var run = 0
    public init() {}

    private let notes = ["field": ("Low contrast placeholder", "input#work-email"), "button": ("Button label is vague", "button.primary")]

    public var body: some View {
        let f = frames[target] ?? .zero
        AtomStage(hint: "Next finding, or Replay") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    AgentMark(size: 22); Text(card ? "Left a comment" : "Reading the page").font(.caption)
                    Spacer()
                    Button("Next finding") { target = target == "field" ? "button" : "field"; run += 1 }.buttonStyle(AgPress())
                    Button("Replay") { run += 1 }.buttonStyle(AgPress())
                }
                ZStack(alignment: .topLeading) {
                    AgMockPage()
                    if ring { AgFrameRing(frame: f).transition(.opacity) }
                    AgPinMark(label: "1", resolved: resolved).position(x: f.maxX, y: f.minY).offset(y: pinDropped ? 0 : -30).opacity(pinDropped ? 1 : 0)
                    if card {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 4) { AgentMark(size: 14); Text("Assistant").font(.caption.weight(.semibold)); AgentTag(); AgChip(text: "Should fix", tone: .warning) }
                            Text(notes[target]?.0 ?? "").font(.caption)
                            Text(notes[target]?.1 ?? "").font(.caption2.monospaced()).foregroundStyle(.secondary)
                            Button("Resolve") { resolve() }.buttonStyle(AgPress(tone: .success)).font(.caption)
                        }
                        .padding(8).frame(width: 190, alignment: .leading)
                        .background(.background, in: RoundedRectangle(cornerRadius: 8)).overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.quaternary)).shadow(radius: 4, y: 2)
                        .scaleEffect(card ? 1 : 0.2, anchor: .topLeading).position(x: min(f.maxX + 70, 250), y: f.maxY + 52)
                        .transition(reduce ? .identity : .scale(scale: 0.15, anchor: .topLeading).combined(with: .opacity))
                    }
                    AgCursor().position(x: cursor.x + 7, y: cursor.y + 9)
                }
                .agFrames($frames).frame(maxWidth: 340, minHeight: 200)
            }
        }
        .task(id: run) { await play() }
    }

    private func play() async {
        withMotion(.base, reduceMotion: reduce) { ring = false; pinDropped = false; card = false; resolved = false }
        try? await Task.sleep(nanoseconds: 250_000_000)
        guard let f = frames[target], !Task.isCancelled else { return }
        withMotion(.soft, reduceMotion: reduce) { cursor = CGPoint(x: f.midX, y: f.midY) }
        try? await Task.sleep(nanoseconds: 450_000_000)
        withMotion(.base, reduceMotion: reduce) { ring = true }
        try? await Task.sleep(nanoseconds: 350_000_000)
        withMotion(.snap, reduceMotion: reduce) { pinDropped = true }
        try? await Task.sleep(nanoseconds: 250_000_000)
        withMotion(.base, reduceMotion: reduce) { card = true }
    }
    private func resolve() {
        withMotion(.base, reduceMotion: reduce) { card = false; resolved = true; ring = false }
    }
}
