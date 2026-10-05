import SwiftUI
import Cieo

public struct TaskBoardAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "kanban", category: "Scheduling", name: "Task board",
        summary: "The card lifts and follows the pointer exactly. Hovering over a column opens a gap at the matching position while other cards spring aside. Dropping settles the card into the gap from its release velocity.")

    private let titles = ["Write launch post", "Pricing page QA", "Yearly toggle copy", "Member emails", "Fix font flash"]
    private let heads = ["To do", "Doing", "Done"]
    private let cw: CGFloat = 112, ch: CGFloat = 54, gutter: CGFloat = 8, top: CGFloat = 34
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cols: [[Int]] = [[0, 1], [2, 3], [4]]
    @State private var xs: [Track] = (0..<5).map { _ in Track(0) }
    @State private var ys: [Track] = (0..<5).map { _ in Track(0) }
    @State private var lift: [Track] = (0..<5).map { _ in Track(0, preset: .snap) }
    @State private var held: Int?
    @State private var pos = CGPoint.zero
    @State private var grab = CGSize.zero
    @State private var gap: (col: Int, idx: Int)?
    @State private var ready = false
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }
    private func colX(_ i: Int) -> CGFloat { CGFloat(i) * (cw + 12) }
    private func slot(_ col: Int, _ k: Int) -> CGPoint { CGPoint(x: colX(col) + 8, y: top + CGFloat(k) * (ch + gutter)) }

    private func lay(instant: Bool = false) {
        for (ci, list) in cols.enumerated() {
            var k = 0
            for c in list where c != held {
                if let g = gap, g.col == ci, g.idx == k { k += 1 }
                let p = slot(ci, k)
                if instant || reduce { xs[c].jump(p.x); ys[c].jump(p.y) } else { xs[c].set(p.x, at: now()); ys[c].set(p.y, at: now()) }
                k += 1
            }
        }
    }

    public var body: some View {
        AtomStage(hint: "Drag a card to another column") {
            TimelineView(.motion(xs, ys, lift)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                ZStack(alignment: .topLeading) {
                    ForEach(heads.indices, id: \.self) { i in
                        RoundedRectangle(cornerRadius: 12).fill(.quaternary.opacity(0.6)).frame(width: cw, height: 260)
                            .overlay(alignment: .topLeading) { Text(heads[i]).font(.footnote.weight(.semibold)).padding(.horizontal, 12).padding(.top, 8) }
                            .offset(x: colX(i))
                    }
                    ForEach(titles.indices, id: \.self) { c in card(c, t) }
                }
                .coordinateSpace(name: "board")
                .frame(width: 360, height: 260, alignment: .topLeading)
            }
        }
        .onAppear { if !ready { ready = true; lay(instant: true) } }
    }

    private func card(_ c: Int, _ t: Double) -> some View {
        let l = min(1, max(0, lift[c].value(at: t))), isHeld = held == c
        return Text(titles[c]).font(.footnote.weight(.medium)).padding(.horizontal, 12).frame(width: cw - 16, height: ch, alignment: .leading)
            .background(.background, in: RoundedRectangle(cornerRadius: 10))
            .shadow(color: .black.opacity(0.1 + 0.12 * l), radius: 4 + 10 * l, y: 2 + 8 * l)
            .rotationEffect(.degrees(1.5 * l)).scaleEffect(1 + 0.03 * l)
            .offset(x: isHeld ? pos.x : xs[c].value(at: t), y: isHeld ? pos.y : ys[c].value(at: t))
            .zIndex(isHeld ? 5 : l > 0.01 ? 4 : 0)
            .gesture(DragGesture(minimumDistance: 0, coordinateSpace: .named("board"))
                .onChanged { g in
                    if held == nil { begin(c, g) }
                    if held == c { move(g.location) }
                }
                .onEnded { g in if held == c { drop(c, velocity: g.velocity) } })
            .accessibilityLabel(titles[c]).accessibilityHint("Drag to move between columns")
    }

    private func begin(_ c: Int, _ g: DragGesture.Value) {
        let t = now(), col = cols.firstIndex { $0.contains(c) } ?? 0
        let cur = CGPoint(x: xs[c].value(at: t), y: ys[c].value(at: t))
        grab = CGSize(width: cur.x - g.startLocation.x, height: cur.y - g.startLocation.y)
        pos = cur; held = c
        gap = (col, cols[col].firstIndex(of: c) ?? 0)
        if reduce { lift[c].jump(1) } else { lift[c].set(1, at: t) }
        lay()
    }

    private func move(_ loc: CGPoint) {
        pos = CGPoint(x: grab.width + loc.x, y: grab.height + loc.y)
        let col = min(2, max(0, Int(floor((pos.x + cw / 2) / (cw + 12)))))
        let others = cols[col].filter { $0 != held }.count
        let idx = min(others, max(0, Int(((pos.y - top) / (ch + gutter)).rounded())))
        if gap?.col != col || gap?.idx != idx { gap = (col, idx); lay() }
    }

    private func drop(_ c: Int, velocity v: CGSize) {
        guard let g = gap else { return }
        for i in cols.indices { cols[i].removeAll { $0 == c } }
        cols[g.col].insert(c, at: min(g.idx, cols[g.col].count))
        let to = slot(g.col, g.idx), t = now()
        if reduce { xs[c].jump(to.x); ys[c].jump(to.y); lift[c].jump(0) }
        else {
            xs[c].release(from: pos.x, velocity: v.width, to: to.x, at: t); ys[c].release(from: pos.y, velocity: v.height, to: to.y, at: t)
            lift[c].set(0, at: t)
        }
        held = nil; gap = nil; lay()
    }
}
