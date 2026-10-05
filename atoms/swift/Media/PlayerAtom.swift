import SwiftUI
import MotionKit

private struct PlayPauseShape: Shape {
    var k: Double
    var animatableData: Double { get { k } set { k = newValue } }
    private static let play: [(Double, Double)] = [(7, 5), (12.5, 8.4), (12.5, 15.6), (7, 19), (12.5, 8.4), (19, 12), (19, 12), (12.5, 15.6)]
    private static let pause: [(Double, Double)] = [(6, 5), (10, 5), (10, 19), (6, 19), (14, 5), (18, 5), (18, 19), (14, 19)]
    func path(in r: CGRect) -> Path {
        let pts = zip(Self.play, Self.pause).map { CGPoint(x: (($0.0 + ($1.0 - $0.0) * k)) / 24 * r.width, y: ($0.1 + ($1.1 - $0.1) * k) / 24 * r.height) }
        var p = Path()
        for half in [0, 4] {
            p.move(to: pts[half]); pts[(half + 1)..<(half + 4)].forEach { p.addLine(to: $0) }; p.closeSubpath()
        }
        return p
    }
}

public struct PlayerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "player", category: "Media", name: "Player",
        summary: "Play and pause share eight points on one spring. Progress is computed from the play start time, so scrubbing just rewrites that start.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let duration = 204.0
    @State private var playing = false
    @State private var p0 = 0.32
    @State private var t0 = DataMotion.now
    @State private var held = false
    @State private var hp = 0.0
    @State private var grow = Track(0, preset: .snap)
    public init() {}

    private func progress(_ t: Double) -> Double { playing ? (p0 + (t - t0) / duration).truncatingRemainder(dividingBy: 1) : p0 }
    private func seek(_ p: Double) { p0 = max(0, min(1, p)); t0 = DataMotion.now }

    public var body: some View {
        AtomStage(hint: "Play, then drag the scrubber") {
            VStack(spacing: 14) {
                HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: 10).fill(.primary).frame(width: 44, height: 44).accessibilityHidden(true)
                    VStack(alignment: .leading) { Text("Side A, Track 03").font(.subheadline.weight(.semibold)); Text("Demo recording").font(.caption).foregroundStyle(.secondary) }
                    Spacer()
                    Button {
                        p0 = progress(DataMotion.now); t0 = DataMotion.now
                        withMotion(.base, reduceMotion: reduce) { playing.toggle() }
                    } label: {
                        PlayPauseShape(k: playing ? 1 : 0).fill(.background).frame(width: 22, height: 22)
                            .frame(width: 40, height: 40).background(.primary, in: Circle())
                    }
                    .buttonStyle(.plain).accessibilityLabel(playing ? "Pause" : "Play")
                }
                TimelineView(.animation) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    let p = held ? hp : progress(t), g = grow.value(at: t)
                    let bh = 4 + 4 * g, ts = 8 + 8 * g
                    VStack(spacing: 6) {
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                Capsule().fill(.quaternary).frame(height: bh)
                                Capsule().fill(.primary).frame(width: geo.size.width * p, height: bh)
                                Circle().fill(.primary).frame(width: ts, height: ts).offset(x: geo.size.width * p - ts / 2)
                            }
                            .frame(maxHeight: .infinity)
                            .contentShape(Rectangle())
                            .gesture(DragGesture(minimumDistance: 0)
                                .onChanged { d in
                                    if !held { held = true; DataMotion.retarget(&grow, to: 1, reduce: reduce) }
                                    hp = max(0, min(1, d.location.x / geo.size.width))
                                }
                                .onEnded { _ in held = false; seek(hp); DataMotion.retarget(&grow, to: 0, reduce: reduce) })
                            .onHover { if !held { DataMotion.retarget(&grow, to: $0 ? 0.5 : 0, reduce: reduce) } }
                        }
                        .frame(height: 20)
                        HStack {
                            let s = Int(p * duration)
                            Text("\(s / 60):\(String(format: "%02d", s % 60))")
                            Spacer(); Text("3:24")
                        }
                        .font(.caption).monospacedDigit().foregroundStyle(.secondary)
                    }
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("Seek")
                    .accessibilityValue("\(Int(p * 100)) percent")
                    .accessibilityAdjustableAction { seek(progress(DataMotion.now) + ($0 == .increment ? 0.05 : -0.05)) }
                }
            }
            .padding(16).frame(maxWidth: 340)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }
}
