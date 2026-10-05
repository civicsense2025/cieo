import SwiftUI
import Cieo

public struct BarChartAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "bars", category: "Data", name: "Bar chart",
        summary: "Switching datasets retargets every bar mid-flight with a stagger. Labels stay on a fixed 0–100 scale.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let sets: [[Double]] = [[34, 52, 41, 68, 59, 77, 64, 88], [48, 44, 62, 58, 81, 70, 92, 85]]
    @State private var year = 0
    @State private var bars = Array(repeating: Track(0, preset: .base), count: 8)
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch the year to retarget the bars") {
            VStack(alignment: .leading, spacing: 10) {
                Picker("Year", selection: $year) { Text("2025").tag(0); Text("2026").tag(1) }
                    .pickerStyle(.segmented).frame(width: 140)
                TimelineView(.motion(bars)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    Canvas { c, _ in
                        let x0 = 30.0, y0 = 140.0, h = 130.0, bw = 24.0, gap = (320 - x0 - 8 * bw) / 8
                        for v in [0.0, 50, 100] {
                            let y = y0 - v / 100 * h
                            var l = Path(); l.move(to: CGPoint(x: x0, y: y)); l.addLine(to: CGPoint(x: 320, y: y))
                            c.stroke(l, with: .color(.primary.opacity(0.12)), lineWidth: 1)
                            c.draw(Text("\(Int(v))").font(.system(size: 11)).foregroundStyle(.secondary), at: CGPoint(x: x0 - 6, y: y), anchor: .trailing)
                        }
                        for i in bars.indices {
                            let bh = max(0, bars[i].value(at: t)) / 100 * h
                            let r = CGRect(x: x0 + gap / 2 + Double(i) * (bw + gap), y: y0 - bh, width: bw, height: bh)
                            c.fill(Path(roundedRect: r, cornerRadius: 4), with: .color(.primary))
                        }
                    }
                    .aspectRatio(2, contentMode: .fit)
                }
                .accessibilityElement()
                .accessibilityLabel("Signups per quarter-month")
                .accessibilityValue(sets[year].map { "\(Int($0))" }.joined(separator: ", "))
            }
            .frame(maxWidth: 340)
        }
        .onAppear { for i in bars.indices { bars[i].jump(sets[0][i]) } }
        .onChange(of: year) { _, new in
            for i in bars.indices { DataMotion.retarget(&bars[i], to: sets[new][i], delay: Double(i) * 0.03, reduce: reduce) }
        }
    }
}
