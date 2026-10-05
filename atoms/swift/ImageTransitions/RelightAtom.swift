import SwiftUI
import Cieo

public struct RelightAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-relight", category: "Image transitions", name: "Relight",
        summary: "The same scene moves from midday to afternoon to golden hour along a light front that spreads out from the sun’s path, sky before ground; stepping to another place falls back to a plain dissolve so the light front only ever means “same place, new light”. Use it when only the time or the conditions change, like a lighting preview or a day-to-evening product shot.")
    public init() {}
    private let lights: [Double] = [0, 0.5, 1]

    public var body: some View {
        PhSlideshow(hint: "Midday, afternoon, golden hour: light spreads from the sun", preset: .lazy) { f in
            ZStack {
                phPhoto(0, f.size, golden: lights[f.from])
                // the light front sweeps from the sun's corner, sky before ground
                phPhoto(0, f.size, golden: lights[f.to])
                    .mask(phSoftEdge(f.p, soft: 0.5, start: f.dir >= 0 ? .topTrailing : .topLeading, end: f.dir >= 0 ? .bottomLeading : .bottomTrailing))
            }
        }
    }
}
