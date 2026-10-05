import SwiftUI
import Cieo

public struct AgentCharacterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentcharacter", category: "Agent identity", name: "Agent character",
        summary: "One agent on a floor. Its eyes follow your pointer anywhere on the page, with the face sliding a beat later like a head turning. Pick an expression and the brows move first, then the lids, then the mouth, then the body settles. Click it and it squeezes, hops and smiles; drag it 1:1 and let go to throw it, and it leans into the throw, stretches as it flies, the antenna trails behind, and the landing squash recovers without bouncing. Idle, it breathes, blinks, glances and now and then fidgets. The 24, 48 and 96px copies mirror it frame for frame.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var tx = Track(0, preset: .base)
    @State private var ty = Track(0, preset: .base)
    @State private var drag: CGSize?
    @State private var flying = false
    @State private var face = AgFace()
    @State private var mood = AgMood.calm
    @State private var look = CGSize.zero
    @State private var pokeSquash: CGFloat = 1
    @State private var pokeLift: CGFloat = 0
    public init() {}

    private let half: Double = 100

    public var body: some View {
        AtomStage(hint: "Drag it and let go to throw. Click to poke.") {
            VStack(spacing: 10) {
                TimelineView(.animation(paused: !flying && drag == nil && pokeLift == 0)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    let x = drag.map { Double($0.width) } ?? tx.value(at: t)
                    let y = drag.map { Double($0.height) } ?? ty.value(at: t)
                    let vx = drag == nil ? tx.velocity(at: t) : 0, vy = drag == nil ? ty.velocity(at: t) : 0
                    let stretch = 1 + min(0.18, abs(vy) / 2500)
                    let landing = y > -4 && vy > 80 ? 1 - min(0.14, vy / 3500) : 1
                    ZStack(alignment: .bottom) {
                        Capsule().fill(.quaternary).frame(width: 230, height: 4).offset(y: 6)
                        AgentIdle { blink, breathe in
                            AgentCharacter(size: 84, face: face, look: look, squash: CGSize(width: 1 / (stretch * landing), height: stretch * landing * pokeSquash * breathe),
                                           lean: max(-18, min(18, vx / 40)), wash: .green, spin: 0, blink: blink)
                        }
                        .offset(x: x, y: y - Double(pokeLift))
                    }
                    .frame(height: 170, alignment: .bottom)
                    .contentShape(Rectangle())
                    .gesture(DragGesture(minimumDistance: 4)
                        .onChanged { v in
                            if drag == nil { flying = false; tx.jump(x); ty.jump(y) }
                            drag = CGSize(width: min(half, max(-half, x0(v))), height: min(0, v.translation.height + startY))
                            look = CGSize(width: v.translation.width > 0 ? 1 : -1, height: -0.4)
                        }
                        .onEnded { v in throwIt(v) })
                    .onTapGesture { poke() }
                    .onContinuousHover { if case .active(let p) = $0 { withMotion(.soft, reduceMotion: reduce) { look = CGSize(width: max(-1, min(1, (p.x - 140) / 140)), height: max(-1, min(1, (p.y - 85) / 85))) } } }
                    .accessibilityLabel("Agent character").accessibilityHint("Activate to poke")
                    .accessibilityAddTraits(.isButton)
                }
                Picker("Expression", selection: $mood) { ForEach(AgMood.allCases, id: \.self) { Text($0.rawValue.capitalized).tag($0) } }
                    .pickerStyle(.menu).onChange(of: mood) { _, m in agStage(m, face: $face, reduce: reduce) }
                HStack(alignment: .bottom, spacing: 14) {
                    ForEach([24, 48, 96], id: \.self) { s in AgentCharacter(size: CGFloat(s) * 0.5, face: face, look: look, wash: .green) }
                }
            }
        }
    }

    @State private var startX: CGFloat = 0
    @State private var startY: CGFloat = 0
    private func x0(_ v: DragGesture.Value) -> CGFloat {
        if drag == nil { startX = CGFloat(tx.value(at: Date().timeIntervalSinceReferenceDate)); startY = CGFloat(ty.value(at: Date().timeIntervalSinceReferenceDate)) }
        return v.translation.width + startX
    }

    private func throwIt(_ v: DragGesture.Value) {
        let now = Date().timeIntervalSinceReferenceDate
        let x = Double(drag?.width ?? 0), y = Double(drag?.height ?? 0)
        drag = nil
        let vx = Double(v.velocity.width), vy = Double(v.velocity.height)
        let target = min(half, max(-half, x + vx * 0.25))
        tx.release(from: x, velocity: vx, to: target, preset: .soft, at: now)
        ty.release(from: y, velocity: min(0, vy), to: 0, preset: .base, at: now)
        flying = true
        withMotion(.base, reduceMotion: reduce) { look = .zero }
        Task { @MainActor in try? await Task.sleep(nanoseconds: 1_000_000_000); flying = false }
    }

    private func poke() {
        Task { @MainActor in
            withMotion(.snap, reduceMotion: reduce) { pokeSquash = 0.8 }
            try? await Task.sleep(nanoseconds: 90_000_000)
            withMotion(.snap, reduceMotion: reduce) { pokeSquash = 1; pokeLift = 26; face = AgMood.happy.face }
            try? await Task.sleep(nanoseconds: 180_000_000)
            withMotion(.snap, reduceMotion: reduce) { pokeLift = 0; pokeSquash = 0.88 }
            try? await Task.sleep(nanoseconds: 110_000_000)
            withMotion(.snap, reduceMotion: reduce) { pokeSquash = 1 }
            try? await Task.sleep(nanoseconds: 600_000_000)
            withMotion(.base, reduceMotion: reduce) { face = mood.face }
        }
    }
}
