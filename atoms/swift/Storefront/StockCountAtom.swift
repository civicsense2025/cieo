import SwiftUI
import Cieo

public struct StockCountAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stockcount", category: "Storefront", name: "Stock countdown",
        summary: "The bar drains lazily and only changed digits roll. At 5 left the low pill pops in and the message swaps to order soon. Zero holds as sold out.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var stock = 9
    private let total = 12
    public init() {}
    public var body: some View {
        AtomStage(hint: "Buy until low, then sold out") {
            VStack(alignment: .leading, spacing: 8) {
                HStack { Text("Trail cap").font(.callout.weight(.semibold)); Text("$36").font(.footnote.weight(.semibold)).monospacedDigit() }
                GeometryReader { g in
                    Capsule().fill(.quaternary).overlay(alignment: .leading) {
                        Capsule().fill(stock <= 5 ? Color.orange : Color.primary).frame(width: g.size.width * CGFloat(stock) / CGFloat(total))
                            .motion(.lazy, value: stock)
                    }
                }.frame(height: 6).accessibilityLabel("Stock remaining \(stock) of \(total)")
                HStack(spacing: 8) {
                    RollingDigits(stock).font(.footnote).monospacedDigit()
                    if stock <= 5 && stock > 0 { Text("Low stock").font(.caption2.weight(.semibold)).padding(.horizontal, 10).padding(.vertical, 3).background(.orange.opacity(0.15), in: Capsule()).foregroundStyle(.orange).motionTransition(.swap()) }
                    SwapText(stock <= 0 ? "Sold out" : stock <= 5 ? "Order soon" : "In stock").font(.caption).foregroundStyle(.secondary)
                }
                HStack {
                    Button(stock <= 0 ? "Sold out" : "Buy one") { withMotion(.lazy, reduceMotion: reduce) { stock = max(0, stock - 1) } }.buttonStyle(.borderedProminent).controlSize(.small)
                    Toggle("Auto-restock", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
                }
            }.frame(width: 300)
        }
    }
}
