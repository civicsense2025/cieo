import SwiftUI
import MotionKit

public struct MomentumFilmstripAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-film", category: "Carousels", name: "Momentum filmstrip",
        summary: "The strip follows the pointer 1:1. On release the velocity is projected about 0.4 s ahead and the strip settles on the nearest frame edge from that same velocity, so a hard flick travels several frames and a nudge moves one. Past either end it rubber-bands and the scroll bar shortens. Inspired by Keen Slider free-snap and Flickity freeScroll; changed: frames keep their real aspect ratios and the counter reports the range in view. Use when photos come in mixed formats and people skim them fast, like a contact sheet.")
    public init() {}
    private let ratios: [CGFloat] = [1.5, 0.7, 1.0, 1.5, 0.8, 1.2, 0.7, 1.4]

    public var body: some View {
        AtomStage(hint: "Flick hard to travel several frames; a nudge moves one") {
            PhPager(count: ratios.count, itemFraction: 0.45, maxStep: 6) { pos, size, _ in
                let h = size.height * 0.8
                let lefts = ratios.reduce(into: [CGFloat(0)]) { $0.append($0.last! + h * $1 + 8) }
                let clamped = min(max(pos, 0), Double(ratios.count - 1))
                let i = Int(clamped), f = CGFloat(clamped - Double(i))
                let lead = lefts[i] + (lefts[min(i + 1, ratios.count)] - lefts[i]) * f + (pos - clamped) * h
                ZStack(alignment: .topLeading) {
                    ForEach(ratios.indices, id: \.self) { n in
                        phPhoto(n, CGSize(width: h * ratios[n], height: h)).clipShape(RoundedRectangle(cornerRadius: 8))
                            .offset(x: lefts[n] - lead + 16)
                    }
                    Text("\(i + 1) to \(min(ratios.count, i + 3)) of \(ratios.count)").font(.caption.monospacedDigit())
                        .foregroundStyle(.secondary).offset(y: h + 10)
                }
                .frame(width: size.width, height: size.height, alignment: .topLeading).clipped()
            }
            .frame(height: 190)
        }
    }
}
