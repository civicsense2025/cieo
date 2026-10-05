import SwiftUI
import MotionKit

struct AgRole: Identifiable {
    let id: Int
    let name: String
    let job: String
    let symbol: String
    let wash: Color
    let mood: AgMood
}

/// A row of role agents with one on stage. Tapping one makes the neighbours lean away (rippling outward), the stage agent hop back, and the chosen one hop forward, land with a squash and play its signature.
struct AgentLineup: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let roles: [AgRole]
    @State private var stage = 0
    @State private var lean: [Int: Double] = [:]
    @State private var lift: [Int: CGFloat] = [:]
    @State private var squash: [Int: CGFloat] = [:]
    @State private var signature: Int?
    @State private var faces: [Int: AgFace] = [:]
    @State private var pointer = CGSize.zero

    var body: some View {
        VStack(spacing: 10) {
            VStack(spacing: 2) {
                SwapText(roles[stage].name).font(.headline)
                SwapText(roles[stage].job).font(.caption).foregroundStyle(.secondary)
            }
            figure(roles[stage], size: 92, big: true)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .bottom, spacing: 8) {
                    ForEach(roles) { r in
                        Button { choose(r.id) } label: { figure(r, size: 38, big: false) }
                            .buttonStyle(.plain).accessibilityLabel("\(r.name), \(r.job)")
                            .accessibilityAddTraits(stage == r.id ? .isSelected : [])
                    }
                }.padding(.horizontal, 8).padding(.top, 14)
            }
            Button("Play signature") { play(stage) }.buttonStyle(AgPress())
        }
        .onContinuousHover { if case .active(let p) = $0 { pointer = CGSize(width: max(-1, min(1, (p.x - 160) / 160)), height: max(-1, min(1, (p.y - 90) / 90))) } }
    }

    private func figure(_ r: AgRole, size: CGFloat, big: Bool) -> some View {
        AgentIdle(phase: Double(r.id) * 0.9) { blink, breathe in
            ZStack(alignment: .topTrailing) {
                AgentCharacter(size: size, face: faces[r.id] ?? r.mood.face, look: pointer, squash: CGSize(width: 1 + (1 - (squash[r.id] ?? 1)) * 0.5, height: (squash[r.id] ?? 1) * breathe),
                               lean: lean[r.id] ?? 0, wash: r.wash, spin: signature == r.id ? 360 : 0, blink: blink)
                Image(systemName: r.symbol).font(.system(size: size * 0.3)).padding(size * 0.05)
                    .background(.background, in: Circle()).overlay(Circle().strokeBorder(Color.primary, lineWidth: 1))
                    .rotationEffect(.degrees(-(lean[r.id] ?? 0) * 0.8 + (signature == r.id ? 20 : 0)))
                    .offset(x: size * 0.1 - (lean[r.id] ?? 0) * 0.4, y: -size * 0.02)
            }
            .offset(y: -(lift[r.id] ?? 0))
            .animation(reduce ? nil : .motion(.soft), value: lean[r.id])
            .animation(reduce ? nil : .motion(.snap), value: lift[r.id])
            .animation(reduce ? nil : .motion(.snap), value: squash[r.id])
            .animation(reduce ? nil : .motion(.soft), value: signature)
        }
        .opacity(!big && stage == r.id ? 0.35 : 1)
    }

    private func choose(_ i: Int) {
        guard i != stage else { play(i); return }
        let old = stage
        Task { @MainActor in
            for r in roles where r.id != i {
                let d = r.id - i
                let delay = Double(abs(d)) * 0.03
                Task { @MainActor in
                    try? await Task.sleep(nanoseconds: UInt64(min(Motion.staggerMax, delay) * 1e9))
                    withMotion(.soft, reduceMotion: reduce) { lean[r.id] = d < 0 ? -10 : 10 }
                }
            }
            withMotion(.snap, reduceMotion: reduce) { lift[old] = 14 }
            try? await Task.sleep(nanoseconds: 120_000_000)
            withMotion(.snap, reduceMotion: reduce) { lift[old] = 0 }
            withMotion(.base, reduceMotion: reduce) { stage = i; lift[i] = 24 }
            try? await Task.sleep(nanoseconds: 160_000_000)
            withMotion(.snap, reduceMotion: reduce) { lift[i] = 0; squash[i] = 0.85 }
            try? await Task.sleep(nanoseconds: 120_000_000)
            withMotion(.snap, reduceMotion: reduce) { squash[i] = 1 }
            withMotion(.soft, reduceMotion: reduce) { lean = [:] }
            play(i)
        }
    }

    private func play(_ i: Int) {
        Task { @MainActor in
            withMotion(.base, reduceMotion: reduce) { faces[i] = AgMood.happy.face; signature = i }
            try? await Task.sleep(nanoseconds: 800_000_000)
            withMotion(.base, reduceMotion: reduce) { faces[i] = roles[i].mood.face; signature = nil }
        }
    }
}
