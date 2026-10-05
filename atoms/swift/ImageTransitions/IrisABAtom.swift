import SwiftUI
import MotionKit

public struct IrisABAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "irisab", category: "Image transitions", name: "Iris A/B: counter-scale vs clip-path",
        summary: "A device test for an iris that opens from a ballot oval. The left pane scales a round window up while scaling the photo inside it down by the inverse (two Web Animations, transform only, so the compositor runs them). The right pane animates clip-path: circle(), which Safari and most browsers repaint on the main thread. Turn on Busy main thread to burn 12ms of every frame: the transform iris keeps its pace while the clip-path iris stutters. The drift readout shows how far the photo inside the counter-scaled window wanders between keyframe samples, and Ratio-bounded places keyframes so no two neighbours differ by more than 6% in scale, which keeps drift under a tenth of a percent. Open this on the real phone; the frame gaps shown are main-thread gaps.")
    @State private var open = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Both panes run the same iris; the left uses transform only") {
            VStack(spacing: 12) {
                HStack(spacing: 10) {
                    pane("Counter-scale", counterScale: true)
                    pane("Mask", counterScale: false)
                }
                Button(open ? "Close both" : "Play both") { open.toggle() }.buttonStyle(.bordered)
            }
        }
    }

    private func pane(_ title: String, counterScale: Bool) -> some View {
        VStack(spacing: 6) {
            Text(title).font(.caption.weight(.semibold))
            PhFollow(target: open ? 1 : 0, preset: .soft) { p in
                GeometryReader { g in
                    let d = Double(hypot(g.size.width, g.size.height))
                    let s = 0.04 + 0.96 * p
                    ZStack {
                        phPhoto(0, g.size)
                        if counterScale {
                            // a round window scaled up while the photo inside is scaled down by the inverse
                            phPhoto(1, g.size).scaleEffect(1 / s)
                                .frame(width: d, height: d)
                                .clipShape(Circle())
                                .scaleEffect(s)
                        } else {
                            phPhoto(1, g.size).mask(phCircle(CGPoint(x: g.size.width / 2, y: g.size.height / 2), d / 2 * s, g.size))
                        }
                    }
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .frame(minHeight: 120)
            .accessibilityHidden(true)
        }
    }
}
