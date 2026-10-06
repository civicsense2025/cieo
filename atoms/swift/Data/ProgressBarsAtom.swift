import SwiftUI
import Cieo

public struct ProgressBarsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "progress", category: "Data", name: "Progress bars",
        summary: "Fills stagger by 40ms and percentages count with the same spring, so number and bar always agree.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let names = ["Design", "Build", "Content", "Launch"]
    @State private var tracks = Array(repeating: Track(0, preset: .base), count: 4)
    @State private var done = Array(repeating: Track(0, preset: .base), count: 4)
    @State private var tint = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Shuffle to retarget every bar") {
            VStack(spacing: 18) {
                TimelineView(.motion(tracks, done)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    VStack(spacing: 14) {
                        ForEach(names.indices, id: \.self) { i in
                            let v = max(0, min(100, tracks[i].value(at: t)))
                            let a = tint ? max(0, min(1, done[i].value(at: t))) : 0
                            VStack(spacing: 6) {
                                HStack {
                                    Text(names[i])
                                    Spacer()
                                    Image(systemName: "checkmark").font(.caption.weight(.bold)).foregroundStyle(.green).opacity(a)
                                    Text("\(Int(v.rounded()))%").monospacedDigit().foregroundStyle(.secondary)
                                }
                                .font(.caption)
                                GeometryReader { g in
                                    ZStack(alignment: .leading) {
                                        Capsule().fill(.quaternary)
                                        Capsule().fill(.primary).frame(width: g.size.width * v / 100)
                                        Capsule().fill(.green).frame(width: g.size.width * v / 100).opacity(a)
                                    }
                                }
                                .frame(height: 8)
                            }
                            .accessibilityElement(children: .combine)
                            .accessibilityValue("\(Int(v.rounded())) percent")
                        }
                    }
                }
                .frame(maxWidth: 340)
                Button("Shuffle", action: shuffle).buttonStyle(.bordered)
                HStack(spacing: 10) {
                    Button("Fill 100%", action: fillFull).buttonStyle(.bordered)
                    Toggle("Success tint", isOn: $tint)
                }
                .font(.caption).foregroundStyle(.secondary)
            }
        }
        .onAppear(perform: shuffle)
    }

    private func shuffle() {
        for i in tracks.indices {
            let v = Double(Int.random(in: 15...100))
            setBar(i, to: v)
        }
    }

    private func fillFull() {
        for i in tracks.indices { setBar(i, to: 100) }
    }

    private func setBar(_ i: Int, to v: Double) {
        DataMotion.retarget(&tracks[i], to: v, preset: .base, delay: Double(i) * 0.04, reduce: reduce)
        DataMotion.retarget(&done[i], to: v >= 100 ? 1 : 0, preset: .base, delay: Double(i) * 0.04, reduce: reduce)
    }
}
