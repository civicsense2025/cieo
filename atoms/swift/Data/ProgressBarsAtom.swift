import SwiftUI
import Cieo

public struct ProgressBarsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "progress", category: "Data", name: "Progress bars",
        summary: "Fills stagger by 40ms and percentages count with the same spring, so number and bar always agree.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let names = ["Design", "Build", "Content", "Launch"]
    @State private var tracks = Array(repeating: Track(0, preset: .base), count: 4)
    public init() {}

    public var body: some View {
        AtomStage(hint: "Shuffle to retarget every bar") {
            VStack(spacing: 18) {
                TimelineView(.motion(tracks)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    VStack(spacing: 14) {
                        ForEach(names.indices, id: \.self) { i in
                            let v = max(0, min(100, tracks[i].value(at: t)))
                            VStack(spacing: 6) {
                                HStack {
                                    Text(names[i])
                                    Spacer()
                                    Text("\(Int(v.rounded()))%").monospacedDigit().foregroundStyle(.secondary)
                                }
                                .font(.caption)
                                GeometryReader { g in
                                    ZStack(alignment: .leading) {
                                        Capsule().fill(.quaternary)
                                        Capsule().fill(.primary).frame(width: g.size.width * v / 100)
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
            }
        }
        .onAppear(perform: shuffle)
    }

    private func shuffle() {
        for i in tracks.indices {
            DataMotion.retarget(&tracks[i], to: Double(Int.random(in: 15...100)), preset: .base, delay: Double(i) * 0.04, reduce: reduce)
        }
    }
}
