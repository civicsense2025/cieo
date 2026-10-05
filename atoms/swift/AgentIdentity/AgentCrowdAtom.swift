import SwiftUI
import MotionKit

public struct AgentCrowdAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentcrowd", category: "Agent identity", name: "Agent crowd",
        summary: "Five agents with different washes idle on one floor: each breathes, blinks and fidgets on its own clock, and every few seconds one glances at a neighbour; when two catch each other’s eye they both smile. The research agent is thinking, so its arc keeps turning. They look at your pointer while it moves. Throw one and every agent it passes turns to watch it, looks surprised, leans away, then goes back to what it was doing; the sleepy one wakes up for a while. Landing on someone makes them shuffle aside.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var thrown: Int?
    @State private var dragX: [Int: CGFloat] = [:]
    @State private var faces: [Int: AgFace] = [:]
    @State private var looks: [Int: CGSize] = [:]
    @State private var leans: [Int: Double] = [:]
    @State private var run = 0
    public init() {}

    private let washes: [Color] = [.green, .blue, .orange, .pink, .purple]
    private let slotW: CGFloat = 62

    public var body: some View {
        AtomStage(hint: "Throw one near the others") {
            VStack(spacing: 10) {
                ZStack(alignment: .bottomLeading) {
                    Capsule().fill(.quaternary).frame(height: 4).offset(y: 6)
                    ForEach(0..<5, id: \.self) { i in
                        AgentIdle(phase: Double(i) * 1.3) { blink, breathe in
                            AgentCharacter(size: 46, face: faces[i] ?? (i == 4 ? AgMood.sleepy.face : AgFace()), look: looks[i] ?? .zero,
                                           squash: CGSize(width: 1, height: breathe), lean: leans[i] ?? 0, wash: washes[i], spin: i == 1 ? 0 : 0, blink: blink)
                        }
                        .offset(x: CGFloat(i) * slotW + (dragX[i] ?? 0))
                        .zIndex(thrown == i ? 1 : 0)
                        .gesture(DragGesture()
                            .onChanged { v in thrown = i; dragX[i] = v.translation.width; react(to: i, at: CGFloat(i) * slotW + v.translation.width) }
                            .onEnded { v in
                                withMotion(.soft, reduceMotion: reduce) { dragX[i] = 0 }
                                Task { @MainActor in try? await Task.sleep(nanoseconds: 1_100_000_000); settle() }
                            })
                        .accessibilityHidden(true)
                    }
                }
                .frame(width: slotW * 5, height: 110, alignment: .bottomLeading)
                Button("Reset") { settle() }.buttonStyle(AgPress())
            }
        }
        .task(id: run) {
            // Every few seconds one agent glances at a neighbour; when two catch each other's eye they both smile.
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 3_000_000_000)
                guard thrown == nil, !reduce else { continue }
                let a = Int.random(in: 0..<4), b = a + 1
                withMotion(.base, reduceMotion: reduce) { looks[a] = CGSize(width: 1, height: 0); looks[b] = CGSize(width: -1, height: 0); faces[a] = AgMood.happy.face; faces[b] = AgMood.happy.face }
                try? await Task.sleep(nanoseconds: 1_200_000_000)
                if thrown == nil { settle() }
            }
        }
    }

    private func react(to d: Int, at x: CGFloat) {
        for i in 0..<5 where i != d {
            let dx = x - CGFloat(i) * slotW
            withMotion(.base, reduceMotion: reduce) {
                looks[i] = CGSize(width: dx > 0 ? 1 : -1, height: -0.3)
                faces[i] = i == 4 ? AgMood.surprised.face : AgMood.surprised.face
                leans[i] = abs(dx) < slotW * 1.2 ? (dx > 0 ? -8 : 8) : 0
            }
        }
    }
    private func settle() {
        withMotion(.soft, reduceMotion: reduce) { thrown = nil; dragX = [:]; faces = [:]; looks = [:]; leans = [:] }
    }
}
