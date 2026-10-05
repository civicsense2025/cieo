import SwiftUI
import MotionKit

public struct GradeWithHistogramAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-grade", category: "Photo effects", name: "Grade with live histogram",
        summary: "Exposure and white balance are applied in linear light, and the same curve runs on a 1/8-size copy to draw the histogram, so the graph slides with the photo as you scrub. Drag sideways on the photo for exposure, or use the sliders. Auto exposes to the right (the 98th percentile lands just under white) with half a grey-world balance; Auto and Reset glide there on a soft spring. Clipped highlights and crushed shadows can be painted in danger and accent. Use when: people adjust uploads in a media library or editor and need to see what they are losing.")
    @State private var pixels: PhPixels?
    @State private var ev = 0.0
    @State private var warmth = 0.0
    @State private var dragging = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag sideways on the photo for exposure, or use the sliders") {
            VStack(spacing: 8) {
                // the shown values follow the controls; Auto and Reset glide there on a soft spring
                PhFollow(target: ev, preset: dragging ? .snap : .soft) { e in
                    PhFollow(target: warmth, preset: dragging ? .snap : .soft) { w in
                        ZStack(alignment: .bottomTrailing) {
                            GeometryReader { g in
                                ZStack {
                                    phPhoto(1, g.size)
                                    // exposure in stops: lifting screens toward white, lowering multiplies toward black
                                    Color.white.opacity(e > 0 ? 1 - pow(2, -e) : 0).blendMode(.screen)
                                    Color.black.opacity(e < 0 ? 1 - pow(2, e) : 0)
                                    (w > 0 ? Color.orange : Color.blue).opacity(abs(w) * 0.3).blendMode(.softLight)
                                }
                            }
                            histogram(e, w).frame(width: 100, height: 40).padding(6)
                        }
                    }
                }
                .frame(height: 150).clipShape(RoundedRectangle(cornerRadius: 12))
                .gesture(DragGesture(minimumDistance: 4)
                    .onChanged { v in dragging = true; ev = max(-2, min(2, ev + Double(v.translation.width) * 0.002)) }
                    .onEnded { _ in dragging = false })
                row("Exposure", $ev, -2...2); row("Warmth", $warmth, -1...1)
                HStack {
                    Button("Auto") { auto() }
                    Button("Reset") { ev = 0; warmth = 0 }
                }.buttonStyle(.bordered).controlSize(.small)
            }
        }
        .task { pixels = phSample(seed: 1) }
    }

    private func row(_ title: String, _ v: Binding<Double>, _ r: ClosedRange<Double>) -> some View {
        HStack {
            Text(title).font(.caption).frame(width: 64, alignment: .leading)
            Slider(value: v, in: r, onEditingChanged: { dragging = $0 })
            Text(String(format: "%+.1f", v.wrappedValue)).font(.caption.monospacedDigit()).frame(width: 36)
        }
    }

    /// Expose to the right: the 98th percentile lands just under white, with half a grey-world balance.
    private func auto() {
        guard let px = pixels else { return }
        let l = (0..<(px.w * px.h)).map { px.lum($0) }.sorted()
        ev = max(-2, min(2, log2(0.95 / max(0.02, l[Int(Double(l.count) * 0.98)]))))
        let mean = px.rgb.reduce(SIMD3<Double>(repeating: 0), +) / Double(px.rgb.count)
        warmth = max(-1, min(1, (mean.z - mean.x) * 1.5))
    }

    /// The same curve runs on the sampled pixels, so the graph slides with the photo; clipped ends show in red.
    private func histogram(_ e: Double, _ w: Double) -> some View {
        Canvas { ctx, size in
            guard let px = pixels else { return }
            var bins = [Double](repeating: 0, count: 32)
            for i in 0..<(px.w * px.h) { bins[min(31, Int(max(0, min(1, px.lum(i) * pow(2, e) * (1 + w * 0.05))) * 31.999))] += 1 }
            let top = bins.max() ?? 1
            for (k, b) in bins.enumerated() {
                let h = size.height * b / top, x = CGFloat(k) * size.width / 32
                let clip = (k == 31 || k == 0) && b / top > 0.15
                ctx.fill(Path(CGRect(x: x, y: size.height - h, width: size.width / 32 - 0.5, height: h)), with: .color(clip ? .red : .white.opacity(0.85)))
            }
        }
        .background(.black.opacity(0.45), in: RoundedRectangle(cornerRadius: 6)).accessibilityHidden(true)
    }
}
