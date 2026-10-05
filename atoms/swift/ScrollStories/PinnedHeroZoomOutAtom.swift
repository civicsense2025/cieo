import SwiftUI
import Cieo

public struct PinnedHeroZoomOutAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-zoomhero", category: "Scroll stories", name: "Pinned hero zoom-out",
        summary: "Use when a landing page should open on one striking detail and then reveal the whole image. The photo starts zoomed to the lit ridge and full bleed; scrolling pulls the camera back (log-scale zoom) while the window shrinks into a framed print with rounded corners. Only after the zoom settles do the three headline lines rise out of their masks, 8% of scroll apart, then the caption. Reduced motion shows the framed end state and fades the lines in.")
    public init() {}
    private let lines = ["Slow ground,", "wide sky,", "one ridge."]

    public var body: some View {
        PhScrollStory(hint: "Scroll: the camera pulls back into a framed print") { p, s in
            let zoomT = phRange(p, 0, 0.6)
            let zoom = exp(log(3.0) * (1 - phSmooth(zoomT)))                   // log-scale zoom
            let inset = 26 * phSmooth(zoomT)
            ZStack {
                Color(white: 0.96)
                phPhoto(0, s).scaleEffect(zoom, anchor: UnitPoint(x: 0.72, y: 0.55))
                    .frame(width: s.width - inset * 2, height: s.height - inset * 2)
                    .clipShape(RoundedRectangle(cornerRadius: 16 * phSmooth(zoomT)))
                // only after the zoom settles do the headline lines rise out of their masks, 8% apart
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(lines.indices, id: \.self) { i in
                        let t = phSmooth(phRange(p, 0.6 + Double(i) * 0.08, 0.76 + Double(i) * 0.08))
                        Text(lines[i]).font(.title3.weight(.bold)).foregroundStyle(.white).shadow(radius: 3)
                            .offset(y: (1 - t) * 26).frame(height: 26, alignment: .bottom).clipped().opacity(t)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading).padding(.leading, 40).padding(.bottom, 34)
                Text("Ridge trail, 6:42 pm").font(.caption2).foregroundStyle(.secondary).opacity(phRange(p, 0.9, 1))
                    .frame(maxHeight: .infinity, alignment: .bottom).padding(.bottom, 6)
            }
        }
    }
}
