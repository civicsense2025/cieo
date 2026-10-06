import SwiftUI
import Cieo

public struct DurationLadderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "durationladder", category: "Foundations", name: "Duration ladder",
        summary: "Four durations from snappy to ambient. Tap each step to feel it; millisecond labels roll on digits.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var tracks = [SpringPreset.snap, .base, .soft, .lazy].map { Track(0, preset: $0) }
    private let names = ["snap", "base", "soft", "lazy"]
    private let ms = [200, 300, 440, 740]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap each step to feel it") {
            VStack(spacing: 8) {
                ForEach(0..<4, id: \.self) { i in
                    HStack(spacing: 8) {
                        Button(names[i]) { toggle(i) }
                            .buttonStyle(.bordered).frame(maxWidth: .infinity, minHeight: 40)
                        TimelineView(.animation(paused: reduce)) { ctx in
                            let t = ctx.date.timeIntervalSinceReferenceDate
                            GeometryReader { g in
                                Circle().fill(.primary).frame(width: 14, height: 14)
                                    .offset(x: CGFloat(tracks[i].value(at: t)) * max(1, g.size.width - 14), y: 5)
                            }
                            .frame(width: 64, height: 24)
                        }
                        RollingDigits(ms[i]).font(.system(size: 13, design: .monospaced))
                        Text("ms").font(.caption).foregroundStyle(.secondary)
                    }
                }
                HStack(spacing: 8) {
                    Button("Play all") { playAll() }
                        .buttonStyle(.bordered).frame(minHeight: 32)
                    Text("fires every step at once").font(.caption).foregroundStyle(.secondary)
                }
                .padding(.top, 8)
            }
            .frame(maxWidth: 340)
        }
    }

    private func toggle(_ i: Int) {
        let v = tracks[i].target > 0.5 ? 0.0 : 1.0
        if reduce { tracks[i].jump(v) } else { tracks[i].set(v, at: Date().timeIntervalSinceReferenceDate) }
    }

    private func playAll() {
        let t = Date().timeIntervalSinceReferenceDate
        for i in tracks.indices {
            if reduce { tracks[i].jump(1) } else { tracks[i].set(1, at: t) }
        }
    }
}
