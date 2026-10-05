import SwiftUI
import MotionKit

public struct LightboxZoomPanAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-zoom-pan", category: "Galleries", name: "Lightbox with pinch, wheel and double-tap zoom",
        summary: "The photo is a transform, not a layout: two fingers scale it about their midpoint while the midpoint drags it, a double-tap zooms to the exact point tapped, and Ctrl plus wheel (a trackpad pinch) zooms about the cursor without taking over normal scrolling. Pull past an edge and the image resists on a rubber band that grows harder the further you go; let go and a critically damped spring returns it, carrying the flick as glide that stops at the edge instead of bouncing off it. A locator in the corner shows which part you are looking at. Switching photos is a Swap that resets the zoom while the picture is invisible. Use when photographs need inspecting at pixel level.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var scale = 1.0
    @State private var offset = CGSize.zero
    @State private var pinchBase: Double?
    @State private var panBase = CGSize.zero
    @State private var live = false
    @State private var photo = 0
    public init() {}

    private func limit(_ s: Double, _ size: CGSize) -> CGSize { CGSize(width: size.width * (s - 1) / 2, height: size.height * (s - 1) / 2) }
    /// Past an edge the image resists on a rubber band that grows harder with distance.
    private func rubber(_ v: CGFloat, _ lim: CGFloat) -> CGFloat {
        v > lim ? lim + (v - lim) * 0.35 : (v < -lim ? -lim + (v + lim) * 0.35 : v)
    }
    private func settle(_ size: CGSize) {
        let l = limit(scale, size)
        withMotion(.soft, reduceMotion: reduce) {
            scale = phClamp(scale, 1, 4)
            offset = CGSize(width: min(max(offset.width, -l.width), l.width), height: min(max(offset.height, -l.height), l.height))
        }
    }

    public var body: some View {
        AtomStage(hint: "Pinch, double-tap or drag; Next resets the zoom") {
            VStack(spacing: 10) {
                GeometryReader { g in
                    ZStack(alignment: .bottomTrailing) {
                        phPhoto(photo, g.size).scaleEffect(scale).offset(offset)
                            .id(photo).transition(.motionSwap(drift: 0))
                        locator(g.size)
                    }
                    .frame(width: g.size.width, height: g.size.height).clipped()
                    .contentShape(Rectangle())
                    .gesture(MagnifyGesture()
                        .onChanged { v in
                            if pinchBase == nil { pinchBase = scale }
                            scale = (pinchBase ?? 1) * v.magnification
                        }
                        .onEnded { _ in pinchBase = nil; settle(g.size) })
                    .simultaneousGesture(DragGesture(minimumDistance: 4)
                        .onChanged { v in
                            guard scale > 1.01 else { return }
                            if !live { live = true; panBase = offset }
                            let l = limit(scale, g.size)
                            offset = CGSize(width: rubber(panBase.width + v.translation.width, l.width), height: rubber(panBase.height + v.translation.height, l.height))
                        }
                        .onEnded { v in
                            live = false
                            // the flick glides on, but stops at the edge rather than bouncing off it
                            let l = limit(scale, g.size)
                            offset = CGSize(width: offset.width + (v.predictedEndTranslation.width - v.translation.width) * 0.15, height: offset.height + (v.predictedEndTranslation.height - v.translation.height) * 0.15)
                            offset = CGSize(width: min(max(offset.width, -l.width), l.width), height: min(max(offset.height, -l.height), l.height))
                            settle(g.size)
                        })
                    .onTapGesture(count: 2) { p in
                        withMotion(.soft, reduceMotion: reduce) {
                            if scale > 1.2 { scale = 1; offset = .zero } else {
                                // zoom to the exact point tapped
                                scale = 2.5
                                let l = limit(2.5, g.size)
                                offset = CGSize(width: min(max((g.size.width / 2 - p.x) * 1.5, -l.width), l.width), height: min(max((g.size.height / 2 - p.y) * 1.5, -l.height), l.height))
                            }
                        }
                    }
                    .accessibilityLabel("Photo \(photo + 1)").accessibilityValue("Zoom \(String(format: "%.1f", scale)) times")
                    .accessibilityAdjustableAction { d in
                        withMotion(.soft, reduceMotion: reduce) { scale = phClamp(scale + (d == .increment ? 0.5 : -0.5), 1, 4); if scale == 1 { offset = .zero } }
                    }
                }
                .frame(height: 200).clipShape(RoundedRectangle(cornerRadius: 12))
                Button("Next photo") {
                    // the zoom resets while the picture is invisible
                    withMotion(.base, reduceMotion: reduce) { photo = (photo + 1) % 3 }
                    scale = 1; offset = .zero
                }.buttonStyle(.bordered).controlSize(.small)
            }
        }
    }

    /// A corner map of which part of the photo is in view.
    private func locator(_ size: CGSize) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 3).fill(.black.opacity(0.4)).frame(width: 40, height: 28)
            RoundedRectangle(cornerRadius: 2).stroke(.white, lineWidth: 1.5)
                .frame(width: 40 / scale, height: 28 / scale)
                .offset(x: -offset.width / scale / size.width * 40, y: -offset.height / scale / size.height * 28)
        }
        .padding(8).opacity(scale > 1.05 ? 1 : 0).accessibilityHidden(true)
    }
}
