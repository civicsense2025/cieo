import SwiftUI

/// A procedural stand-in photo (sky, sun, layered ridges) so photo atoms need no bundled assets.
/// `seed` picks the scene; `goldenHour` 0 is midday and 1 is golden hour, matching the web PhotoKit pairs.
public struct AtomPhoto: View {
    let seed: Int
    let goldenHour: Double

    public init(seed: Int = 0, goldenHour: Double = 0) {
        self.seed = seed
        self.goldenHour = goldenHour
    }

    public var body: some View {
        Canvas { ctx, size in
            let g = goldenHour
            let hue = Double((seed * 37) % 100) / 100
            let sky = Color(hue: (0.58 + hue * 0.1 - g * 0.5).truncatingRemainder(dividingBy: 1), saturation: 0.35 + g * 0.25, brightness: 0.92 - g * 0.1)
            ctx.fill(Path(CGRect(origin: .zero, size: size)), with: .color(sky))
            let sun = CGRect(x: size.width * (0.2 + hue * 0.6) - 18, y: size.height * (0.18 + g * 0.22), width: 36, height: 36)
            ctx.fill(Path(ellipseIn: sun), with: .color(Color(hue: 0.12 - g * 0.06, saturation: 0.3 + g * 0.5, brightness: 1)))
            for layer in 0..<4 {
                let base = size.height * (0.5 + Double(layer) * 0.13)
                var path = Path()
                path.move(to: CGPoint(x: 0, y: size.height))
                stride(from: 0.0, through: size.width, by: 4).forEach { x in
                    let k = Double(seed + layer * 7)
                    let y = base + sin(x / size.width * 5 + k) * 14 + sin(x / size.width * 13 + k * 1.7) * 6
                    path.addLine(to: CGPoint(x: x, y: y))
                }
                path.addLine(to: CGPoint(x: size.width, y: size.height))
                path.closeSubpath()
                let shade = 0.55 - Double(layer) * 0.12 - g * 0.12
                ctx.fill(path, with: .color(Color(hue: 0.3 - g * 0.2 + hue * 0.05, saturation: 0.3 + g * 0.2, brightness: max(0.12, shade))))
            }
        }
        .accessibilityHidden(true)
    }
}
