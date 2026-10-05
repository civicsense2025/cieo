import SwiftUI
import Cieo

public struct SyncedThumbnailRailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-sync", category: "Carousels", name: "Synced thumbnail rail",
        summary: "The main photo drags 1:1. The thumbnail plate is a pure function of that position: its leading edge reaches the next thumb first and its trailing edge follows, so it stretches mid-move in either direction and can never drift out of sync. The rail recenters on the active thumb and can be flicked on its own. Inspired by Swiper thumbs and Flickity asNavFor; changed: one position drives both, instead of two carousels messaging each other. Use when people compare similar photos and need detail and overview at once, such as product galleries.")
    public init() {}
    private let count = 6

    public var body: some View {
        AtomStage(hint: "One position drives the photo, the plate and the rail") {
            PhPager(count: count, itemFraction: 0.82) { pos, size, item in
                let pitch: CGFloat = 54
                let i = floor(pos), f = pos - i
                // leading edge reaches the next thumb first and the trailing edge follows, either way
                let lo = i + phSmooth(phRange(f, 0.25, 1)), hi = i + 1 + phSmooth(phRange(f, 0, 0.75))
                ZStack {
                    ForEach(0..<count, id: \.self) { n in
                        phPhoto(n, CGSize(width: item - 8, height: size.height * 0.68)).clipShape(RoundedRectangle(cornerRadius: 10))
                            .offset(x: CGFloat(Double(n) - pos) * item, y: -size.height * 0.14)
                    }
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 8).strokeBorder(Color.accentColor, lineWidth: 2)
                            .frame(width: CGFloat(hi - lo) * pitch - 4, height: 40).offset(x: CGFloat(lo) * pitch - 2)
                        ForEach(0..<count, id: \.self) { n in
                            phPhoto(n, CGSize(width: 46, height: 36)).clipShape(RoundedRectangle(cornerRadius: 6)).offset(x: CGFloat(n) * pitch)
                        }
                    }
                    // the rail recenters on the active thumb
                    .frame(width: CGFloat(count) * pitch, alignment: .leading)
                    .offset(x: CGFloat(count) * pitch / 2 - 23 - CGFloat(pos) * pitch)
                    .offset(y: size.height * 0.4)
                }
                .frame(width: size.width, height: size.height)
            }
            .frame(height: 210)
        }
    }
}
