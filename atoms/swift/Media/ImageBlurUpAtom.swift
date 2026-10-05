import SwiftUI
import MotionKit

public struct ImageBlurUpAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "imageload", category: "Media", name: "Image blur-up",
        summary: "A tiny blurred placeholder holds the space. When the image decodes, blur and a 4% overscale settle together on the lazy spring, so the sharpening reads as focus, not a pop.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var load = Track(0, preset: .lazy)
    public init() {}

    public var body: some View {
        AtomStage(hint: "Reload to watch it come into focus") {
            VStack(spacing: 16) {
                TimelineView(.motion(load)) { ctx in
                    let p = max(0, min(1, load.value(at: ctx.date.timeIntervalSinceReferenceDate)))
                    ZStack {
                        Rectangle().fill(.quaternary)
                        AtomPhoto(seed: 4, goldenHour: 0.2)
                            .blur(radius: 14 * (1 - p)).scaleEffect(1 + 0.04 * (1 - p)).opacity(0.55 + 0.45 * p)
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .aspectRatio(16.0 / 10.0, contentMode: .fit).frame(maxWidth: 320)
                .accessibilityLabel("Landscape photo")
                Button("Reload", action: reload).buttonStyle(.bordered)
            }
        }
        .onAppear(perform: reload)
    }

    private func reload() {
        load.jump(0)
        DataMotion.retarget(&load, to: 1, delay: 0.9, reduce: reduce)
    }
}
