import SwiftUI
import Cieo

public struct CoreVitalsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "vitals", category: "SEO", name: "Core vitals bars",
        summary: "Bars stagger in on base while each value rolls its millisecond digits. Threshold bands sit behind the bars in danger, warning and success.")

    private struct Metric: Identifiable {
        let id = UUID()
        let name: String
        var value: Double
        let good: Double
        let poor: Double
        let max: Double
        var text: String
    }

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var metrics = [
        Metric(name: "LCP", value: 0.4, good: 2.5, poor: 4.0, max: 5.2, text: "1.8 s"),
        Metric(name: "INP", value: 0.2, good: 200, poor: 500, max: 640, text: "140 ms"),
        Metric(name: "CLS", value: 0.2, good: 0.1, poor: 0.25, max: 0.34, text: "0.07")
    ]
    @State private var verdict = "Measuring…"
    @State private var showBands = true
    public init() {}

    private func tint(_ m: Metric) -> Color {
        m.value <= m.good ? .green : m.value <= m.poor ? .orange : .red
    }

    public var body: some View {
        AtomStage(hint: "Re-measure the page") {
            VStack(alignment: .leading, spacing: 10) {
                Text("Core Web Vitals").font(.headline)
                ForEach(Array(metrics.enumerated()), id: \.element.id) { i, m in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(m.name).font(.subheadline.weight(.semibold))
                            Spacer()
                            RollingDigits(m.text).font(.footnote).foregroundStyle(.secondary)
                        }
                        GeometryReader { g in
                            ZStack(alignment: .leading) {
                                HStack(spacing: 0) {
                                    Rectangle().fill(Color.green.opacity(showBands ? 0.25 : 0))
                                        .frame(width: g.size.width * m.good / m.max)
                                    Rectangle().fill(Color.orange.opacity(showBands ? 0.28 : 0))
                                        .frame(width: g.size.width * (m.poor - m.good) / m.max)
                                    Rectangle().fill(Color.red.opacity(showBands ? 0.25 : 0))
                                }
                                Capsule().fill(tint(m))
                                    .frame(width: g.size.width * min(1, m.value / m.max))
                            }
                        }
                        .frame(height: 10).clipShape(Capsule())
                        .motion(.base, value: m.value)
                        .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.04), value: m.value)
                    }
                }
                SwapText(verdict).font(.subheadline.weight(.semibold))
                    .foregroundStyle(verdict == "All green ✓" ? Color.green : Color.secondary)
                    .frame(height: 24)
                Toggle("Threshold bands", isOn: $showBands).font(.caption).foregroundStyle(.secondary)
                    .nativeToggleStyle()
                Button("Re-measure", action: measure).buttonStyle(.bordered).controlSize(.small)
            }
            .frame(maxWidth: 340)
        }
        .onAppear(perform: measure)
    }

    private func measure() {
        withMotion(.base, reduceMotion: reduce) { verdict = "Measuring…" }
        let samples: [(Double, String)] = [
            (Double.random(in: 1.2...4.6), ""), (Double.random(in: 80...560), ""), (Double.random(in: 0.02...0.3), "")
        ]
        let texts = [String(format: "%.1f s", samples[0].0), "\(Int(samples[1].0)) ms", String(format: "%.2f", samples[2].0)]
        for i in metrics.indices {
            withMotion(.base, reduceMotion: reduce) {
                metrics[i].value = samples[i].0
                metrics[i].text = texts[i]
            }
        }
        let pass = samples[0].0 <= 2.5 && samples[1].0 <= 200 && samples[2].0 <= 0.1
        withMotion(.base, reduceMotion: reduce) { verdict = pass ? "All green ✓" : "Needs work — see red bars" }
    }
}
