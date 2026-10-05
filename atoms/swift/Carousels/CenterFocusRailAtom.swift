import SwiftUI
import Cieo

public struct CenterFocusRailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-focus", category: "Carousels", name: "Center-focus rail",
        summary: "Each print scales and fades only by its distance from center, and spacing is integrated from that same scale curve, so gaps stay even and nothing rotates or overlaps. The caption under the center crossfades by distance while you drag. Inspired by Keen Slider’s distance-driven slides and Apple TV shelves; changed: positions come from integrating the scale, so the center print moves exactly 1:1 under the pointer. Use when one item is the subject and its neighbours are context, such as a print shop or a plan picker.")
    public init() {}
    private let names = ["Dune", "Harbour", "Orchard", "Ridge", "Meadow", "Quarry"]

    /// Scale by distance from center, and the spacing integrated from that same curve (so gaps stay even).
    private func scale(_ d: Double) -> Double { max(0.6, 1 - 0.2 * abs(d)) }
    private func place(_ d: Double) -> Double {
        let a = abs(d), s = d < 0 ? -1.0 : 1.0
        return s * (a <= 2 ? a - 0.1 * a * a : 1.6 + 0.6 * (a - 2))
    }

    public var body: some View {
        AtomStage(hint: "The center print is the subject; neighbours are context") {
            PhPager(count: names.count, itemFraction: 0.4) { pos, size, item in
                ZStack {
                    ForEach(names.indices, id: \.self) { i in
                        let d = Double(i) - pos
                        phPhoto(i, CGSize(width: item, height: size.height * 0.7)).clipShape(RoundedRectangle(cornerRadius: 8))
                            .scaleEffect(scale(d)).opacity(0.45 + 0.55 * (scale(d) - 0.6) / 0.4)
                            .offset(x: CGFloat(place(d)) * item * 1.05)
                    }
                    let near = Int(pos.rounded())
                    ZStack {
                        ForEach(names.indices, id: \.self) { i in
                            Text(names[i]).font(.subheadline.weight(.medium))
                                .opacity(max(0, 1 - abs(Double(i) - pos) * 1.6))
                        }
                    }
                    .offset(y: size.height * 0.45).accessibilityLabel(names[min(max(near, 0), names.count - 1)])
                }
                .frame(width: size.width, height: size.height)
            }
            .frame(height: 180)
        }
    }
}
