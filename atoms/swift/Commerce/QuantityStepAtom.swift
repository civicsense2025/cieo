import SwiftUI
import Cieo

public struct QuantityStepAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "qtystep", category: "Commerce", name: "Quantity stepper",
        summary: "Digits roll on the base spring in the step direction. At zero the row collapses, then leaves an undo terminal. Money springs together.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var qty = [1, 1]
    @State private var removed = [false, false]
    @State private var sub = Track(136, preset: .base)
    private let items = [("Scout backpack", 68.0), ("Trail socks", 14.0)]
    @State private var compact = true
    public init() {}

    private func money(_ v: Double) -> String { v.formatted(.currency(code: "USD").locale(Locale(identifier: "en_US"))) }

    public var body: some View {
        AtomStage(hint: "Step a quantity to zero") {
            VStack(spacing: 8) {
                Text("Your cart").font(.system(size: 15, weight: .semibold)).frame(maxWidth: .infinity, alignment: .leading)
                TimelineView(.motion([sub])) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    VStack(spacing: compact ? 8 : 16) {
                        ForEach(items.indices, id: \.self) { i in
                            if removed[i] {
                                Button("Removed · Undo") {
                                    removed[i] = false; qty[i] = 1; retotal()
                                }.font(.system(size: 13)).frame(maxWidth: .infinity, alignment: .leading)
                                .transition(.opacity)
                            } else {
                                HStack(spacing: 8) {
                                    RoundedRectangle(cornerRadius: 12).fill(.quaternary).frame(width: 56, height: 42)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(items[i].0).font(.system(size: 13, weight: .semibold)).lineSpacing(6.5)
                                        Text("$\(Int(items[i].1)) each").font(.system(size: 12.5)).foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Button { step(i, -1) } label: { Text("−").frame(minWidth: 36, minHeight: 36) }
                                        .buttonStyle(.bordered).accessibilityLabel("Decrease \(items[i].0)")
                                    RollingDigits(qty[i]).font(.system(size: 14)).monospacedDigit().frame(minWidth: 20)
                                    Button { step(i, 1) } label: { Text("+").frame(minWidth: 36, minHeight: 36) }
                                        .buttonStyle(.bordered).accessibilityLabel("Increase \(items[i].0)")
                                }
                                .transition(.move(edge: .leading).combined(with: .opacity))
                            }
                        }
                        Divider()
                        HStack { Text("Total").font(.system(size: 15, weight: .semibold)); Spacer()
                            Text(money(sub.value(at: t))).font(.system(size: 15, weight: .semibold)).monospacedDigit() }
                    }
                }
                Toggle("Compact rows", isOn: $compact).font(.system(size: 12.5)).foregroundStyle(.secondary).toggleStyle(.checkbox)
            }
            .padding(14).frame(width: 280)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func step(_ i: Int, _ d: Int) {
        let q = max(0, min(99, qty[i] + d))
        guard q != qty[i] else { return }
        qty[i] = q
        if q == 0 {
            withMotion(.base, reduceMotion: reduce) { removed[i] = true }
        }
        retotal()
    }

    private func retotal() {
        var s = 0.0
        for i in qty.indices where !removed[i] { s += items[i].1 * Double(qty[i]) }
        DataMotion.retarget(&sub, to: s, reduce: reduce)
    }
}
