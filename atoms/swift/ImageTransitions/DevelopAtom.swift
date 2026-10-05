import SwiftUI
import MotionKit

public struct DevelopAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-develop", category: "Image transitions", name: "Develop",
        summary: "The new photo arrives by brightness, highlights first and shadows last, the way a print comes up in the developer tray: undeveloped areas pale toward paper, and each area gains its colour after its tone. Use it when the frame stays in the same place and only the moment changes, like before and after or a time-lapse.")
    public init() {}

    public var body: some View {
        PhSlideshow(hint: "Highlights come up first, shadows last", preset: .lazy) { f in
            ZStack {
                phPhoto(f.from, f.size)
                // sky (the brightest tones) arrives before the dark ridges; colour follows tone
                ZStack {
                    Color(white: 0.93)
                    phPhoto(f.to, f.size).saturation(phRange(f.p, 0.35, 1)).opacity(0.25 + 0.75 * phRange(f.p, 0.2, 0.8))
                }
                .mask(phSoftEdge(f.p, soft: 0.5))
            }
        }
    }
}
