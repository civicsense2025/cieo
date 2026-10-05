import SwiftUI
import Cieo

public struct CollectionMorphAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-collection-morph", category: "Galleries", name: "Collection to collection morph",
        summary: "Twelve photographs are one set of elements that every collection arranges differently: a lead image with a grid, a plain grid, justified rows, tall columns. Switching runs in order. Photos not in the next collection shrink away first. Photos that are in both travel to their new slots, re-cropping as they go (a landscape becomes a tall column without a jump cut), starting 80ms later and staggered by their new position. Photos that are new to the collection grow in last. The title swaps on the same schedule: out, then in. Use when albums, smart collections or saved sets share photos and the user should see what carried over.")
    @State private var current = 0
    @State private var old: [Int: CGRect] = [:]
    @State private var new: [Int: CGRect] = [:]
    @State private var start = Date()
    @State private var width: CGFloat = 300
    public init() {}
    private let names = ["Lead and grid", "Plain grid", "Justified rows", "Tall columns"]
    private let height: CGFloat = 190

    private func layout(_ c: Int, _ w: CGFloat) -> [Int: CGRect] {
        var out: [Int: CGRect] = [:]
        let g: CGFloat = 6
        switch c {
        case 0:
            out[0] = CGRect(x: 0, y: 0, width: (w - g) / 2, height: height)
            let cw = (w / 2 - 3 * g) / 3, ch = (height - g) / 2
            for k in 1..<7 { out[k] = CGRect(x: w / 2 + g + CGFloat((k - 1) % 3) * (cw + g), y: CGFloat((k - 1) / 3) * (ch + g), width: cw, height: ch) }
        case 1:
            let cw = (w - 3 * g) / 4, ch = (height - 2 * g) / 3
            for k in 0..<12 { out[k] = CGRect(x: CGFloat(k % 4) * (cw + g), y: CGFloat(k / 4) * (ch + g), width: cw, height: ch) }
        case 2:
            let rows: [[Int]] = [[2, 3, 4], [5, 6], [7, 8, 9]], ws: [[CGFloat]] = [[0.4, 0.3, 0.3], [0.6, 0.4], [0.3, 0.4, 0.3]]
            let rh = (height - 2 * g) / 3
            for (r, ids) in rows.enumerated() { var x: CGFloat = 0
                for (k, id) in ids.enumerated() { let cw = (w - g * CGFloat(ids.count - 1)) * ws[r][k]; out[id] = CGRect(x: x, y: CGFloat(r) * (rh + g), width: cw, height: rh); x += cw + g } }
        default:
            let cw = (w - 3 * g) / 4, tall = height * 0.6, short = height - tall - g
            for k in 0..<8 {
                let col = k % 4, top = k < 4, isTall = (col % 2 == 0) == top
                let h = isTall ? tall : short
                out[k + 1] = CGRect(x: CGFloat(col) * (cw + g), y: top ? 0 : height - h, width: cw, height: h)
            }
        }
        return out
    }

    public var body: some View {
        AtomStage(hint: "Shared photos travel and re-crop; the rest leave or arrive") {
            VStack(spacing: 12) {
                SwapText(names[current]).font(.subheadline.weight(.semibold))
                GeometryReader { g in
                    PhMorphGrid(old: old, new: new, start: start)
                        .onAppear { width = g.size.width; if new.isEmpty { new = layout(0, g.size.width); old = new } }
                }.frame(height: height)
                Picker("Collection", selection: Binding(get: { current }, set: { pick($0) })) {
                    ForEach(names.indices, id: \.self) { Text(names[$0]).tag($0) }
                }.pickerStyle(.segmented).labelsHidden()
            }
        }
    }

    private func pick(_ i: Int) { guard i != current else { return }; current = i; old = new; new = layout(i, width); start = Date() }
}
