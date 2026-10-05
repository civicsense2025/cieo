import SwiftUI
import Cieo

public struct ScoreGaugeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gauge", category: "SEO", name: "Score gauge",
        summary: "The arc and the number ride the same lazy spring, so they always agree. The color shifts through danger, warning and success as the value crosses 50 and 80, and the verdict swaps when the run settles.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var score = Track(0, preset: .lazy)
    @State private var verdict = ""
    @State private var task: Task<Void, Never>?
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Run a new audit") {
            VStack(spacing: 6) {
                TimelineView(.animation(paused: !score.isMoving)) { tl in
                    let x = max(0, score.value(at: tl.date.timeIntervalSinceReferenceDate))
                    ZStack(alignment: .bottom) {
                        Arc().stroke(.quaternary, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                        Arc().trim(from: 0, to: min(1, x / 100)).stroke(color(x), style: StrokeStyle(lineWidth: 12, lineCap: .round))
                        Text("\(Int(x.rounded()))").font(.system(size: 34, weight: .semibold)).monospacedDigit()
                            .foregroundStyle(color(x)).padding(.bottom, 4)
                    }
                    .accessibilityElement().accessibilityLabel("Score").accessibilityValue("\(Int(x.rounded())) of 100")
                }
                .frame(width: 180, height: 100)
                SwapText(verdict).font(.subheadline.weight(.semibold)).frame(height: 20)
                Button("Run audit", action: run).font(.caption).buttonStyle(.borderless)
            }
        }
        .onAppear(perform: run)
    }

    private func color(_ x: Double) -> Color {
        let red = (0.92, 0.27, 0.27), amber = (0.96, 0.62, 0.04), green = (0.20, 0.70, 0.35)
        let k1 = min(1, max(0, (x - 40) / 20)), k2 = min(1, max(0, (x - 70) / 20))
        func mix(_ a: (Double, Double, Double), _ b: (Double, Double, Double), _ k: Double) -> (Double, Double, Double) {
            (a.0 + (b.0 - a.0) * k, a.1 + (b.1 - a.1) * k, a.2 + (b.2 - a.2) * k)
        }
        let c = mix(mix(red, amber, k1), green, k2)
        return Color(red: c.0, green: c.1, blue: c.2)
    }

    private func run() {
        task?.cancel()
        let target = Double(Int.random(in: 38...97))
        withMotion(.base, reduceMotion: reduce) { verdict = "" }
        score.jump(0)
        if reduce { score.jump(target); verdict = band(target); return }
        score.set(target, at: now())
        let wait = SpringPreset.lazy.settleTime(epsilon: 0.5 / target)
        task = Task {
            try? await Task.sleep(for: .seconds(wait))
            if !Task.isCancelled { verdict = band(target) }
        }
    }

    private func band(_ x: Double) -> String { x >= 80 ? "Good" : x >= 50 ? "Needs work" : "Poor" }
}

private struct Arc: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.addArc(center: CGPoint(x: r.midX, y: r.maxY - 8), radius: r.width / 2 - 14, startAngle: .degrees(180), endAngle: .degrees(360), clockwise: false)
        return p
    }
}
