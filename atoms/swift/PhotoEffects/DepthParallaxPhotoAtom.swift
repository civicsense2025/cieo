import SwiftUI
import MotionKit

public struct DepthParallaxPhotoAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-depth", category: "Photo effects", name: "Depth parallax",
        summary: "The photo is split into planes by aerial perspective (farther ridges are lighter). The pointer offsets each plane by its depth around a pivot at the middle ridge: sky and far ridge drift against the pointer, the foreground follows it, at most about 1% of the width. Planes ride a lazy spring and drift home when the pointer leaves. Use when: a landing hero needs a sense of place without video, and the photo must stay fully readable.")
    @State private var pointer = CGPoint(x: 0, y: 0)       // -0.5...0.5 around the centre
    public init() {}

    public var body: some View {
        AtomStage(hint: "Move the pointer: planes drift by depth and settle back") {
            GeometryReader { g in
                let s = g.size
                // planes ride a lazy spring; sky and far ridge go against the pointer, the foreground with it
                PhFollow(target: Double(pointer.x), preset: .lazy) { px in
                    PhFollow(target: Double(pointer.y), preset: .lazy) { py in
                        let unit = s.width * 0.01
                        phPlanes(seed: 3, size: s, shifts: (
                            sky: CGSize(width: -px * unit * 1.0, height: -py * unit * 0.6),
                            far: CGSize(width: -px * unit * 0.4, height: -py * unit * 0.25),
                            near: CGSize(width: px * unit * 0.6, height: py * unit * 0.4)))
                    }
                }
                .contentShape(Rectangle())
                .onContinuousHover { phase in
                    switch phase {
                    case .active(let p): pointer = CGPoint(x: (p.x / s.width - 0.5) * 2, y: (p.y / s.height - 0.5) * 2)
                    case .ended: pointer = .zero
                    }
                }
                .gesture(DragGesture(minimumDistance: 0)
                    .onChanged { v in pointer = CGPoint(x: (v.location.x / s.width - 0.5) * 2, y: (v.location.y / s.height - 0.5) * 2) }
                    .onEnded { _ in pointer = .zero })
            }
            .frame(height: 200).clipShape(RoundedRectangle(cornerRadius: 12)).accessibilityHidden(true)
        }
    }
}
