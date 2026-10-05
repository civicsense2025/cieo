import SwiftUI
import Cieo

public struct FeaturedCardAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-featured", category: "Mega menus", name: "Featured card with links",
        summary: "Hover waits 120 ms, then the panel grows from the bar. The promo card rises first, the links follow in a 30 ms stagger. Switching top items keeps the panel: its height morphs, the old content leaves in 100 ms, the new promo and links enter in the same order. At phone width the links become accordions and the promo moves to the bottom of the sheet.")
    private let links = [["Overview", "Pricing", "Customers", "Roadmap"], ["Startups", "Enterprise", "Agencies", "Nonprofits"], ["Docs", "Blog", "Events", "Community"]]
    private let promo = ["New: motion presets", "Plan for teams", "Read the field guide"]
    public init() {}
    public var body: some View {
        MegaShell(items: ["Product", "Solutions", "Resources"], hint: "Hover an item, then slide to the next") { i in
            HStack(alignment: .top, spacing: 14) {
                VStack(alignment: .leading, spacing: 6) {
                    AtomPhoto(seed: i + 2, goldenHour: Double(i) * 0.4)
                        .frame(height: 76).clipShape(RoundedRectangle(cornerRadius: 8))
                    Text(promo[i]).font(.callout.weight(.semibold))
                    Text("See what is new").font(.caption).foregroundStyle(.secondary)
                }
                .frame(width: 150)
                .megaRise(0, of: 6)
                VStack(alignment: .leading, spacing: 2) {
                    ForEach(links[i].indices, id: \.self) { r in
                        MegaRow(title: links[i][r], symbol: "arrow.up.right").megaRise(r + 1, of: 6)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}
