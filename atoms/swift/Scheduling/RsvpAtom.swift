import SwiftUI
import Cieo

public struct RsvpAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "rsvp3", category: "Scheduling", name: "RSVP",
        summary: "One plate slides between yes, no and maybe. Counts roll with every vote; maybe holds an amber tint instead of resolving green.")

    private let opts = ["Yes", "No", "Maybe"]
    private let base = [12, 3, 5]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pick = -1
    @State private var plus = 0
    @State private var left = Track(0, preset: .base)
    @State private var right = Track(0, preset: .base)
    @State private var ready = false
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }
    private func count(_ i: Int) -> Int { base[i] + (pick == i ? 1 : 0) + (i == 0 ? plus : 0) }

    public var body: some View {
        AtomStage(hint: "Maybe holds amber — the honest answer") {
            TimelineView(.motion(left, right)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                VStack(spacing: 10) {
                    Text("Summer picnic · Sat 12:00 PM · 20 invited").font(.system(size: 13))
                        .frame(maxWidth: .infinity, alignment: .leading)
                    ZStack(alignment: .leading) {
                        Capsule().fill(.quaternary).frame(height: 52)
                        if pick >= 0 {
                            Capsule().fill(pick == 2 ? Color.yellow.opacity(0.35) : Color.primary.opacity(0.12))
                                .shadow(radius: 1)
                                .frame(width: max(0, right.value(at: t) - left.value(at: t)), height: 46)
                                .offset(x: left.value(at: t))
                        }
                        HStack(spacing: 0) { ForEach(opts.indices, id: \.self) { i in
                            Button { vote(i) } label: {
                                VStack(spacing: 0) {
                                    Text(opts[i]).font(.system(size: 13, weight: pick == i ? .semibold : .regular))
                                    Text("\(count(i))").font(.system(size: 12)).monospacedDigit()
                                        .foregroundStyle(.secondary)
                                }
                                .frame(maxWidth: .infinity, minHeight: 52)
                                .contentTransition(.numericText())
                                .animation(.spring, value: count(i))
                            }
                            .buttonStyle(.plain)
                            .foregroundStyle(i == 2 && pick == 2 ? Color(red: 0.58, green: 0.25, blue: 0.02) : .primary)
                            .accessibilityLabel("\(opts[i]), \(count(i))")
                        } }
                    }
                    HStack(spacing: 6) {
                        Text("Plus-one").font(.system(size: 12)).foregroundStyle(.secondary)
                        Button("-") { plus = max(0, plus - 1) }.font(.system(size: 13))
                            .frame(width: 32, height: 32).background(.background, in: RoundedRectangle(cornerRadius: 8))
                            .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.05)))
                        Text("\(plus)").font(.system(size: 13)).monospacedDigit().frame(minWidth: 12)
                        Button("+") { plus = min(4, plus + 1) }.font(.system(size: 13))
                            .frame(width: 32, height: 32).background(.background, in: RoundedRectangle(cornerRadius: 8))
                            .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.05)))
                        Spacer()
                        Text(pick == 2 ? "We saved you a maybe seat" : pick == 0 ? "See you there" : pick == 1 ? "You will be missed" : "")
                            .font(.system(size: 12)).foregroundStyle(.secondary)
                    }
                }
                .frame(width: 300)
            }
        }
        .onAppear { if !ready { ready = true; left.jump(0); right.jump(0) } }
    }

    private func vote(_ i: Int) {
        pick = i
        let w: CGFloat = 100, x = CGFloat(i) * w, t = now()
        if reduce { left.jump(x + 4); right.jump(x + w - 4) }
        else if x >= left.target { right.set(x + w - 4, at: t); left.set(x + 4, at: t + 0.06) }
        else { left.set(x + 4, at: t); right.set(x + w - 4, at: t + 0.06) }
    }
}
