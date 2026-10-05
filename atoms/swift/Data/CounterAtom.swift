import SwiftUI
import Cieo

public struct CounterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "counter", category: "Data", name: "Counter",
        summary: "The number itself rides the lazy spring, so it decelerates into the final value instead of ticking linearly.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var value = Track(0, preset: .lazy)
    @State private var delta = Track(0, preset: .lazy)
    public init() {}

    public var body: some View {
        AtomStage(hint: "Replay to watch it settle") {
            VStack(spacing: 14) {
                TimelineView(.motion(value, delta)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    let n = Int(value.value(at: t).rounded())
                    VStack(spacing: 4) {
                        Text(n.formatted(.number.locale(Locale(identifier: "en_US"))))
                            .font(.system(size: 52, weight: .semibold)).monospacedDigit()
                        Text("Members this year").font(.caption).foregroundStyle(.secondary)
                        Text("+\(Int(delta.value(at: t).rounded()))% vs last year")
                            .font(.caption.weight(.medium)).monospacedDigit().foregroundStyle(Color.accentColor)
                    }
                    .accessibilityElement(children: .combine)
                    .accessibilityValue("\(n) members")
                }
                Button("Replay", action: replay).buttonStyle(.bordered)
            }
        }
        .onAppear(perform: replay)
    }

    private func replay() {
        value.jump(0); delta.jump(0)
        DataMotion.retarget(&value, to: 12480, reduce: reduce)
        DataMotion.retarget(&delta, to: 34, delay: 0.15, reduce: reduce)
    }
}
