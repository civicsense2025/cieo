import SwiftUI
import MotionKit

public struct LinkGroupsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-columns", category: "Mega menus", name: "Link groups with descriptions",
        summary: "Hovering a top item waits 120 ms before the panel opens, with a hairline filling the wait. The panel grows from the bar, then its links rise one after another. Moving to another item keeps the panel open: its height morphs at once, the old links leave in 100 ms, then the new ones enter. At phone width the same groups become accordions in one sheet.")
    private let groups: [[(String, [(String, String)])]] = [
        [("Build", [("Components", "Ready-made parts"), ("Templates", "Start from a page"), ("Motion", "Springs and presets")]),
         ("Ship", [("Hosting", "Deploy in a push"), ("Previews", "One URL per change")])],
        [("Teams", [("Design", "Review in context"), ("Engineering", "Fewer handoffs")]),
         ("Industries", [("Education", "Classrooms and campuses"), ("Civic", "Open by default"), ("Retail", "Fast storefronts")])],
        [("Learn", [("Guides", "Step by step"), ("Changelog", "What shipped")]),
         ("Help", [("Support", "Talk to a person"), ("Status", "Live uptime")])]
    ]
    public init() {}
    public var body: some View {
        MegaShell(items: ["Product", "Solutions", "Resources"], hint: "Hover an item, then slide to the next") { i in
            HStack(alignment: .top, spacing: 20) {
                ForEach(groups[i].indices, id: \.self) { g in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(groups[i][g].0.uppercased()).font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
                        ForEach(groups[i][g].1.indices, id: \.self) { r in
                            MegaRow(title: groups[i][g].1[r].0, detail: groups[i][g].1[r].1)
                                .megaRise(g * 3 + r, of: 6)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
    }
}
