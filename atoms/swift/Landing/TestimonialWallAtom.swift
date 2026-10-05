import SwiftUI
import Cieo

public struct TestimonialWallAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "testimonialwall", category: "Landing", name: "Testimonial wall",
        summary: "Choosing a filter blurs out the cards that no longer match, right where they are. The remaining cards spring to their new slots, staggered 30ms by slot, and the wall height follows. Opening a quote first collapses any other open one, then grows the card in place; only the cards beneath it in the same column move.")

    private struct Quote { let who: String; let tag: String; let text: String }
    private let quotes = [Quote(who: "Maya", tag: "Members", text: "I read every issue on the train. It is the one subscription I never question."),
        Quote(who: "Theo", tag: "Press", text: "A newsroom that links its sources. The corrections policy alone is worth reading."),
        Quote(who: "Ada", tag: "Members", text: "The yearly plan paid for itself in the first month of reporting."),
        Quote(who: "Jonas", tag: "Press", text: "Careful, local and quick to fix mistakes."),
        Quote(who: "Priya", tag: "Members", text: "Finally a site that loads fast and respects my time."),
        Quote(who: "Sam", tag: "Press", text: "Their budget explainers are now required reading in our office.")]
    private let filters = ["All", "Members", "Press"]
    private let cw: CGFloat = 170, closed: CGFloat = 74, opened: CGFloat = 110, gutter: CGFloat = 8
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var filter = 0
    @State private var open: Int?
    public init() {}

    private func match(_ i: Int) -> Bool { filter == 0 || quotes[i].tag == filters[filter] }

    private func layout() -> (pos: [Int: CGPoint], slot: [Int: Int], height: CGFloat) {
        var y = [CGFloat(0), 0], pos: [Int: CGPoint] = [:], slot: [Int: Int] = [:], n = 0
        for i in quotes.indices where match(i) {
            let c = n % 2; pos[i] = CGPoint(x: CGFloat(c) * (cw + gutter), y: y[c]); slot[i] = n
            y[c] += (open == i ? opened : closed) + gutter; n += 1
        }
        return (pos, slot, max(y[0], y[1]))
    }

    public var body: some View {
        let l = layout()
        AtomStage(hint: "Filter, then open a quote") {
            VStack(spacing: 10) {
                Picker("Filter", selection: $filter) { ForEach(filters.indices, id: \.self) { Text(filters[$0]).tag($0) } }.pickerStyle(.segmented).labelsHidden().frame(width: 220)
                ZStack(alignment: .topLeading) {
                    ForEach(quotes.indices, id: \.self) { i in
                        let p = l.pos[i] ?? .zero, m = match(i), s = l.slot[i] ?? i
                        Button { toggle(i) } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(quotes[i].who).font(.caption.weight(.semibold)); Text(quotes[i].text).font(.caption).foregroundStyle(.secondary).lineLimit(open == i ? nil : 2).multilineTextAlignment(.leading)
                            }.padding(10).frame(width: cw, height: open == i ? opened : closed, alignment: .topLeading).background(.background, in: RoundedRectangle(cornerRadius: 10)).clipped()
                        }.buttonStyle(.plain).opacity(m ? 1 : 0).blur(radius: m ? 0 : 6).allowsHitTesting(m)
                        .offset(x: p.x, y: p.y).animation(reduce ? nil : .motion(.base).delay(Double(s) * 0.03), value: p)
                        .accessibilityLabel("\(quotes[i].who): \(quotes[i].text)")
                    }
                }.frame(width: 2 * cw + gutter, height: l.height, alignment: .topLeading).animation(reduce ? nil : .motion(.base), value: filter)
                Spacer(minLength: 0)
            }.frame(height: 290, alignment: .top)
        }
    }

    private func toggle(_ i: Int) {
        if open == i { withMotion(.base, reduceMotion: reduce) { open = nil }; return }
        if open != nil {
            withMotion(.snap, reduceMotion: reduce) { open = nil }
            Task { try? await Task.sleep(for: .seconds(Motion.exit)); withMotion(.base, reduceMotion: reduce) { open = i } }
        } else { withMotion(.base, reduceMotion: reduce) { open = i } }
    }
}
