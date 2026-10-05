import SwiftUI
import MotionKit

public struct FunnelReportAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "funnel", category: "Workspace", name: "Funnel report",
        summary: "Four bars grow from the baseline left to right, 120ms apart, and each stage count rolls up as its bar rises. The drop-off chip between two stages counts up just after the bar it follows. Changing the date range morphs every bar to its new height in the same stage order while the numbers roll, and the period text swaps. Hovering a stage dims the others and raises a tooltip that glides between bar tops and swaps its text.")

    private let stages = ["Visited", "Signed up", "Activated", "Paid"]
    private let ranges: [(String, [Double])] = [("Last 7 days", [8400, 3100, 1500, 620]), ("Last 30 days", [31200, 12800, 6100, 2300])]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var range = 0
    @State private var values = [0.0, 0, 0, 0]
    @State private var hot: Int?
    public init() {}

    private var top: Double { max(values[0], 1) }

    public var body: some View {
        AtomStage(hint: "Change the range, hover a stage") {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Picker("Range", selection: $range) { ForEach(ranges.indices, id: \.self) { Text(ranges[$0].0).tag($0) } }.pickerStyle(.segmented).labelsHidden().frame(width: 200)
                        .onChange(of: range) { _, r in play(r) }
                    SwapText(ranges[range].0).font(.caption).foregroundStyle(.secondary)
                }
                ZStack(alignment: .topLeading) {
                    HStack(alignment: .bottom, spacing: 18) {
                        ForEach(stages.indices, id: \.self) { i in
                            VStack(spacing: 4) {
                                if i > 0 { Count(value: dropOff(i), suffix: "%").font(.caption2.weight(.semibold)).foregroundStyle(.red).padding(.horizontal, 6).background(Capsule().fill(Color.red.opacity(0.12))) } else { Color.clear.frame(height: 17) }
                                Count(value: values[i], suffix: "").font(.footnote.weight(.semibold))
                                RoundedRectangle(cornerRadius: 6).fill(Color.accentColor).frame(width: 52, height: max(2, 130 * values[i] / top))
                                Text(stages[i]).font(.caption2).foregroundStyle(.secondary)
                            }
                            .opacity(hot == nil || hot == i ? 1 : 0.4).onHover { h in withMotion(.snap, reduceMotion: reduce) { hot = h ? i : (hot == i ? nil : hot) } }
                            .accessibilityElement(children: .combine)
                        }
                    }
                    if let h = hot {
                        Text("\(stages[h]): \(Int(values[h]).formatted())").font(.caption2).padding(6).background(.background, in: RoundedRectangle(cornerRadius: 6)).shadow(radius: 4)
                            .id(h).transition(reduce ? .identity : .motionSwap(drift: 2)).offset(x: CGFloat(h) * 70 - 4, y: 17 + 130 - 130 * values[h] / top - 10)
                    }
                }.animation(reduce ? nil : .motion(.snap), value: hot)
            }.frame(width: 340)
        }
        .onAppear { play(0) }
    }

    private func dropOff(_ i: Int) -> Double { values[i - 1] > 0 ? (1 - values[i] / values[i - 1]) * 100 : 0 }

    private func play(_ r: Int) {
        for i in values.indices {
            withAnimation(reduce ? nil : .motion(.soft).delay(Double(i) * 0.12)) { values[i] = ranges[r].1[i] }
        }
    }
}

/// A number that springs between values as its animation runs.
private struct Count: View, Animatable {
    var value: Double
    var suffix: String
    var animatableData: Double { get { value } set { value = newValue } }
    var body: some View { Text(Int(value.rounded()).formatted() + suffix).monospacedDigit() }
}
