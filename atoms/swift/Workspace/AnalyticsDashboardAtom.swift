import SwiftUI
import MotionKit

public struct AnalyticsDashboardAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "dashboard", category: "Workspace", name: "Analytics dashboard",
        summary: "Change the range or the source and three regions answer in order, 80ms apart. First the stat numbers spring and each delta chip blurs over to its new sign and color. Then the line morphs point by point, left to right, onto a rescaled axis whose labels swap. Last the table rows spring to their new ranks while the view counts roll.")

    private struct Page: Identifiable { let id: String; var views: Int }
    private let ranges = ["7 days", "30 days", "90 days"]
    private let scale: [Double] = [1, 4.2, 12]
    private let base: [Double] = [30, 42, 36, 58, 50, 66, 62, 80, 72, 90, 84, 100]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var range = 0
    @State private var stats: [Double] = [12400, 3.8, 42]
    @State private var deltas = [6, -2, 4]
    @State private var line = (0..<12).map { _ in Track(0, preset: .base) }
    @State private var pages = [Page(id: "/pricing", views: 4210), Page(id: "/blog/spring", views: 3180), Page(id: "/", views: 2750), Page(id: "/about", views: 960)]
    @State private var axis = "Mon · Sun"
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Change the range") {
            VStack(alignment: .leading, spacing: 10) {
                Picker("Range", selection: $range) { ForEach(ranges.indices, id: \.self) { Text(ranges[$0]).tag($0) } }.pickerStyle(.segmented).labelsHidden().frame(width: 220)
                    .onChange(of: range) { _, r in update(r) }
                HStack(spacing: 8) {
                    stat("Visitors", Count(value: stats[0], format: 0), deltas[0]); stat("Conversion", Count(value: stats[1], format: 1, suffix: "%"), deltas[1]); stat("Orders", Count(value: stats[2], format: 0), deltas[2])
                }
                VStack(alignment: .leading, spacing: 2) {
                    TimelineView(.animation(paused: false)) { tl in
                        let t = tl.date.timeIntervalSinceReferenceDate
                        Chart(values: line.map { $0.value(at: t) }).stroke(Color.accentColor, style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round)).frame(height: 70)
                    }
                    SwapText(axis).font(.caption2).foregroundStyle(.secondary).frame(height: 14, alignment: .leading)
                }
                ZStack(alignment: .topLeading) {
                    ForEach(pages) { p in
                        let rank = pages.sorted { $0.views > $1.views }.firstIndex { $0.id == p.id } ?? 0
                        HStack { Text(p.id).font(.caption); Spacer(); RollingDigits(p.views).font(.caption) }.frame(height: 26)
                            .offset(y: CGFloat(rank) * 26).animation(reduce ? nil : .motion(.base).delay(0.16 + Double(rank) * 0.02), value: rank)
                    }
                }.frame(height: 104, alignment: .topLeading)
            }.frame(width: 340)
        }
        .onAppear { update(0, first: true) }
    }

    private func stat(_ title: String, _ value: Count, _ delta: Int) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title).font(.caption2).foregroundStyle(.secondary)
            value.font(.callout.weight(.semibold))
            ZStack { Text("\(delta > 0 ? "+" : "")\(delta)%").font(.caption2.weight(.semibold)).foregroundStyle(delta >= 0 ? Color.green : Color.red).id(delta).motionTransition(.swap()) }
                .animation(reduce ? nil : .motion(.base), value: delta)
        }.padding(8).frame(maxWidth: .infinity, alignment: .leading).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 8))
    }

    private func update(_ r: Int, first: Bool = false) {
        let k = scale[r], t0 = now()
        withMotion(.soft, reduceMotion: reduce) { stats = [12400 * k, 3.8 + Double(r) * 0.3, 42 * k]; deltas = [[6, 11, -3][r], [-2, 3, 5][r], [4, -6, 8][r]] }
        for i in line.indices {
            let v = base[i] * (r == 1 ? (i % 2 == 0 ? 0.8 : 1.05) : r == 2 ? (1.1 - Double(i) * 0.03) : 1)
            if reduce || first { line[i].jump(v) } else { line[i].set(v, at: t0 + 0.08 + Double(i) * 0.006) }
        }
        withMotion(.base, reduceMotion: reduce) { axis = ["Mon · Sun", "Week 1 · Week 4", "Jul · Sep"][r] }
        let mix: [[Double]] = [[1, 1, 1, 1], [0.8, 1.2, 0.9, 1.1], [0.7, 1.3, 1.1, 0.8]]
        withMotion(.base, reduceMotion: reduce) { for i in pages.indices { pages[i].views = Int(Double([4210, 3180, 2750, 960][i]) * k * mix[r][i]) } }
    }
}

private struct Chart: Shape {
    let values: [Double]
    func path(in r: CGRect) -> Path {
        var p = Path(); let top = max(values.max() ?? 1, 1)
        for (i, v) in values.enumerated() {
            let pt = CGPoint(x: r.minX + r.width * CGFloat(i) / CGFloat(max(1, values.count - 1)), y: r.maxY - r.height * CGFloat(v / top))
            i == 0 ? p.move(to: pt) : p.addLine(to: pt)
        }
        return p
    }
}

/// A number that springs between values as its animation runs.
private struct Count: View, Animatable {
    var value: Double
    var format: Int
    var suffix = ""
    var animatableData: Double { get { value } set { value = newValue } }
    var body: some View { Text(value.formatted(.number.precision(.fractionLength(format))) + suffix).monospacedDigit() }
}
