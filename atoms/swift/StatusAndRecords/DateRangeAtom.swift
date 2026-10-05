import SwiftUI
import MotionKit

public struct DateRangeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "daterange", category: "Status and records", name: "Date range selector",
        summary: "The range is one tint plate per week row. When the end day moves, each row’s plate retargets with two edges: the leading edge goes first and the trailing edge lags 60ms, and rows farther from the start row begin 30ms later, so the highlight pours along the weeks. Hovering after the first click previews the range. Preset buttons animate the same plates, the endpoint discs scale in, the count rolls, and the label swaps.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var start = 14
    @State private var end = 20
    @State private var picking = false
    @State private var label = "Last 7 days"
    public init() {}

    // October 2026 starts on a Thursday (column 4); today is the 20th.
    private let offset = 4, days = 31, today = 20
    private func row(_ d: Int) -> Int { (offset + d - 1) / 7 }
    private func col(_ d: Int) -> Int { (offset + d - 1) % 7 }
    private var rowCount: Int { row(days) + 1 }

    public var body: some View {
        AtomStage(hint: "Click a start day, then an end day") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Button("Last 7 days") { preset(14, 20, "Last 7 days") }.buttonStyle(AgPress())
                    Button("This month") { preset(1, 20, "This month") }.buttonStyle(AgPress())
                    Text("Custom").font(.caption).foregroundStyle(.secondary)
                }
                HStack(spacing: 4) {
                    SwapText(label).font(.callout.weight(.medium)); Text("·")
                    RollingDigits(end - start + 1); Text("days")
                }
                Text("October 2026").font(.caption.weight(.semibold))
                grid.frame(width: 7 * 40, height: CGFloat(rowCount) * 32)
            }
        }
    }

    private var grid: some View {
        let lo = min(start, end), hi = max(start, end)
        return ZStack(alignment: .topLeading) {
            ForEach(0..<rowCount, id: \.self) { r in
                let first = max(lo, r * 7 - offset + 1), last = min(hi, r * 7 - offset + 7)
                RangePlate(lo: first <= last ? CGFloat(col(first)) : nil, hi: first <= last ? CGFloat(col(last) + 1) : nil,
                           delay: Double(abs(r - row(lo))) * 0.03, rightward: true)
                    .frame(height: 26).offset(y: CGFloat(r) * 32 + 3)
            }
            ForEach(1...days, id: \.self) { d in
                let edge = d == start || d == end
                Button { tap(d) } label: {
                    Text("\(d)").font(.callout.monospacedDigit())
                        .frame(width: 40, height: 32)
                        .background(Circle().fill(Color.accentColor).frame(width: 28, height: 28).scaleEffect(edge ? 1 : 0.01).opacity(edge ? 1 : 0))
                        .foregroundStyle(edge ? Color.white : d > today ? Color.secondary.opacity(0.5) : Color.primary)
                }
                .buttonStyle(.plain).disabled(d > today)
                .offset(x: CGFloat(col(d)) * 40, y: CGFloat(row(d)) * 32)
                .accessibilityLabel("October \(d), 2026")
            }
        }
        .animation(reduce ? nil : .motion(.snap), value: start)
        .animation(reduce ? nil : .motion(.snap), value: end)
    }

    private func tap(_ d: Int) {
        if !picking { start = d; end = d; picking = true; label = "Custom" }
        else { withMotion(.base, reduceMotion: reduce) { end = d; picking = false; label = "Custom" } }
    }
    private func preset(_ s: Int, _ e: Int, _ l: String) { withMotion(.base, reduceMotion: reduce) { start = s; end = e; label = l; picking = false } }
}

/// One highlight plate per week row. The leading edge moves first and the trailing edge follows 60 ms later.
private struct RangePlate: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let lo: CGFloat?, hi: CGFloat?, delay: Double, rightward: Bool
    @State private var shownLo: CGFloat = 0
    @State private var shownHi: CGFloat = 0
    var body: some View {
        RoundedRectangle(cornerRadius: 13).fill(Color.accentColor.opacity(0.18))
            .frame(width: max(0, (shownHi - shownLo) * 40), height: 26)
            .offset(x: shownLo * 40).opacity(lo == nil ? 0 : 1)
            .frame(maxWidth: .infinity, alignment: .leading)
            .onAppear { shownLo = lo ?? 0; shownHi = hi ?? 0 }
            .onChange(of: lo) { _, new in move(low: new) }
            .onChange(of: hi) { _, new in move(high: new) }
            .accessibilityHidden(true)
    }
    private func move(low: CGFloat? = nil, high: CGFloat? = nil) {
        if reduce { if let l = low { shownLo = l }; if let h = high { shownHi = h }; return }
        if let l = low { withAnimation(.motion(.base).delay(delay + (l < shownLo ? 0 : Motion.lag))) { shownLo = l } }
        if let h = high { withAnimation(.motion(.base).delay(delay + (h > shownHi ? 0 : Motion.lag))) { shownHi = h } }
    }
}
