import SwiftUI
import Cieo

public struct StaggerLabAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "staggerlab", category: "Foundations", name: "Stagger lab",
        summary: "Compose a stagger: dial delay, flip order. Below, kept separate, the 60ms edge trail follows every slide.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var tracks = [0.3, 0.55, 0.8, 0.45, 0.95].map { Track($0) }
    @State private var delayMs = 40.0
    @State private var reversed = false
    @State private var leadT = Track(0)
    @State private var trailT = Track(0)
    @State private var k = 0
    private static let alt = [0.85, 0.4, 0.25, 0.7, 0.35]
    private static let base = [0.3, 0.55, 0.8, 0.45, 0.95]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Stagger composes starts · the trail follows 60ms later") {
            VStack(spacing: 16) {
                TimelineView(.animation(paused: reduce)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    HStack(alignment: .bottom, spacing: 8) {
                        ForEach(tracks.indices, id: \.self) { i in
                            RoundedRectangle(cornerRadius: 6).fill(.primary)
                                .frame(maxWidth: .infinity, minHeight: 8, maxHeight: max(8, tracks[i].value(at: t) * 96))
                        }
                    }
                    .frame(height: 96)
                }
                Text("delay \(Int(delayMs))ms · \(reversed ? "reverse" : "forward")")
                    .font(.system(size: 13, design: .monospaced)).foregroundStyle(.secondary)
                HStack(spacing: 8) {
                    Button("Play") { play() }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity, minHeight: 36)
                    Picker("Order", selection: $reversed) {
                        Text("forward").tag(false); Text("reverse").tag(true)
                    }
                    .pickerStyle(.segmented).frame(width: 150)
                }
                HStack(spacing: 8) {
                    Text("Delay").font(.caption).foregroundStyle(.secondary)
                    Slider(value: $delayMs, in: 0...80, step: 5).frame(minHeight: 32)
                    Text("\(Int(delayMs))ms").font(.system(size: 13, design: .monospaced))
                }
                Divider()
                VStack(spacing: 8) {
                    Text("Separate demo · 60ms edge trail").font(.caption).foregroundStyle(.secondary)
                    TimelineView(.animation(paused: reduce)) { ctx in
                        let t = ctx.date.timeIntervalSinceReferenceDate
                        GeometryReader { g in
                            let w = max(1, g.size.width - 32)
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 8).fill(.quaternary)
                                Circle().fill(.primary).frame(width: 12, height: 12)
                                    .offset(x: 10 + CGFloat(leadT.value(at: t)) * w)
                                Circle().stroke(Color.accentColor, lineWidth: 2).frame(width: 12, height: 12)
                                    .offset(x: 10 + CGFloat(trailT.value(at: t)) * w)
                            }
                        }
                        .frame(height: 32)
                    }
                    Button("Slide edge") { slide() }.buttonStyle(.bordered).frame(minHeight: 32)
                }
            }
            .frame(maxWidth: 340)
        }
    }

    private func play() {
        k ^= 1
        let t0 = Date().timeIntervalSinceReferenceDate
        let tg = k == 1 ? Self.alt : Self.base
        for i in tracks.indices {
            let at = t0 + (reversed ? Double(4 - i) : Double(i)) * delayMs / 1000
            if reduce { tracks[i].jump(tg[i]) } else { tracks[i].set(tg[i], preset: .base, at: at) }
        }
    }

    private func slide() {
        let v = leadT.target > 0.5 ? 0.0 : 1.0
        let t = Date().timeIntervalSinceReferenceDate
        if reduce { leadT.jump(v); trailT.jump(v) }
        else { leadT.set(v, at: t); trailT.set(v, at: t + Motion.lag) }
    }
}
