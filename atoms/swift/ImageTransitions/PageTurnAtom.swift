import SwiftUI
import MotionKit

public struct PageTurnAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-page", category: "Image transitions", name: "Page turn",
        summary: "The photo lifts from its right edge along a softly bowed fold: its back shows through, mirrored and washed like thin paper, and a shadow runs along the fold onto the next page. Going back lays the page down again. Use it for sequences people read in order, like a lookbook, a catalogue or a printed story.")
    public init() {}

    public var body: some View {
        PhSlideshow(hint: "Next lifts the page from its right edge; Back lays it down", preset: .soft) { f in
            let fwd = f.dir >= 0
            let a = fwd ? f.p : 1 - f.p        // 0 flat ... 1 fully turned
            ZStack {
                phPhoto(fwd ? f.to : f.from, f.size)
                // the fold's shadow falls on the page underneath
                LinearGradient(colors: [.clear, .black.opacity(0.3 * sin(a * .pi))], startPoint: .trailing, endPoint: .leading)
                    .frame(width: f.size.width * 0.35 * a).position(x: f.size.width * (1 - 0.35 * a / 2 - 0.5 * a), y: f.size.height / 2)
                    .opacity(a > 0 ? 1 : 0)
                ZStack {
                    phPhoto(fwd ? f.from : f.to, f.size)
                    // past the half-turn the back shows through, mirrored and washed like thin paper
                    Color.white.opacity(a > 0.5 ? 0.45 : 0)
                }
                .rotation3DEffect(.degrees(-180 * a), axis: (0, 1, 0), anchor: .leading, perspective: 0.55)
                .opacity(a >= 0.999 ? 0 : 1)
            }
            .frame(width: f.size.width, height: f.size.height).clipped()
        }
    }
}
