import SwiftUI
import Cieo

public struct PositionTrackerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "postracker", category: "SEO", name: "Position tracker",
        summary: "The sparkline draws on the lazy spring while the rank digits roll up or down. The delta chip swaps to success or danger.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var rank = 7
    @State private var delta = 0
    @State private var draw: Double = 0
    @State private var showLine = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Refresh to re-rank") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 4) {
                    Text("“member pricing” · position").font(.headline)
                    RollingDigits(rank).font(.headline)
                }
                VStack(alignment: .leading, spacing: 8) {
                    if showLine {
                        Spark()
                            .trim(from: 0, to: draw)
                            .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                            .frame(height: 64)
                            .motion(.lazy, value: draw)
                            .overlay(alignment: .top) {
                                DashedLine().stroke(.quaternary, lineWidth: 1).frame(height: 1)
                                    .padding(.top, 8)
                            }
                    }
                    HStack {
                        ZStack {
                            if delta == 0 { Text("– no change").foregroundStyle(.secondary) }
                            else {
                                Text("\(delta > 0 ? "▲" : "▼") \(abs(delta))")
                                    .fontWeight(.semibold).foregroundStyle(delta > 0 ? Color.green : Color.red)
                            }
                        }
                        .id(delta).motionTransition(.swap())
                        .animation(reduce ? nil : .motion(.base), value: delta)
                        Text("vs last week · top-3 threshold dotted").font(.caption).foregroundStyle(.secondary)
                    }
                    .font(.footnote)
                }
                .padding(14).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                Toggle("Sparkline", isOn: $showLine).font(.caption).foregroundStyle(.secondary)
                    .nativeToggleStyle()
                Button("Refresh", action: refresh).buttonStyle(.bordered).controlSize(.small)
            }
            .frame(width: 340)
        }
        .onAppear { draw = reduce ? 1 : 0; withMotion(.lazy, reduceMotion: reduce) { draw = 1 } }
    }

    private func refresh() {
        let next = min(20, max(1, rank + Int.random(in: -3...2)))
        withMotion(.base, reduceMotion: reduce) { delta = rank - next; rank = next }
        draw = 0
        withMotion(.lazy, reduceMotion: reduce) { draw = 1 }
    }
}

private struct Spark: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.minX + 4, y: r.maxY - 12))
        p.addCurve(to: CGPoint(x: r.minX + 90, y: r.maxY - 24), control1: CGPoint(x: r.minX + 40, y: r.maxY - 14), control2: CGPoint(x: r.minX + 60, y: r.maxY - 20))
        p.addCurve(to: CGPoint(x: r.minX + 170, y: r.maxY - 34), control1: CGPoint(x: r.minX + 120, y: r.maxY - 28), control2: CGPoint(x: r.minX + 140, y: r.maxY - 22))
        p.addCurve(to: CGPoint(x: r.maxX - 4, y: r.minY + 10), control1: CGPoint(x: r.minX + 200, y: r.maxY - 46), control2: CGPoint(x: r.maxX - 60, y: r.maxY - 42))
        return p
    }
}

private struct DashedLine: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path(); p.move(to: CGPoint(x: r.minX, y: r.midY)); p.addLine(to: CGPoint(x: r.maxX, y: r.midY)); return p
    }
}
