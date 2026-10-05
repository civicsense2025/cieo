import SwiftUI
import Cieo

public struct HalftoneToPhotoAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-screen", category: "Photo effects", name: "Halftone to photo",
        summary: "The hero arrives as print: an ink screen whose dot sizes carry the photo’s tones in the page’s own ink and paper colours. It then resolves over 2.2 s: the screen gets finer, the dots take on the photo’s colour, and the last stretch dissolves into the full photograph. Scrub it, or pick dots or a 15° line screen. Use when: an editorial or campaign hero wants a printed, considered entrance that still ends on the real photo.")
    @State private var pixels: PhPixels?
    @State private var epoch = 0
    @State private var scrub: Double?
    @State private var lines = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Replay, or scrub the slider; pick dots or a 15 degree line screen") {
            VStack(spacing: 10) {
                PhFollow(target: 1, preset: .lazy, epoch: epoch) { auto in
                    let t = scrub ?? auto
                    GeometryReader { g in
                        ZStack {
                            Color(white: 0.96)
                            Canvas { ctx, size in draw(ctx, size, t) }
                            // the last stretch dissolves into the full photograph
                            phPhoto(0, g.size).opacity(phRange(t, 0.75, 1))
                        }
                    }
                }
                .aspectRatio(1.5, contentMode: .fit).clipShape(RoundedRectangle(cornerRadius: 12))
                .accessibilityLabel("Halftone print resolving to a photo")
                HStack {
                    Button("Replay") { scrub = nil; epoch += 1 }.buttonStyle(.bordered)
                    Slider(value: Binding(get: { scrub ?? 1 }, set: { scrub = $0 }), in: 0...1)
                    Picker("Screen", selection: $lines) { Text("Dots").tag(false); Text("Lines").tag(true) }.pickerStyle(.segmented).frame(width: 120).labelsHidden()
                }.controlSize(.small)
            }
        }
        .task { pixels = phSample(seed: 0) }
    }

    /// Dot size carries the tone in ink on paper; the screen gets finer and takes on the photo's colour as t grows.
    private func draw(_ ctx: GraphicsContext, _ size: CGSize, _ t: Double) {
        guard let px = pixels else { return }
        let cell = 14 - 8 * phSmooth(phRange(t, 0, 0.8))
        let color = phSmooth(phRange(t, 0.3, 0.8))
        var c = ctx
        if lines { c.rotate(by: .degrees(15)) }
        var y = -size.height * 0.3
        while y < size.height * 1.3 {
            var x = -size.width * 0.3
            while x < size.width * 1.3 {
                let ix = min(px.w - 1, max(0, Int((x + cell / 2) / size.width * Double(px.w)))), iy = min(px.h - 1, max(0, Int((y + cell / 2) / size.height * Double(px.h))))
                let p = px.rgb[iy * px.w + ix], dark = 1 - px.lum(iy * px.w + ix)
                let ink = Color(red: 0.12 + (p.x - 0.12) * color, green: 0.12 + (p.y - 0.12) * color, blue: 0.14 + (p.z - 0.14) * color)
                if lines {
                    c.fill(Path(CGRect(x: x, y: y + cell * (0.5 - dark / 2), width: cell, height: cell * dark)), with: .color(ink))
                } else {
                    let r = cell * 0.55 * sqrt(dark)
                    c.fill(Path(ellipseIn: CGRect(x: x + cell / 2 - r, y: y + cell / 2 - r, width: 2 * r, height: 2 * r)), with: .color(ink))
                }
                x += cell
            }
            y += cell
        }
    }
}
