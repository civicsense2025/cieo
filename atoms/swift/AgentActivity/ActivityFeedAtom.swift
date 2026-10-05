import SwiftUI
import MotionKit

public struct ActivityFeedAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "activityfeed", category: "Agent activity", name: "Agent activity feed",
        summary: "Each action lands at the top: its row grows from zero height, then the content fades up, while the agent cursor glides to the matching spot on the page. Consecutive actions of one kind fold into a single group whose title swaps and whose count rolls. Filter chips close non-matching groups instead of removing them. Click any row and the ring moves to that spot, leading edge first, and the page shows that moment; Back to live returns to following the newest action.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Group_: Identifiable { let id: Int; let kind: String; var count: Int }
    @State private var groups: [Group_] = []
    @State private var filter: String?
    @State private var viewing: Int?
    @State private var cursorX: CGFloat = 30
    @State private var cursorY: CGFloat = 30
    @State private var run = 0
    @State private var nextId = 1
    public init() {}

    private let script = ["Click", "Click", "Type", "Scroll", "Scroll", "Scroll", "Click"]
    private let icons = ["Click": "cursorarrow.click", "Type": "keyboard", "Scroll": "arrow.up.and.down"]

    public var body: some View {
        AtomStage(hint: "Tap a row to see that moment; Back to live follows the newest") {
            HStack(alignment: .top, spacing: 10) {
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04))
                    VStack(alignment: .leading, spacing: 6) { ForEach(0..<4, id: \.self) { _ in RoundedRectangle(cornerRadius: 3).fill(.quaternary).frame(height: 10) } }.padding(12)
                    if let v = viewing { Circle().strokeBorder(Color.accentColor, lineWidth: 2).frame(width: 26, height: 26).position(x: 30 + CGFloat(v % 4) * 20, y: 30 + CGFloat(v % 3) * 25) }
                    AgCursor().position(x: cursorX, y: cursorY)
                }.frame(width: 150, height: 170)
                AgCard {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack { Text("Actions").font(.caption.weight(.semibold)); Spacer(); if viewing != nil { Button("Back to live") { withMotion(.base, reduceMotion: reduce) { viewing = nil } }.buttonStyle(AgPress()).font(.caption) } }
                        HStack(spacing: 4) {
                            ForEach(["All", "Click", "Type", "Scroll"], id: \.self) { k in
                                Button(k) { withMotion(.base, reduceMotion: reduce) { filter = k == "All" ? nil : k } }.buttonStyle(AgPress(tone: (filter ?? "All") == k ? .info : nil)).font(.caption2)
                            }
                        }
                        ForEach(groups) { g in
                            AgReveal(open: filter == nil || filter == g.kind) {
                                Button { withMotion(.base, reduceMotion: reduce) { viewing = g.id } } label: {
                                    HStack { Image(systemName: icons[g.kind] ?? "circle"); Text(g.count > 1 ? "\(g.kind) ×" : g.kind); if g.count > 1 { RollingDigits(g.count) }; Spacer() }.font(.caption)
                                        .padding(4).background(viewing == g.id ? Color.accentColor.opacity(0.15) : .clear, in: RoundedRectangle(cornerRadius: 5))
                                }.buttonStyle(.plain)
                            }
                            .transition(reduce ? .identity : .opacity.combined(with: .move(edge: .top)))
                        }
                        Button("Replay") { run += 1 }.buttonStyle(AgPress()).font(.caption)
                    }.frame(width: 180, alignment: .leading)
                }
            }
            .animation(reduce ? nil : .motion(.base), value: groups.count)
        }
        .task(id: run) {
            groups = []; nextId = 1
            for (i, kind) in script.enumerated() {
                try? await Task.sleep(nanoseconds: 800_000_000)
                if Task.isCancelled { return }
                withMotion(.base, reduceMotion: reduce) {
                    if let f = groups.first, f.kind == kind { groups[0].count += 1 } else { groups.insert(Group_(id: nextId, kind: kind, count: 1), at: 0); nextId += 1 }
                    if viewing == nil { cursorX = 30 + CGFloat(i % 4) * 20; cursorY = 30 + CGFloat(i % 3) * 25 }
                }
            }
        }
    }
}
