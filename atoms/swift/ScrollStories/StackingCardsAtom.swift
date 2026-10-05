import SwiftUI
import Cieo

public struct StackingCardsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-stackcards", category: "Scroll stories", name: "Stacking cards",
        summary: "Use when an ordered process of three to five steps should replace one step with the next while the earlier ones stay visible. Cards pin 12px apart; as the next card rises over one, that card scales down from its top edge (5% per card above it) and dims, so the stack recedes in depth while its edges stay readable. Coverage is computed from the next card’s distance to its own pin, so scrolling back lifts them out in reverse. Reduced motion keeps the dimming and drops the scale.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}
    private let steps = ["Gather", "Sort", "Print", "Frame"]

    public var body: some View {
        PhScrollStory(hint: "Each card rises over the last; the stack recedes", length: 3) { p, s in
            let q = p * Double(steps.count - 1)
            ZStack(alignment: .top) {
                ForEach(steps.indices, id: \.self) { i in
                    let arrive = phSmooth(phRange(q, Double(i - 1), Double(i)))
                    // coverage: how many later cards have risen over this one
                    let cover = (i + 1 < steps.count ? (i + 1..<steps.count).reduce(0.0) { $0 + phSmooth(phRange(q, Double($1 - 1), Double($1))) } : 0)
                    let pin = CGFloat(i) * 12
                    ZStack(alignment: .topLeading) {
                        phPhoto(i, CGSize(width: s.width - 40, height: s.height * 0.62)).opacity(0.55)
                        Text("\(i + 1). \(steps[i])").font(.headline).padding(12)
                    }
                    .frame(width: s.width - 40, height: s.height * 0.62)
                    .background(RoundedRectangle(cornerRadius: 14).fill(.background))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(.quaternary))
                    .overlay(Color.black.opacity(0.22 * cover).clipShape(RoundedRectangle(cornerRadius: 14)))
                    .scaleEffect(reduce ? 1 : 1 - 0.05 * cover, anchor: .top)      // recedes from its top edge
                    .offset(y: pin + (s.height - pin) * CGFloat(1 - arrive) * (i == 0 ? 0 : 1) + 14)
                }
            }
        }
    }
}
