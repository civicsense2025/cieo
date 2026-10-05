import SwiftUI
import Cieo

public struct DatePickerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "booking", category: "Interactive", name: "Date and time picker",
        summary: "The selection disc glides between days on two axes. Time slots for the new day blur in 40ms apart after the old ones leave.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let cellW = 38.0, cellH = 30.0
    private let times = [["9:00", "11:30", "14:00"], ["10:00", "13:00", "16:30"], ["9:30", "12:00", "15:00"]]
    @State private var day = 7
    @State private var slot: Int?
    public init() {}

    private func enabled(_ d: Int) -> Bool { d >= 3 && ![0, 6].contains((d + 3) % 7) }
    private func cell(_ d: Int) -> (x: Double, y: Double) {
        let idx = 4 + d - 1
        return (Double(idx % 7) * cellW, Double(idx / 7 + 1) * (cellH + 2))
    }

    /// Old slot label leaves, then the new one rises in, each slot 40 ms after the one before.
    private func slotSwap(_ i: Int) -> AnyTransition {
        .asymmetric(
            insertion: .opacity.combined(with: .offset(y: 4)).animation(.motion(.base).delay(Motion.exit + Double(i) * 0.04)),
            removal: .opacity.combined(with: .offset(y: -4)).animation(.motionExit.delay(Double(i) * 0.04)))
    }

    public var body: some View {
        AtomStage(hint: "Pick a day, then a time") {
            VStack(alignment: .leading, spacing: 10) {
                HStack { Text("October 2026").font(.caption.weight(.semibold)); Spacer(); Text("Pick a day").font(.caption).foregroundStyle(.secondary) }
                ZStack(alignment: .topLeading) {
                    Circle().fill(.primary).frame(width: cellH, height: cellH)
                        .offset(x: cell(day).x + (cellW - cellH) / 2, y: cell(day).y)
                        .animation(reduce ? nil : .motion(.base), value: day)
                    ForEach(0..<7, id: \.self) { c in
                        Text(String("SMTWTFS".map { $0 }[c])).font(.caption).foregroundStyle(.tertiary).frame(width: cellW, height: cellH).offset(x: Double(c) * cellW)
                    }
                    ForEach(1...31, id: \.self) { d in
                        Button { day = d; slot = nil } label: {
                            Text("\(d)").font(.caption).frame(width: cellW, height: cellH)
                                .foregroundStyle(!enabled(d) ? AnyShapeStyle(.tertiary) : d == day ? AnyShapeStyle(.background) : AnyShapeStyle(.primary))
                                .animation(reduce ? nil : .motion(.base), value: day)
                        }
                        .buttonStyle(.plain).disabled(!enabled(d)).offset(x: cell(d).x, y: cell(d).y)
                    }
                }
                .frame(width: cellW * 7, height: (cellH + 2) * 6, alignment: .topLeading)
                HStack(spacing: 6) {
                    ForEach(0..<3, id: \.self) { i in
                        let label = times[day % 3][i]
                        Button { withMotion(.base, reduceMotion: reduce) { slot = i } } label: {
                            ZStack { Text(label).font(.caption).id("\(day)-\(i)").transition(reduce ? .identity : slotSwap(i)) }
                                .frame(maxWidth: .infinity).frame(height: 32)
                                .foregroundStyle(slot == i ? AnyShapeStyle(.background) : AnyShapeStyle(.primary))
                                .background(slot == i ? AnyShapeStyle(.primary) : AnyShapeStyle(.quaternary), in: RoundedRectangle(cornerRadius: 8))
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("October \(day), \(label)")
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: day)
            }
            .padding(14).frame(width: cellW * 7 + 28)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }
}
