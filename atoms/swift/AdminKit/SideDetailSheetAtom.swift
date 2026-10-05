import SwiftUI
import MotionKit

public struct SideDetailSheetAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sidesheet", category: "Admin kit", name: "Side detail sheet",
        summary: "A row click dims the list and slides the sheet in from the right on the base spring. The rows behind stay live, so picking another row swaps the sheet content (exit, then enter) without sliding again. Drag the sheet right 1:1 with a rubber band on the left; release past 35% or with a fast flick and it leaves from that velocity, otherwise it settles back. Escape, the close button or an outside click close it and focus returns to the row.")

    private let people = [("Maya Okafor", "Editor", "Last active today"), ("Theo Lindqvist", "Admin", "Last active yesterday"), ("Priya Raman", "Viewer", "Last active Monday"), ("Ben Alvarez", "Editor", "Last active Sunday")]
    private let w: CGFloat = 220
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var selected: Int?
    @State private var x = Track(220)
    @State private var held = false
    @State private var dragX: CGFloat = 0
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Open a row, drag the sheet right to dismiss") {
            TimelineView(.animation(paused: !held && !x.isMoving)) { tl in
                let v = held ? dragX : x.value(at: tl.date.timeIntervalSinceReferenceDate), dim = min(1, max(0, 1 - v / w))
                ZStack(alignment: .trailing) {
                    VStack(spacing: 0) { ForEach(people.indices, id: \.self) { i in
                        Button { open(i) } label: { HStack { Text(people[i].0).font(.footnote.weight(.medium)); Spacer(); Text(people[i].1).font(.caption).foregroundStyle(.secondary) }.padding(.horizontal, 14).frame(height: 40).background(selected == i ? Color.accentColor.opacity(0.12) : .clear) }.buttonStyle(.plain)
                            .overlay(alignment: .bottom) { Divider() }
                    } ; Spacer() }
                    Color.black.opacity(0.3 * dim).onTapGesture { close() }.allowsHitTesting(dim > 0.5)
                    sheet.offset(x: v < 0 ? v / 4 : v)
                        .gesture(DragGesture().onChanged { g in held = true; dragX = max(g.translation.width, g.translation.width / 4) }
                            .onEnded { g in
                                held = false
                                let far = dragX > w * 0.35 || g.velocity.width > 500
                                if reduce { x.jump(far ? w : 0) } else { x.release(from: dragX, velocity: g.velocity.width, to: far ? w : 0, at: now()) }
                                if far { selected = nil }
                            })
                }
                .frame(width: 360, height: 200).background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
                .onKeyPress(.escape) { close(); return .handled }
            }
        }
    }

    private var sheet: some View {
        ZStack(alignment: .topLeading) {
            let p = people[selected ?? 0]
            VStack(alignment: .leading, spacing: 6) {
                HStack { Text(p.0).font(.headline); Spacer(); Button { close() } label: { Image(systemName: "xmark") }.buttonStyle(.plain).accessibilityLabel("Close") }
                Text(p.1).font(.footnote); Text(p.2).font(.caption).foregroundStyle(.secondary); Spacer()
            }.padding(14).id(selected).motionTransition(.swap())
        }
        .animation(reduce ? nil : .motion(.base), value: selected)
        .frame(width: w, height: 200, alignment: .topLeading).background(.background).shadow(color: .black.opacity(0.2), radius: 10)
    }

    private func open(_ i: Int) {
        if selected == nil { if reduce { x.jump(0) } else { x.set(0, at: now()) } }
        selected = i
    }

    private func close() { selected = nil; if reduce { x.jump(w) } else { x.set(w, at: now()) } }
}
