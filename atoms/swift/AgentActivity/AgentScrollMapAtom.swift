import SwiftUI
import Cieo

public struct AgentScrollMapAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentscroll-map", category: "Agent activity", name: "Agent scroll map",
        summary: "The map is the whole page squeezed into a strip. The agent’s window (tinted) stretches with its leading edge first as it scrolls; every band it covers fills from the left, the Seen counter rolls, and findings drop a square pin on both the map and the page. Your own window is outlined: drag it 1:1 and it settles from your release velocity, or click the map or a section chip to glide there.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var agentLo: CGFloat = 0
    @State private var seen: Set<Int> = []
    @State private var finds: [Int] = []
    @State private var track = Track(0, preset: .base)
    @State private var dragY: Double?
    @State private var moving = false
    @State private var token = 0
    public init() {}

    private let h: CGFloat = 200, win: CGFloat = 0.2, bands = 8
    private let findBands = [2, 5]

    public var body: some View {
        AtomStage(hint: "Drag your window, or tap the map") {
            HStack(alignment: .top, spacing: 12) {
                map
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 2) { Text("Seen"); RollingDigits(seen.count * 100 / bands); Text("%") }.font(.callout.weight(.semibold))
                    HStack(spacing: 2) { Text("Findings"); RollingDigits(finds.count); Text("of \(findBands.count)") }.font(.caption).foregroundStyle(.secondary)
                    HStack(spacing: 4) { AgentMark(size: 14); Text("Agent window").font(.caption) }
                    HStack(spacing: 4) { RoundedRectangle(cornerRadius: 2).strokeBorder(Color.primary).frame(width: 14, height: 14); Text("Your window").font(.caption) }
                    Button("Replay") { token += 1 }.buttonStyle(AgPress())
                }
            }
        }
        .task(id: token) {
            seen = []; finds = []; withMotion(.base, reduceMotion: reduce) { agentLo = 0 }
            for i in 0...6 {
                withMotion(.base, reduceMotion: reduce) {
                    agentLo = min(1 - win, CGFloat(i) * 0.133)
                    let top = Int(agentLo * CGFloat(bands)), bot = Int(min(0.999, agentLo + win) * CGFloat(bands))
                    for b in top...bot { seen.insert(b); if findBands.contains(b), !finds.contains(b) { finds.append(b) } }
                }
                try? await Task.sleep(nanoseconds: 1_100_000_000)
                if Task.isCancelled { return }
            }
        }
    }

    private func userLo(_ t: Double) -> CGFloat { CGFloat(min(1 - Double(win), max(0, dragY ?? track.value(at: t)))) }

    private var map: some View {
        TimelineView(.animation(paused: !moving && dragY == nil)) { ctx in
            let t = ctx.date.timeIntervalSinceReferenceDate
            ZStack(alignment: .topLeading) {
                VStack(spacing: 2) {
                    ForEach(0..<bands, id: \.self) { b in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3).fill(.quaternary)
                            GeometryReader { g in RoundedRectangle(cornerRadius: 3).fill(Color.accentColor.opacity(0.5)).frame(width: seen.contains(b) ? g.size.width : 0).animation(reduce ? nil : .motion(.soft), value: seen.contains(b)) }
                            if finds.contains(b) { AgPinMark(label: "!", tone: .warning).scaleEffect(0.6).frame(maxWidth: .infinity, alignment: .trailing).transition(.scale) }
                        }
                    }
                }
                AgSpan(lo: agentLo * h, hi: (agentLo + win) * h, vertical: true, fill: Color.accentColor.opacity(0.22))
                RoundedRectangle(cornerRadius: 4).strokeBorder(Color.primary, lineWidth: 1.5)
                    .frame(height: win * h).offset(y: userLo(t) * h)
                    .accessibilityLabel("Your window").accessibilityAdjustableAction { d in
                        glide(to: userLo(Date().timeIntervalSinceReferenceDate) + (d == .increment ? 0.15 : -0.15))
                    }
            }
            .frame(width: 70, height: h).contentShape(Rectangle())
            .gesture(DragGesture(minimumDistance: 0)
                .onChanged { v in dragY = Double(min(1 - win, max(0, v.location.y / h - win / 2))); moving = false }
                .onEnded { v in
                    let start = dragY ?? 0
                    dragY = nil; track.jump(start)
                    let vel = Double(v.velocity.height / h)
                    release(from: start, vel: vel, to: start + vel * 0.12)
                })
        }
        .frame(width: 70, height: h)
    }

    private func glide(to y: Double) { release(from: Double(userLo(Date().timeIntervalSinceReferenceDate)), vel: 0, to: y) }
    private func release(from: Double, vel: Double, to: Double) {
        let now = Date().timeIntervalSinceReferenceDate, tgt = min(1 - Double(win), max(0, to))
        if reduce { track.jump(tgt); return }
        track.release(from: from, velocity: vel, to: tgt, preset: .base, at: now)
        moving = true
        Task { @MainActor in try? await Task.sleep(nanoseconds: 900_000_000); moving = false }
    }
}
