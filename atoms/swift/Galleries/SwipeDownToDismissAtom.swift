import SwiftUI
import MotionKit

public struct SwipeDownToDismissAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-swipe-dismiss", category: "Galleries", name: "Swipe down to dismiss",
        summary: "Open a photo and drag it anywhere: it follows the pointer one to one and shrinks about the point you hold as you pull down, while the scrim fades with the distance and the controls fade out within the first 70 pixels. On release the pointer velocity decides: a fast flick or more than a fifth of the height hands the photo to the shared-element flight back to its tile, keeping the finger speed, and anything less springs back to centre. Use when a viewer needs the natural, touch-first way out.")
    @State private var rest = CGSize.zero
    @State private var open = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the photo down or sideways; a flick throws it back") {
            GeometryReader { g in
                let h = g.size.height
                ZStack {
                    if open {
                        PhDrag(preset: .base, rest: rest, decide: { o, extra in
                            // velocity decides: a flick, or more than a fifth of the height, sends it back to its tile
                            (o.height + extra.height * 0.2 > h * 0.2) ? CGSize(width: 0, height: h * 0.55) : .zero
                        }, onRelease: { to in
                            if to != .zero { Task { try? await Task.sleep(nanoseconds: 500_000_000); open = false } }
                        }) { o, _ in
                            let pull = phClamp(Double(max(0, o.height)) / Double(h))
                            ZStack {
                                Color.black.opacity(0.5 * (1 - pull))
                                // shrinks about the point you hold as you pull down
                                phPhoto(1, CGSize(width: g.size.width * 0.8, height: h * 0.7))
                                    .clipShape(RoundedRectangle(cornerRadius: 14))
                                    .scaleEffect(1 - 0.7 * pull).offset(o)
                                VStack { HStack { Spacer(); Image(systemName: "xmark.circle.fill").foregroundStyle(.white) }; Spacer() }
                                    .padding(10).opacity(1 - phClamp(Double(abs(o.height)) / 70))
                            }
                        }
                    } else {
                        Button("Open the photo") { rest = .zero; open = true }.buttonStyle(.bordered)
                    }
                }
                .frame(width: g.size.width, height: h)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .background(RoundedRectangle(cornerRadius: 14).fill(.quaternary))
            }
            .frame(height: 230)
        }
    }
}
