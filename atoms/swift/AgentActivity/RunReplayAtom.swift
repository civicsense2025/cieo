import SwiftUI
import Cieo

public struct RunReplayAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "runreplay", category: "Agent activity", name: "Agent run replay",
        summary: "The playhead is the only state: the page, the cursor, the typed text, the pins and the highlighted event are all pure functions of its position. Dragging it moves 1:1 and the page jumps to that moment; on release it coasts a few pixels from your release velocity. Play advances it at 1× or 2×, the event row at the playhead lifts and the list scrolls to keep it centred, and clicking a row glides the playhead there on a spring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var track = Track(0, preset: .base)
    @State private var dragP: Double?
    @State private var playing = false
    @State private var speed = 1.0
    @State private var settling = false
    @State private var base = 0.0
    @State private var startedAt = Date()
    public init() {}

    private let events = [(0.0, "Open /signup"), (0.25, "Click email field"), (0.5, "Type name@company.com"), (0.75, "Click Create workspace"), (1.0, "Pin: label is vague")]
    private let length = 12.0

    private func p(_ t: Double) -> Double {
        if let d = dragP { return d }
        if playing { return min(1, base + Date().timeIntervalSince(startedAt) * speed / length) }
        return min(1, max(0, track.value(at: t)))
    }

    public var body: some View {
        AtomStage(hint: "Drag the playhead; Play runs the clock") {
            TimelineView(.animation(paused: !playing && !settling && dragP == nil)) { ctx in
                let pos = p(ctx.date.timeIntervalSinceReferenceDate)
                let ev = events.lastIndex { $0.0 <= pos + 0.001 } ?? 0
                VStack(alignment: .leading, spacing: 8) {
                    ZStack(alignment: .topLeading) {
                        RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04))
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Start your review").font(.headline)
                            Text(String("name@company.com".prefix(Int(max(0, min(1, (pos - 0.3) / 0.25)) * 16)))).font(.caption).padding(6).frame(maxWidth: .infinity, alignment: .leading).overlay(RoundedRectangle(cornerRadius: 5).strokeBorder(.quaternary))
                            Text("Create workspace").font(.caption.weight(.semibold)).foregroundStyle(.white).padding(6).background(Color.accentColor, in: RoundedRectangle(cornerRadius: 6)).scaleEffect(pos > 0.74 && pos < 0.8 ? 0.96 : 1)
                        }.padding(12)
                        if pos >= 1 { AgPinMark(label: "1").position(x: 190, y: 100).transition(.scale) }
                        AgCursor().position(x: 30 + 130 * min(1, pos * 1.3), y: 40 + 70 * min(1, pos * 1.3))
                    }.frame(height: 130)
                    GeometryReader { g in
                        ZStack(alignment: .leading) {
                            Capsule().fill(.quaternary).frame(height: 4)
                            Circle().fill(Color.accentColor).frame(width: 16, height: 16).offset(x: pos * (g.size.width - 16))
                                .accessibilityLabel("Playhead").accessibilityValue("\(Int(pos * length)) seconds")
                        }
                        .frame(height: 20).contentShape(Rectangle())
                        .gesture(DragGesture(minimumDistance: 0)
                            .onChanged { v in playing = false; dragP = min(1, max(0, v.location.x / g.size.width)) }
                            .onEnded { v in let s = dragP ?? 0; dragP = nil; track.jump(s); coast(from: s, vel: v.velocity.width / g.size.width) })
                    }.frame(height: 20)
                    HStack {
                        Button { toggle(pos) } label: { Image(systemName: playing ? "pause.fill" : "play.fill") }.accessibilityLabel(playing ? "Pause" : "Play")
                        Button(speed == 1 ? "1×" : "2×") { base = pos; startedAt = Date(); speed = speed == 1 ? 2 : 1 }
                        Text(String(format: "0:%02d", Int(pos * length))).font(.caption.monospacedDigit())
                    }.buttonStyle(AgPress())
                    VStack(alignment: .leading, spacing: 2) {
                        ForEach(events.indices, id: \.self) { i in
                            Button { glide(to: events[i].0) } label: { Text(events[i].1).font(.caption).frame(maxWidth: .infinity, alignment: .leading).padding(4)
                                .background(i == ev ? Color.accentColor.opacity(0.18) : .clear, in: RoundedRectangle(cornerRadius: 5)).offset(x: i == ev ? 3 : 0) }.buttonStyle(.plain)
                        }
                    }.animation(reduce ? nil : .motion(.snap), value: ev)
                }
            }
            .frame(maxWidth: 360)
        }
    }

    private func toggle(_ pos: Double) {
        if playing { track.jump(pos); playing = false } else { base = pos >= 1 ? 0 : pos; startedAt = Date(); playing = true }
    }
    private func coast(from s: Double, vel: Double) { glide(to: s + vel * 0.1, from: s, vel: vel) }
    private func glide(to x: Double, from: Double? = nil, vel: Double = 0) {
        let now = Date().timeIntervalSinceReferenceDate, cur = from ?? p(now), tgt = min(1, max(0, x))
        playing = false
        if reduce { track.jump(tgt); return }
        track.release(from: cur, velocity: vel, to: tgt, preset: .base, at: now)
        settling = true
        Task { @MainActor in try? await Task.sleep(nanoseconds: 900_000_000); settling = false }
    }
}
