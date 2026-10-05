import SwiftUI
import MotionKit

public struct CheckoutTotalsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "checkout", category: "Commerce", name: "Checkout totals",
        summary: "Quantity digits roll, and every money value springs toward its new total, so subtotal, tax and total move together.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let items: [(name: String, price: Double)] = [("Canvas tote", 32), ("Enamel mug", 18)]
    private let taxRate = 0.08
    @State private var qty = [1, 2]
    @State private var lines = [Track(32, preset: .base), Track(36, preset: .base)]
    @State private var sub = Track(68, preset: .base)
    @State private var tax = Track(68 * 0.08, preset: .base)
    @State private var total = Track(68 * 1.08, preset: .base)
    public init() {}

    private func money(_ v: Double) -> String { v.formatted(.currency(code: "USD").locale(Locale(identifier: "en_US"))) }

    public var body: some View {
        AtomStage(hint: "Change a quantity") {
            VStack(spacing: 12) {
                TimelineView(.motion(lines + [sub, tax, total])) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    VStack(spacing: 12) {
                        ForEach(items.indices, id: \.self) { i in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(items[i].name).font(.caption.weight(.medium))
                                    Text("$\(Int(items[i].price)) each").font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                                Button { change(i, -1) } label: { Text("−").padding(.horizontal, 4) }.buttonStyle(.bordered).accessibilityLabel("Decrease \(items[i].name)")
                                RollingDigits(qty[i]).font(.caption).frame(minWidth: 18)
                                Button { change(i, 1) } label: { Text("+").padding(.horizontal, 4) }.buttonStyle(.bordered).accessibilityLabel("Increase \(items[i].name)")
                                Text(money(lines[i].value(at: t))).font(.caption).monospacedDigit().frame(minWidth: 64, alignment: .trailing)
                            }
                        }
                        Divider()
                        totalRow("Subtotal", sub.value(at: t), strong: false)
                        totalRow("Tax (8%)", tax.value(at: t), strong: false)
                        totalRow("Total", total.value(at: t), strong: true)
                    }
                }
            }
            .padding(16).frame(maxWidth: 320)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func totalRow(_ label: String, _ v: Double, strong: Bool) -> some View {
        HStack {
            Text(label).foregroundStyle(strong ? .primary : .secondary)
            Spacer()
            Text(money(v)).monospacedDigit()
        }
        .font(strong ? .callout.weight(.semibold) : .caption)
    }

    private func change(_ i: Int, _ d: Int) {
        let q = max(0, min(99, qty[i] + d))
        guard q != qty[i] else { return }
        qty[i] = q
        DataMotion.retarget(&lines[i], to: items[i].price * Double(q), reduce: reduce)
        let s = zip(items, qty).reduce(0) { $0 + $1.0.price * Double($1.1) }
        DataMotion.retarget(&sub, to: s, reduce: reduce)
        DataMotion.retarget(&tax, to: s * taxRate, reduce: reduce)
        DataMotion.retarget(&total, to: s * (1 + taxRate), reduce: reduce)
    }
}
