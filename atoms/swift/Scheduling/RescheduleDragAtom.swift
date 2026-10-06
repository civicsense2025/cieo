import SwiftUI
import Cieo

public struct RescheduleDragAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "reschedrag", category: "Scheduling", name: "Reschedule drag",
        summary: "The chip follows the pointer exactly. A gap opens softly at the landing slot while rows spring aside, and the label shows the snapped time.")

    private let times = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"]
    private let names = ["Standup", "Design review", "Lunch", "1:1"]
    private let rh: CGFloat = 48, gap: CGFloat = 6
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var home = 1
    @State private var held = false
    @State private var pos = CGPoint.zero
    @State private var grab = CGSize.zero
    @State private var gapIdx = 1
    @State private var chip = Track(54)
    @State private var rows: [Track] = [Track(0), Track(54), Track(108), Track(162)]
    @State private var ready = false
    public init() {}

    private func row(_ i: Int, _ t: Double) -> some View {
        let heldHere = held && i == home
        return HStack(spacing: 10) {
            Text(times[i]).font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit().frame(width: 64, alignment: .leading)
            Text(names[i]).font(.system(size: 13))
        }
        .padding(.horizontal, 12).frame(height: rh)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.background, in: RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10)
            .strokeBorder(heldHere ? Color.secondary : Color.secondary.opacity(0.25), style: StrokeStyle(lineWidth: 1, dash: heldHere ? [5] : [])))
        .opacity(!held && i == home ? 0 : 1)
        .offset(y: rows[i].value(at: t))
    }

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }
    private func slot(_ i: Int) -> Double { Double(i) * Double(rh + gap) + (i > gapIdx ? 14 : 0) }
    private func lay() {
        let t = now()
        for i in rows.indices {
            if reduce { rows[i].jump(slot(i)) }
            else { rows[i].set(slot(i), at: t) }
        }
    }

    public var body: some View {
        AtomStage(hint: "Drag the event · it snaps to the grid") {
            TimelineView(.motion(chip, rows)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                ZStack(alignment: .topLeading) {
                    ForEach(times.indices, id: \.self) { i in
                        row(i, t)
                    }
                    RoundedRectangle(cornerRadius: 10).fill(Color.accentColor)
                        .overlay(alignment: .leading) {
                            Text("Design review · \(times[gapIdx])").font(.system(size: 13)).foregroundStyle(.white)
                                .monospacedDigit().padding(.horizontal, 12) }
                        .frame(height: rh)
                        .offset(y: held ? pos.y : chip.value(at: t))
                        .gesture(DragGesture(minimumDistance: 0)
                            .onChanged { g in
                                if !held { held = true; grab = CGSize(width: 0, height: chip.value(at: now()) - g.location.y) }
                                pos = CGPoint(x: 0, y: grab.height + g.location.y)
                                let idx = min(3, max(0, Int(((pos.y) / Double(rh + gap)).rounded())))
                                if idx != gapIdx { gapIdx = idx; lay() }
                            }
                            .onEnded { g in
                                held = false; home = gapIdx
                                let to = Double(home) * Double(rh + gap)
                                if reduce { chip.jump(to) }
                                else { chip.release(from: pos.y, velocity: Double(g.velocity.height), to: to, at: now()) }
                                gapIdx = home; lay()
                            })
                        .accessibilityLabel("Design review, \(times[home])")
                }
                .frame(width: 300, height: 230, alignment: .topLeading)
            }
        }
        .onAppear { if !ready { ready = true; lay() } }
    }
}
