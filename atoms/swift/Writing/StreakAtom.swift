import SwiftUI
import Cieo

public struct StreakAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "streak", category: "Writing", name: "Streak ring",
        summary: "The ring fills to its new share. The week dots ink one after another. The day count rolls over. Flipping weeks and months swaps the caption while the ring and dots replay.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var month = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap Week / Month") {
            VStack(spacing: 12) {
                HStack(spacing: 14) {
                    ZStack {
                        Circle().stroke(.quaternary, lineWidth: 9)
                        Circle().trim(from: 0, to: month ? 0.6 : 0.71)
                            .stroke(.primary, style: StrokeStyle(lineWidth: 9, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                            .animation(reduce ? nil : .motion(.soft), value: month)
                    }
                    .frame(width: 84, height: 84)
                    VStack(alignment: .leading, spacing: 4) {
                        Text(month ? "18" : "12").font(.system(size: 30, weight: .bold))
                            .id(month).motionTransition(.swap())
                            .animation(reduce ? nil : .motion(.base), value: month)
                        Text(month ? "18 days this month" : "5 days this week").font(.caption).foregroundStyle(.secondary)
                            .id(month).motionTransition(.swap())
                            .animation(reduce ? nil : .motion(.base), value: month)
                    }
                }
                HStack(spacing: 8) {
                    ForEach(0..<7) { i in
                        Circle().frame(width: 14, height: 14)
                            .foregroundStyle(filled(i) ? Color.primary : Color.clear)
                            .overlay(Circle().stroke(.primary, lineWidth: 2))
                            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.04), value: month)
                    }
                }
                HStack {
                    Button("Week") { withMotion(.base, reduceMotion: reduce) { month = false } }.buttonStyle(.borderedProminent)
                    Button("Month") { withMotion(.base, reduceMotion: reduce) { month = true } }.buttonStyle(.bordered)
                }
            }
        }
    }

    private func filled(_ i: Int) -> Bool {
        let days = month ? [1,1,1,1,1,1,0] : [1,1,1,1,1,0,0]
        return days[i] == 1
    }
}
