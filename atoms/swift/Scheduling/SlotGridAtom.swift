import SwiftUI
import Cieo

public struct SlotGridAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "slotgrid", category: "Scheduling", name: "Slot picker",
        summary: "The day plate glides across with its trailing edge lagging. Old times blur out while the new day staggers in cell by cell.")

    private let days = ["Tue 6", "Wed 7", "Thu 8"]
    private let slots = [["9:00", "9:30", "10:00"], ["9:00", "10:15", "11:00"], ["9:30", "10:30", "12:00"]]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var day = 0
    @State private var left = Track(0, preset: .base)
    @State private var right = Track(0, preset: .base)
    @State private var pick: Int?
    @State private var ready = false
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Pick a day, then a time") {
            TimelineView(.motion(left, right)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                VStack(spacing: 10) {
                    ZStack(alignment: .leading) {
                        Capsule().fill(.quaternary).frame(height: 34)
                        Capsule().fill(.background).shadow(radius: 1)
                            .frame(width: max(0, right.value(at: t) - left.value(at: t)), height: 28)
                            .offset(x: left.value(at: t))
                    }
                    .overlay { HStack(spacing: 0) { ForEach(days.indices, id: \.self) { i in
                        Button(days[i]) { day = i; pick = nil; slide(i) }
                            .font(.system(size: 13, weight: day == i ? .semibold : .regular))
                            .frame(maxWidth: .infinity, minHeight: 34)
                    } } }
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                        ForEach(slots[day].indices, id: \.self) { i in
                            Text(slots[day][i]).font(.system(size: 13)).monospacedDigit()
                                .frame(maxWidth: .infinity, minHeight: 36)
                                .background(.background, in: RoundedRectangle(cornerRadius: 8))
                                .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(pick == i ? Color.primary : Color.secondary.opacity(0.25)))
                                .transition(.opacity.combined(with: .move(edge: .bottom)))
                                .animation(.spring.delay(Double(i) * 0.04), value: day)
                                .onTapGesture { pick = i }
                                .accessibilityLabel("\(slots[day][i]) on \(days[day])")
                        }
                    }
                }
                .frame(width: 300)
            }
        }
        .onAppear { if !ready { ready = true; slide(0, instant: true) } }
    }

    private func slide(_ i: Int, instant: Bool = false) {
        let w: CGFloat = 100, x = CGFloat(i) * w
        if instant || reduce { left.jump(x + 4); right.jump(x + w - 4) }
        else {
            let t = now()
            if x >= left.target { right.set(x + w - 4, at: t); left.set(x + 4, at: t + 0.06) }
            else { left.set(x + 4, at: t); right.set(x + w - 4, at: t + 0.06) }
        }
    }
}
