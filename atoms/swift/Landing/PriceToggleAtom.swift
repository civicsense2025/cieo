import SwiftUI
import Cieo

public struct PriceToggleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pricetoggle", category: "Landing", name: "Pricing toggle morph",
        summary: "The thumb glides with a trailing edge, the changed price rolls on its own digits, and the tier card lifts and tints on yearly while the savings pill pops in.")

    private struct Tier { let name: String; let monthly: Int; let yearly: Int }
    private let tiers = [Tier(name: "Starter", monthly: 12, yearly: 10), Tier(name: "Studio", monthly: 24, yearly: 19), Tier(name: "Scale", monthly: 48, yearly: 38)]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var yearly = false
    @State private var tier = 1
    public init() {}

    private var price: Int { yearly ? tiers[tier].yearly : tiers[tier].monthly }

    public var body: some View {
        AtomStage(hint: "Yearly lifts the tier and pops savings") {
            VStack(spacing: 10) {
                Text("Simple pricing").font(.headline)
                Picker("Billing period", selection: $yearly) { Text("Monthly").tag(false); Text("Yearly").tag(true) }
                    .pickerStyle(.segmented).labelsHidden().frame(width: 220)
                VStack(spacing: 6) {
                    Text(tiers[tier].name).font(.caption.weight(.semibold))
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("\(price)").font(.title.weight(.semibold)).monospacedDigit().id(price).motionTransition(.swap())
                        Text(yearly ? "/mo, billed yearly" : "/mo, billed monthly").font(.caption).foregroundStyle(.secondary)
                    }
                    if yearly {
                        Text("Save 20%").font(.caption.weight(.semibold)).foregroundStyle(.green)
                            .padding(.horizontal, 10).padding(.vertical, 3)
                            .background(.green.opacity(0.14), in: Capsule())
                            .id(1).motionTransition(.swap())
                    }
                    PreviewAction("Choose \(tiers[tier].name)").buttonStyle(.borderedProminent).controlSize(.small)
                }.padding(20).frame(maxWidth: 300)
                .background(yearly ? Color.accentColor.opacity(0.08) : Color.clear, in: RoundedRectangle(cornerRadius: 10))
                .offset(y: yearly ? -4 : 0)
                .animation(reduce ? nil : .motion(.soft), value: yearly)
                Picker("Plan tier", selection: $tier) { ForEach(tiers.indices, id: \.self) { Text(tiers[$0].name).tag($0) } }
                    .pickerStyle(.segmented).labelsHidden().frame(width: 240)
                    .font(.caption).opacity(0.8)
            }.frame(maxWidth: 340)
            .animation(reduce ? nil : .motion(.base), value: yearly)
            .animation(reduce ? nil : .motion(.base), value: tier)
        }
    }
}
