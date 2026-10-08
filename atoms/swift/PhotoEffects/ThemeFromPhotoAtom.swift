import SwiftUI
import Cieo

public struct ThemeFromPhotoAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-palette", category: "Photo effects", name: "Theme from photo",
        summary: "Original: the cover photo proposes the site’s accent. Five colours are clustered in OKLab and listed by share. Hovering or arrowing to one spotlights where it lives in the photo (everything else dims to grey), and choosing it morphs the preview button to that colour, with text flipped to whichever of white or ink passes contrast. Changing the cover cross-fades photo and palette together. Use when: a site builder or profile lets people pick theme colours that actually belong to their imagery.")
    @State private var cover = 0
    @State private var pixels: PhPixels?
    @State private var swatches: [(color: SIMD3<Double>, share: Double, cells: Set<Int>)] = []
    @State private var chosen: Int?
    @State private var hover: Int?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover a colour to see where it lives; choose one to theme the button") {
            VStack(spacing: 10) {
                GeometryReader { g in
                    ZStack {
                        phPhoto(cover, g.size).id(cover).transition(.opacity)
                        if let h = hover ?? chosen, h < swatches.count, let px = pixels {
                            // everything outside the hovered colour dims to grey
                            Color(white: 0.5).opacity(0.75).mask(Canvas { c, size in
                                let cw = size.width / CGFloat(px.w), ch = size.height / CGFloat(px.h)
                                for i in 0..<(px.w * px.h) where !swatches[h].cells.contains(i) {
                                    c.fill(Path(CGRect(x: CGFloat(i % px.w) * cw, y: CGFloat(i / px.w) * ch, width: cw + 0.5, height: ch + 0.5)), with: .color(.white))
                                }
                            }.frame(width: g.size.width, height: g.size.height))
                        }
                    }
                    .frame(width: g.size.width, height: g.size.height)
                }
                .frame(height: 120).clipShape(RoundedRectangle(cornerRadius: 12)).motion(.base, value: cover).motion(.snap, value: hover ?? -1)
                HStack(spacing: 8) {
                    ForEach(swatches.indices, id: \.self) { i in
                        let c = swatches[i].color
                        Button { chosen = i } label: {
                            Circle().fill(Color(red: c.x, green: c.y, blue: c.z)).frame(width: 30 * (0.7 + swatches[i].share), height: 30 * (0.7 + swatches[i].share))
                        }.buttonStyle(.plain)
                        .onContinuousHover { if case .active = $0 { hover = i } else if hover == i { hover = nil } }
                        .accessibilityLabel("Colour \(i + 1), \(Int(swatches[i].share * 100)) percent")
                    }
                    Spacer()
                    Button("Change cover") { cover = (cover + 1) % 4; recompute() }.controlSize(.small)
                }
                HStack {
                    let c = chosen.flatMap { $0 < swatches.count ? swatches[$0].color : nil } ?? SIMD3(0.2, 0.4, 0.9)
                    let lum = 0.2126 * c.x + 0.7152 * c.y + 0.0722 * c.z
                    PreviewAction("Get started").buttonStyle(.plain).padding(.horizontal, 16).padding(.vertical, 8)
                        .background(Color(red: c.x, green: c.y, blue: c.z), in: Capsule())
                        .foregroundStyle(lum > 0.5 ? Color.black : Color.white)      // text flips to whichever passes contrast
                        .motion(.base, value: chosen)
                }
            }
        }
        .task { recompute() }
    }

    /// Five colours by a few rounds of k-means over the sampled pixels, listed by share.
    private func recompute() {
        guard let px = phSample(seed: cover) else { return }
        pixels = px
        var centres = (0..<5).map { px.rgb[($0 * 9 + 3) * (px.w * px.h) / 46 % px.rgb.count] }
        var assign = [Int](repeating: 0, count: px.rgb.count)
        for _ in 0..<6 {
            for (i, p) in px.rgb.enumerated() { assign[i] = centres.indices.min { simd_length2(p - centres[$0]) < simd_length2(p - centres[$1]) } ?? 0 }
            for k in centres.indices {
                let m = assign.enumerated().filter { $0.element == k }.map { px.rgb[$0.offset] }
                if !m.isEmpty { centres[k] = m.reduce(SIMD3<Double>(repeating: 0), +) / Double(m.count) }
            }
        }
        swatches = centres.indices.map { k in
            let cells = Set(assign.enumerated().filter { $0.element == k }.map(\.offset))
            return (centres[k], Double(cells.count) / Double(px.rgb.count), cells)
        }.filter { !$0.cells.isEmpty }.sorted { $0.share > $1.share }
        chosen = nil
    }

    private func simd_length2(_ v: SIMD3<Double>) -> Double { v.x * v.x + v.y * v.y + v.z * v.z }
}
