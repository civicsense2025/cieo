import SwiftUI
import Cieo

public struct TakeoverAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "takeover", category: "Agent activity", name: "Take over from the agent",
        summary: "Take over freezes the assistant where it stands. Its ink cursor fades and your accent cursor appears at the same point, then springs to the pointer, while a banner grows between the address bar and the page and pushes the page down, the buttons fold away and the queued actions slide open. Hand back runs it in reverse: your cursor travels to the assistant’s next target, turns into the assistant’s, the banner closes, and the queue starts ticking again.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var mine = false
    @State private var agent = CGPoint(x: 40, y: 40)
    @State private var you = CGPoint(x: 40, y: 40)
    @State private var queued = ["Click Create workspace", "Type work email", "Click Submit"]
    @State private var step = 0
    public init() {}

    private let route = [CGPoint(x: 40, y: 40), CGPoint(x: 200, y: 70), CGPoint(x: 120, y: 120), CGPoint(x: 220, y: 150)]

    public var body: some View {
        AtomStage(hint: "Take over, move around, then Hand back") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    AgentMark(size: 20); Text(mine ? "You are in control" : "Assistant is working").font(.callout.weight(.medium))
                    Spacer()
                    Button { mine ? handBack() : takeOver() } label: { SwapText(mine ? "Hand back" : "Take over") }.buttonStyle(AgPress(tone: mine ? .info : nil))
                }
                AgReveal(open: mine) {
                    Label("Assistant is paused. Your clicks and typing go to the page.", systemImage: "hand.raised").font(.caption)
                        .padding(8).frame(maxWidth: .infinity, alignment: .leading).background(Color.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                }
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04))
                    VStack(alignment: .leading, spacing: 6) { Text("Checkout").font(.headline); RoundedRectangle(cornerRadius: 3).fill(.quaternary).frame(height: 10); RoundedRectangle(cornerRadius: 3).fill(.quaternary).frame(width: 140, height: 10) }.padding(14)
                    AgCursor(agent: true).position(agent).opacity(mine ? 0 : 1)
                    AgCursor(agent: false).position(you).opacity(mine ? 1 : 0)
                }
                .frame(height: 180).contentShape(Rectangle())
                .onTapGesture { p in if mine { withMotion(.base, reduceMotion: reduce) { you = p } } }
                AgReveal(open: mine) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Queued actions").font(.caption.weight(.semibold))
                        ForEach(queued.indices, id: \.self) { i in Text(queued[i]).font(.caption).foregroundStyle(i < step ? .tertiary : .secondary) }
                    }
                }
            }
            .frame(maxWidth: 360)
            .animation(reduce ? nil : .motion(.base), value: mine)
        }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 1_400_000_000)
                if !mine { withMotion(.base, reduceMotion: reduce) { step = (step + 1) % route.count; agent = route[step] } }
            }
        }
    }

    private func takeOver() {
        you = agent
        withMotion(.base, reduceMotion: reduce) { mine = true }
        Task { @MainActor in try? await Task.sleep(nanoseconds: 200_000_000); withMotion(.base, reduceMotion: reduce) { you = CGPoint(x: you.x + 30, y: you.y + 30) } }
    }
    private func handBack() {
        let next = route[(step + 1) % route.count]
        withMotion(.soft, reduceMotion: reduce) { you = next }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 450_000_000)
            agent = next
            withMotion(.base, reduceMotion: reduce) { mine = false }
        }
    }
}
