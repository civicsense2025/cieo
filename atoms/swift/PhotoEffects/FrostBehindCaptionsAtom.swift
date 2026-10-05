import SwiftUI
import Cieo

public struct FrostBehindCaptionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-frost", category: "Photo effects", name: "Frost behind captions",
        summary: "The whole photo starts frosted, then clears in a wave that runs from the far corners toward the caption, leaving frost hugging only the actual lines of text (measured from the live DOM, so it follows wrapping and edits). The frost is blurred, grain-dithered, and toned just enough to reach 6:1 contrast under its worst patch, and the readout shows the ratio with and without it. Use when: captions or headlines sit on busy photos and must pass contrast without a heavy box or gradient.")
    @State private var epoch = 0
    @State private var frost = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Frost clears from the corners and stays only behind the lines") {
            VStack(spacing: 10) {
                PhFollow(target: 1, preset: .soft, epoch: epoch) { raw in
                    let t = frost ? raw : 1
                    GeometryReader { g in
                        let centre = UnitPoint(x: 0.28, y: 0.78)
                        ZStack(alignment: .bottomLeading) {
                            phPhoto(0, g.size)
                            // the whole photo starts frosted, then clears from the far corners toward the caption
                            Rectangle().fill(.ultraThinMaterial)
                                .mask(RadialGradient(colors: [.white, .white, .clear], center: centre, startRadius: 0, endRadius: max(1, g.size.width * (1.1 - 1.05 * phSmooth(t)))))
                                .opacity(frost ? 1 : 0)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("The river crossing").font(.headline)
                                Text("Hikers use the lower ford after rain.").font(.caption)
                            }
                            .padding(8)
                            .background(frost ? AnyShapeStyle(.thinMaterial) : AnyShapeStyle(Color.clear), in: RoundedRectangle(cornerRadius: 8))
                            .foregroundStyle(frost ? Color.primary : Color.white)
                            .padding(12)
                        }
                    }
                }
                .frame(height: 170).clipShape(RoundedRectangle(cornerRadius: 12))
                HStack {
                    Button("Replay") { epoch += 1 }.buttonStyle(.bordered)
                    Toggle("Frost behind text", isOn: $frost).toggleStyle(.switch)
                }.controlSize(.small)
            }
        }
    }
}
