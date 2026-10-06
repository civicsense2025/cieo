import SwiftUI
import Cieo

public struct SpringPlayAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "springplay", category: "Foundations", name: "Spring playground",
        summary: "Snap, base, soft and lazy side by side. Drag the dot and release: velocity carries into every spring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var play = Track(0.5, preset: .base)
    @State private var lanes = [SpringPreset.snap, .base, .soft, .lazy].map { Track(0.5, preset: $0) }
    @State private var pick = 1
    private let names = ["snap", "base", "soft", "lazy"]
    private let presets: [SpringPreset] = [.snap, .base, .soft, .lazy]
    private let durs = ["~200ms", "~300ms", "~440ms", "~740ms"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the dot, release to settle") {
            VStack(spacing: 16) {
                GeometryReader { g in
                    let w = max(1, g.size.width - 24)
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 12).fill(.quaternary)
                        Circle().fill(.primary).frame(width: 24, height: 24)
                            .offset(x: 12 + CGFloat(play.value(at: now)) * w)
                    }
                    .gesture(DragGesture(minimumDistance: 0).onChanged { v in
                        let f = clamp01((v.location.x - 24) / w)
                        play.jump(f); for i in lanes.indices { lanes[i].jump(f) }
                    }.onEnded { v in
                        let f = clamp01((v.location.x - 24) / w)
                        let to = f > 0.5 ? 0.0 : 1.0
                        let t = now
                        if reduce { play.jump(to); for i in lanes.indices { lanes[i].jump(to) } }
                        else {
                            play.release(from: f, velocity: 0, to: to, preset: presets[pick], at: t)
                            for i in lanes.indices { lanes[i].release(from: f, velocity: 0, to: to, at: t) }
                        }
                    })
                }
                .frame(height: 64)
                TimelineView(.animation(paused: reduce)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    VStack(spacing: 8) {
                        ForEach(0..<4, id: \.self) { i in
                            GeometryReader { g in
                                let w = max(1, g.size.width - 14)
                                ZStack(alignment: .leading) {
                                    Text("\(names[i]) · \(durs[i])").font(.caption).foregroundStyle(.secondary)
                                        .frame(maxWidth: .infinity, alignment: .trailing)
                                    Circle().fill(.primary).frame(width: 14, height: 14)
                                        .offset(x: CGFloat(lanes[i].value(at: t)) * w)
                                }
                            }
                            .frame(height: 24)
                        }
                    }
                }
                .frame(height: 4 * 24 + 3 * 8)
                Text("\(names[pick]) · \(durs[pick])")
                    .font(.system(size: 13, design: .monospaced)).foregroundStyle(.secondary)
                HStack(spacing: 8) {
                    Text("Preset").font(.caption).foregroundStyle(.secondary)
                    ForEach(0..<4, id: \.self) { i in
                        Button(names[i]) { pick = i; play.preset = presets[i] }
                            .buttonStyle(.bordered).controlSize(.small)
                            .frame(minHeight: 32)
                            .tint(pick == i ? .accentColor : nil)
                    }
                }
            }
            .frame(maxWidth: 340)
        }
    }

    private var now: Double { Date().timeIntervalSinceReferenceDate }
    private func clamp01(_ v: Double) -> Double { min(1, max(0, v)) }
}
