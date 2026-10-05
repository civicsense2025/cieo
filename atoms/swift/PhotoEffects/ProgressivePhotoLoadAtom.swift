import SwiftUI
import MotionKit

public struct ProgressivePhotoLoadAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-load", category: "Photo effects", name: "Progressive photo load",
        summary: "A blurred 0.6 KB placeholder holds the layout from the first frame. When the real file lands it develops like a print in the tray: shadows come up first, then midtones, highlights last, over one second. Cached photos skip the reveal entirely, because animating something already there reads as lag. Use when: a feed, gallery or hero loads large photos over slow networks and the layout must not jump.")
    @State private var epoch = 0
    @State private var cached = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Replay the load; a cached photo skips the reveal") {
            VStack(spacing: 12) {
                PhFollow(target: 1, preset: .lazy, epoch: epoch) { raw in
                    // shadows come up first, then midtones, highlights last
                    let t = cached ? 1 : raw
                    let shadows = phRange(t, 0, 0.5), mid = phRange(t, 0.25, 0.75), light = phRange(t, 0.5, 1)
                    GeometryReader { g in
                        ZStack {
                            phPhoto(1, g.size).blur(radius: 18).scaleEffect(1.1)           // the 0.6 KB placeholder holds the layout
                            phPhoto(1, g.size).brightness(-0.45 * (1 - shadows)).contrast(0.7 + 0.3 * mid).saturation(mid)
                                .overlay(Color.white.opacity(0.35 * (1 - light)))
                                .opacity(cached ? 1 : phRange(t, 0, 0.3))
                        }
                    }
                }
                .aspectRatio(1.5, contentMode: .fit).clipShape(RoundedRectangle(cornerRadius: 12))
                .accessibilityLabel("Photo")
                HStack {
                    Button("Reload") { cached = false; epoch += 1 }.buttonStyle(.bordered)
                    Toggle("Cached", isOn: $cached).toggleStyle(.switch).controlSize(.small)
                }.controlSize(.small)
            }
        }
    }
}
