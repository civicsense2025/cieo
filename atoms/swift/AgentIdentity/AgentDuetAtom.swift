import SwiftUI
import Cieo

public struct AgentDuetAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentduet", category: "Agent identity", name: "Agent duet",
        summary: "Two agents and Maya’s cursor work one checkout page. The review agent lifts its lens to the total, the outline snaps around it, and it plants a pin. It turns to the fix agent, they catch each other’s eye, and the note flies across on a spring. The fix agent hops over, its pencil nudges the total back into line, and the reviewer watches and smiles. Maya’s cursor comes in, both agents look up at it, and her click resolves the pin. They hop, staggered. Drag either agent to interrupt: the other stops to watch, and once it lands they pick up the beat they were on.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var fixerX: CGFloat = 170
    @State private var fixerLift: CGFloat = 0
    @State private var reviewFace = AgFace()
    @State private var fixFace = AgFace()
    @State private var reviewLook = CGSize.zero
    @State private var fixLook = CGSize.zero
    @State private var noteX: CGFloat?
    @State private var totalFixed = false
    @State private var pin = false
    @State private var resolved = false
    @State private var cursor: CGPoint?
    @State private var drag: [Int: CGSize] = [:]
    @State private var run = 0
    public init() {}

    private let captions = ["Reviewer lifts its lens to the total", "It plants a pin and turns to the fixer", "The note crosses on a spring", "Fixer hops over and nudges the total", "Maya clicks to resolve", "They hop, staggered"]

    public var body: some View {
        AtomStage(hint: "Drag either agent to interrupt") {
            VStack(spacing: 8) {
                HStack { Text("Review, fix, resolve").font(.callout.weight(.semibold)); Spacer(); Button("Replay") { run += 1 }.buttonStyle(AgPress()) }
                ZStack(alignment: .bottomLeading) {
                    RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04))
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Checkout").font(.caption2).foregroundStyle(.secondary)
                        SwapText(totalFixed ? "Total $48.00" : "Total $84.00").font(.callout.weight(.semibold)).padding(3)
                            .overlay(step >= 1 && !resolved ? RoundedRectangle(cornerRadius: 4).fill(Color.accentColor).opacity(0.10).allowsHitTesting(false) : nil)
                    }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing).padding(12)
                    if pin { AgPinMark(label: "1", resolved: resolved).offset(x: 215, y: -110).transition(.scale) }
                    if let nx = noteX { Image(systemName: "note.text").offset(x: nx, y: -80).transition(.opacity) }
                    agent(0, x: 30, look: reviewLook, face: reviewFace, wash: .blue, prop: "magnifyingglass", lift: 0)
                    agent(1, x: fixerX, look: fixLook, face: fixFace, wash: .orange, prop: "pencil", lift: fixerLift)
                    if let c = cursor { AgCursor(agent: false).offset(x: c.x, y: c.y - 140).transition(.opacity) }
                }
                .frame(height: 140).clipped()
                SwapText(captions[min(step, captions.count - 1)]).font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: 360)
        }
        .task(id: run) { await play() }
    }

    private func agent(_ id: Int, x: CGFloat, look: CGSize, face: AgFace, wash: Color, prop: String, lift: CGFloat) -> some View {
        AgentIdle(phase: Double(id)) { blink, breathe in
            ZStack(alignment: .topTrailing) {
                AgentCharacter(size: 40, face: face, look: drag.keys.contains(1 - id) ? CGSize(width: id == 0 ? 1 : -1, height: 0) : look, squash: CGSize(width: 1, height: breathe), wash: wash, blink: blink)
                Image(systemName: prop).font(.caption).offset(x: 10, y: 12)
            }
        }
        .offset(x: x + (drag[id]?.width ?? 0), y: -lift - 6 + (drag[id]?.height ?? 0))
        .gesture(DragGesture().onChanged { drag[id] = $0.translation }.onEnded { _ in withMotion(.soft, reduceMotion: reduce) { drag[id] = nil }; Task { await play() } })
    }

    private func wait(_ ms: UInt64) async { try? await Task.sleep(nanoseconds: ms * 1_000_000) }
    private func play() async {
        withMotion(.base, reduceMotion: reduce) { step = 0; fixerX = 170; totalFixed = false; pin = false; resolved = false; cursor = nil; noteX = nil; reviewFace = AgFace(); fixFace = AgFace(); reviewLook = .zero; fixLook = .zero }
        await wait(500); if Task.isCancelled { return }
        withMotion(.base, reduceMotion: reduce) { step = 1; reviewLook = CGSize(width: 1, height: -0.5) }
        agStage(.thinking, face: $reviewFace, reduce: reduce)
        await wait(700); if Task.isCancelled { return }
        withMotion(.snap, reduceMotion: reduce) { pin = true; step = 2; reviewLook = CGSize(width: 1, height: 0); fixLook = CGSize(width: -1, height: 0) }
        agStage(.happy, face: $fixFace, reduce: reduce)
        await wait(500); if Task.isCancelled { return }
        withMotion(.soft, reduceMotion: reduce) { noteX = 60 }
        await wait(300)
        withMotion(.soft, reduceMotion: reduce) { noteX = 170 }
        await wait(500); if Task.isCancelled { return }
        withMotion(.base, reduceMotion: reduce) { noteX = nil; step = 3; fixerX = 100; fixerLift = 18 }
        await wait(220); withMotion(.snap, reduceMotion: reduce) { fixerLift = 0 }
        await wait(600); withMotion(.base, reduceMotion: reduce) { totalFixed = true }
        agStage(.happy, face: $reviewFace, reduce: reduce)
        await wait(700); if Task.isCancelled { return }
        withMotion(.base, reduceMotion: reduce) { step = 4; cursor = CGPoint(x: 150, y: 20); reviewLook = CGSize(width: 0.5, height: -1); fixLook = CGSize(width: 0.5, height: -1) }
        await wait(600); withMotion(.base, reduceMotion: reduce) { cursor = CGPoint(x: 218, y: 30) }
        await wait(500); withMotion(.base, reduceMotion: reduce) { resolved = true; step = 5; cursor = nil }
        await wait(300); withMotion(.snap, reduceMotion: reduce) { fixerLift = 16 }
        await wait(100); withMotion(.snap, reduceMotion: reduce) { fixerLift = 0 }
    }
}
