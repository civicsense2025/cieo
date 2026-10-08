import SwiftUI
import Cieo

public struct TimezoneFlipAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tzflip", category: "Scheduling", name: "Timezone flip",
        summary: "Times blur-swap between zones while the time column springs to the longest new label, so nothing jumps.")

    private let zones = ["PT", "ET"]
    private let names = ["Design review", "1:1 with Priya", "Demo call"]
    private let times = [["9:00 AM", "12:30 PM", "4:30 PM"], ["12:00 PM", "3:30 PM", "7:30 PM"]]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var tz = 0
    @State private var left = Track(0, preset: .base)
    @State private var right = Track(0, preset: .base)
    @State private var width = Track(64, preset: .base)
    @State private var late = Track(0)
    @State private var hoursOnly = true
    @State private var ready = false
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Flip zones — widths spring, never jump") {
            TimelineView(.motion(left, right, width, late)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                VStack(spacing: 4) {
                    ZStack(alignment: .leading) {
                        Capsule().fill(.quaternary).frame(height: 34)
                        Capsule().fill(.background).shadow(radius: 1)
                            .frame(width: max(0, right.value(at: t) - left.value(at: t)), height: 28)
                            .offset(x: left.value(at: t))
                    }
                    .overlay { HStack(spacing: 0) { ForEach(zones.indices, id: \.self) { i in
                        Button(zones[i]) { go(i) }
                            .font(.system(size: 13, weight: tz == i ? .semibold : .regular))
                            .frame(maxWidth: .infinity, minHeight: 34)
                    } } }
                    ForEach(names.indices, id: \.self) { i in
                        if i > 0 { Divider() }
                        HStack {
                            Text(names[i]).font(.system(size: 13))
                            Spacer()
                            Text(times[tz][i]).font(.system(size: 13)).monospacedDigit()
                                .foregroundStyle(.secondary)
                                .frame(width: width.value(at: t), alignment: .trailing)
                                .id("\(tz)-\(i)")
                                .transition(.opacity.combined(with: .move(edge: .bottom)))
                        }
                        .frame(minHeight: 32)
                        .opacity(i == 2 ? 1 - late.value(at: t) : 1)
                    }
                    Toggle("Working hours only", isOn: $hoursOnly)
                        .font(.system(size: 12)).foregroundStyle(.secondary).tint(.secondary)
                        .onChange(of: hoursOnly) { _, v in
                            if reduce { late.jump(v ? 1 : 0) } else { late.set(v ? 1 : 0, at: now()) } }
                }
                .frame(maxWidth: 300)
            }
        }
        .onAppear { if !ready { ready = true; slide(0, instant: true); late.jump(1) } }
    }

    private func go(_ i: Int) {
        tz = i; slide(i)
        let longest = CGFloat(times[i].map(\.count).max() ?? 7) * 7.5 + 4
        if reduce { width.jump(longest) } else { width.set(longest, at: now()) }
    }

    private func slide(_ i: Int, instant: Bool = false) {
        let w: CGFloat = 150, x = CGFloat(i) * w
        if instant || reduce { left.jump(x + 4); right.jump(x + w - 4) }
        else {
            let t = now()
            if x >= left.target { right.set(x + w - 4, at: t); left.set(x + 4, at: t + 0.06) }
            else { left.set(x + 4, at: t); right.set(x + w - 4, at: t + 0.06) }
        }
    }
}
