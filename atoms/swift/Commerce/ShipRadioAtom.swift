import SwiftUI
import Cieo

public struct ShipRadioAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "shipradio", category: "Commerce", name: "Shipping method",
        summary: "The dot scales in on the base spring while the card lifts and its border inks. The delta rolls and the ETA swaps. The cheapest carries the threshold pill.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur = 0
    @State private var free75 = true
    @State private var delta = Track(0, preset: .base)
    private let opts = [("Standard", 4.9, "3–5 days"), ("Express", 12.0, "1–2 days"), ("Overnight", 24.0, "Tomorrow")]
    public init() {}

    private func money(_ v: Double) -> String { v.formatted(.currency(code: "USD").locale(Locale(identifier: "en_US"))) }

    public var body: some View {
        AtomStage(hint: "Pick a speed") {
            VStack(spacing: 8) {
                Text("Shipping").font(.system(size: 15, weight: .semibold)).frame(maxWidth: .infinity, alignment: .leading)
                ForEach(opts.indices, id: \.self) { i in
                    Button {
                        cur = i
                        DataMotion.retarget(&delta, to: opts[i].1 - opts[0].1, reduce: reduce)
                    } label: {
                        HStack(spacing: 10) {
                            ZStack {
                                Circle().strokeBorder(i == cur ? .primary : .quaternary, lineWidth: 2).frame(width: 20, height: 20)
                                Circle().fill(.primary).frame(width: 10, height: 10)
                                    .scaleEffect(i == cur ? 1 : 0)
                                    .animation(reduce ? nil : .motion(.base), value: cur)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 6) {
                                    Text(opts[i].0).font(.system(size: 13, weight: .semibold)).lineSpacing(6.5)
                                    if i == 0 { Text("Free $75+").font(.system(size: 12)).bold().padding(.horizontal, 8).background(.quaternary, in: Capsule()) }
                                }
                                Text(opts[i].1 == opts[0].1 && free75 ? "Free*" : money(opts[i].1))
                                    .font(.system(size: 15, weight: .semibold)).monospacedDigit()
                            }
                            Spacer()
                            Text(opts[i].2).font(.system(size: 12.5)).foregroundStyle(.secondary)
                        }
                        .padding(10).frame(minHeight: 52)
                        .background(.background, in: RoundedRectangle(cornerRadius: 9))
                        .overlay(RoundedRectangle(cornerRadius: 9).fill(i == cur ? .primary : .quaternary).opacity(0.10).allowsHitTesting(false))
                        .offset(y: i == cur ? -2 : 0)
                        .animation(reduce ? nil : .motion(.base), value: cur)
                    }
                    .buttonStyle(.plain).accessibilityAddTraits(cur == i ? .isSelected : [])
                }
                TimelineView(.motion([delta])) { ctx in
                    HStack {
                        SwapText("Arrives \(opts[cur].2)").font(.system(size: 12.5)).foregroundStyle(.secondary)
                        Spacer()
                        let d = delta.value(at: ctx.date.timeIntervalSinceReferenceDate)
                        Text(d < 0.005 ? "lowest fare" : "+\(money(d)) over Standard")
                            .font(.system(size: 12.5)).foregroundStyle(.secondary).monospacedDigit()
                    }
                }
                Toggle("Free over $75", isOn: $free75).font(.system(size: 12.5)).foregroundStyle(.secondary).nativeToggleStyle()
            }
            .padding(14).frame(maxWidth: 300)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }
}
