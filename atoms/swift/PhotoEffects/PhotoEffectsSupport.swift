import SwiftUI
import MotionKit

/// A small sampled copy of an AtomPhoto, for effects that need real pixel values (halftone, histogram, palette).
struct PhPixels {
    let w: Int
    let h: Int
    let rgb: [SIMD3<Double>]
    func lum(_ i: Int) -> Double { 0.2126 * rgb[i].x + 0.7152 * rgb[i].y + 0.0722 * rgb[i].z }
}

@MainActor
func phSample(seed: Int, golden: Double = 0, w: Int = 64, h: Int = 40) -> PhPixels? {
    let r = ImageRenderer(content: AtomPhoto(seed: seed, goldenHour: golden).frame(width: CGFloat(w), height: CGFloat(h)))
    r.scale = 1
    guard let img = r.cgImage,
          let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                              space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue),
          let data = ctx.data else { return nil }
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
    let p = data.bindMemory(to: UInt8.self, capacity: w * h * 4)
    let px = (0..<(w * h)).map { SIMD3(Double(p[$0 * 4]), Double(p[$0 * 4 + 1]), Double(p[$0 * 4 + 2])) / 255 }
    return PhPixels(w: w, h: h, rgb: px)
}

/// The photo cut into three planes by height (sky, far ridge, near slope), each shifted by its own depth.
func phPlanes(seed: Int, size: CGSize, shifts: (sky: CGSize, far: CGSize, near: CGSize)) -> some View {
    ZStack {
        phPhoto(seed, size).scaleEffect(1.12).offset(shifts.sky)
        phPhoto(seed, size).scaleEffect(1.12).offset(shifts.far)
            .mask(alignment: .bottom) { Rectangle().frame(height: size.height * 0.52) }
        phPhoto(seed, size).scaleEffect(1.12).offset(shifts.near)
            .mask(alignment: .bottom) { Rectangle().frame(height: size.height * 0.28) }
    }
    .frame(width: size.width, height: size.height).clipped()
}
