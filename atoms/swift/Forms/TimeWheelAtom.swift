import SwiftUI
import MotionKit

public struct TimeWheelAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "timewheel", category: "Forms", name: "Time wheel",
        summary: "Each column follows a drag exactly, then projects your release velocity forward and settles on the nearest value. Rows fade and shrink with distance from the center band.")
    @State private var hour = 8
    @State private var minute = 6
    @State private var half = 0
    private let hours = (1...12).map(String.init)
    private let minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag each column, or use the arrow keys") {
            VStack(spacing: 10) {
                HStack(spacing: 4) {
                    Column(label: "Hour", values: hours, index: $hour)
                    Column(label: "Minute", values: minutes, index: $minute)
                    Column(label: "AM or PM", values: ["AM", "PM"], index: $half)
                }
                .padding(.horizontal, 12).padding(.vertical, 8).frame(height: 200)
                .background {
                    ZStack {
                        RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06))
                        RoundedRectangle(cornerRadius: 9).fill(Color.primary.opacity(0.08)).frame(height: 36).padding(.horizontal, 8)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 12))
                Text("\(hours[hour]):\(minutes[minute]) \(half == 0 ? "AM" : "PM")").font(.title3.monospacedDigit()).foregroundStyle(.secondary)
            }
        }
    }

    private struct Column: View {
        @Environment(\.accessibilityReduceMotion) private var reduce
        let label: String
        let values: [String]
        @Binding var index: Int
        @State private var y: Track
        @State private var held = false
        @State private var hy = 0.0
        @State private var sy = 0.0
        private let row = 36.0

        init(label: String, values: [String], index: Binding<Int>) {
            self.label = label
            self.values = values
            _index = index
            _y = State(initialValue: Track(Double(index.wrappedValue) * 36))
        }

        private func now() -> Double { Date().timeIntervalSinceReferenceDate }
        private func rubber(_ x: Double) -> Double { (x < 0 ? -1 : 1) * 30 * (1 - exp(-abs(x) / 30)) }

        var body: some View {
            TimelineView(.animation(paused: reduce && !held)) { ctx in
                let yy = held ? hy : y.value(at: ctx.date.timeIntervalSinceReferenceDate)
                ZStack {
                    ForEach(values.indices, id: \.self) { i in
                        let a = min(1, max(0, 1 - abs((Double(i) * row - yy) / row) * 0.32))
                        Text(values[i]).font(.system(size: 18, weight: .semibold)).monospacedDigit()
                            .frame(height: row).scaleEffect(0.82 + 0.18 * a).opacity(a * a)
                            .offset(y: Double(i) * row - yy)
                    }
                }
                .frame(width: 44).frame(maxHeight: .infinity).clipped()
            }
            .contentShape(Rectangle())
            .gesture(DragGesture(minimumDistance: 0)
                .onChanged { g in
                    if !held {
                        held = true
                        sy = y.value(at: now())
                    }
                    let top = Double(values.count - 1) * row
                    var v = sy - g.translation.height
                    if v < 0 { v = rubber(v) } else if v > top { v = top + rubber(v - top) }
                    hy = v
                }
                .onEnded { g in
                    held = false
                    let v = -g.velocity.height
                    let i = min(values.count - 1, max(0, Int(((hy + v * 0.15) / row).rounded())))
                    if reduce { y.jump(Double(i) * row) } else { y.release(from: hy, velocity: v, to: Double(i) * row, at: now()) }
                    index = i
                })
            .focusable()
            .onKeyPress(.downArrow) { move(1); return .handled }
            .onKeyPress(.upArrow) { move(-1); return .handled }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(label).accessibilityValue(values[index])
            .accessibilityAdjustableAction { move($0 == .increment ? 1 : -1) }
        }

        private func move(_ d: Int) {
            let i = min(values.count - 1, max(0, index + d))
            if reduce { y.jump(Double(i) * row) } else { y.set(Double(i) * row, at: now()) }
            index = i
        }
    }
}
