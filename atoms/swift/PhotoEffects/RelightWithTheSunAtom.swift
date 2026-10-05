import SwiftUI
import MotionKit

public struct RelightWithTheSunAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-relight", category: "Photo effects", name: "Relight with the sun",
        summary: "Two pixel-aligned exposures of the same ridge, midday and golden hour, blend through a soft light mask centred on the sun: light near the sun warms first, the far side last. Drag the sun along its path (1:1, then it coasts on release velocity) and it sets behind the real ridge line. Use when: a hero photo should follow the visitor’s local time or the mood of a page, without shipping a second photo set.")
    public init() {}
    private let start = 0.25

    public var body: some View {
        AtomStage(hint: "Drag the sun: the light near it warms first") {
            GeometryReader { g in
                let s = g.size
                PhDrag(preset: .base, decide: { o, extra in
                    // coasts on release velocity, then rests inside the path
                    CGSize(width: min(max(o.width + extra.width * 0.3, -start * s.width), (1 - start) * s.width), height: 0)
                }) { o, _ in
                    let x = phClamp(start + Double(o.width / s.width))
                    let sun = CGPoint(x: s.width * x, y: s.height * (0.62 - 0.45 * sin(.pi * x)))
                    ZStack {
                        phPhoto(2, s, golden: 0)
                        // a soft light mask centred on the sun: light near the sun warms first
                        phPhoto(2, s, golden: 1).mask(
                            RadialGradient(colors: [.white, .white.opacity(0)], center: UnitPoint(x: sun.x / s.width, y: sun.y / s.height),
                                           startRadius: 10, endRadius: s.width * (0.25 + 0.9 * x)))
                        Circle().fill(Color.yellow).frame(width: 26, height: 26).shadow(color: .yellow, radius: 10).position(sun)
                            .accessibilityLabel("Sun").accessibilityValue("\(Int(x * 100)) percent along the path")
                        // it sets behind the real ridge line
                        phPhoto(2, s, golden: x).mask(alignment: .bottom) { Rectangle().frame(height: s.height * 0.5) }
                    }
                }
            }
            .frame(height: 210).clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}
