import SwiftUI
import Cieo

public struct EasingCompareAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "easingcompare", category: "Foundations", name: "Easing compare",
        summary: "The same move on three springs: clean base, a breath of overshoot, and slow smooth. Retarget mid-flight.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var tracks = [Track(0, preset: .base), Track(0, preset: .snap), Track(0, preset: SpringPreset(w: 12))]
    @State private var to = 1.0
    private let names = ["base", "emphasized", "smooth"]
    private let colors: [Color] = [.primary, Color.accentColor, .secondary]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Retarget proves every spring is a resumable sum") {
            VStack(spacing: 16) {
                TimelineView(.animation(paused: reduce)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    VStack(spacing: 8) {
                        ForEach(0..<3, id: \.self) { i in
                            GeometryReader { g in
                                let w = max(1, g.size.width - 14)
                                ZStack(alignment: .leading) {
                                    Text(names[i]).font(.caption).foregroundStyle(.secondary)
                                        .frame(maxWidth: .infinity, alignment: .trailing)
                                    Circle().fill(colors[i]).frame(width: 14, height: 14)
                                        .offset(x: CGFloat(min(1.15, max(-0.15, tracks[i].value(at: t)))) * w)
                                }
                            }
                            .frame(height: 28)
                        }
                        Text(live(at: ctx.date.timeIntervalSinceReferenceDate))
                            .font(.system(size: 13, design: .monospaced)).foregroundStyle(.secondary)
                    }
                }
                HStack(spacing: 8) {
                    Button("Run") { to = to > 0.5 ? 0 : 1; go(to) }
                        .buttonStyle(.borderedProminent).frame(maxWidth: .infinity, minHeight: 36)
                    Button("Retarget mid-flight") { go(0.15) }
                        .buttonStyle(.bordered).frame(minHeight: 32)
                }
                Text("Interrupts the move").font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: 340)
        }
    }

    private func live(at t: Double) -> String {
        zip(names, tracks).map { n, x in "\(n) \(String(format: "%.2f", min(1, max(0, x.value(at: t)))))" }.joined(separator: " · ")
    }

    private func go(_ v: Double) {
        let t = Date().timeIntervalSinceReferenceDate
        if reduce { for i in tracks.indices { tracks[i].jump(v) } }
        else { for i in tracks.indices { tracks[i].set(v, at: t) } }
    }
}
