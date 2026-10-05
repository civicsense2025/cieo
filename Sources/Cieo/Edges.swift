import SwiftUI

/// A sliding selection indicator whose leading edge moves first and trailing edge follows `Motion.lag` later.
/// Give it the selected item's frame (in a shared coordinate space); it draws `shape` between its two edges.
public struct EdgesIndicator<S: Shape>: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let frame: CGRect
    let shape: S
    let style: AnyShapeStyle
    @State private var minX: CGFloat?
    @State private var maxX: CGFloat?

    public init(frame: CGRect, shape: S, style: some ShapeStyle) {
        self.frame = frame
        self.shape = shape
        self.style = AnyShapeStyle(style)
    }

    public var body: some View {
        let lo = minX ?? frame.minX
        let hi = maxX ?? frame.maxX
        shape
            .fill(style)
            .frame(width: max(0, hi - lo), height: frame.height)
            .position(x: (lo + hi) / 2, y: frame.midY)
            .onAppear {
                minX = frame.minX
                maxX = frame.maxX
            }
            .onChange(of: frame) { old, new in
                guard !reduce else {
                    minX = new.minX
                    maxX = new.maxX
                    return
                }
                let right = new.minX >= old.minX
                withAnimation(.motion(.base).delay(right ? Motion.lag : 0)) { minX = new.minX }
                withAnimation(.motion(.base).delay(right ? 0 : Motion.lag)) { maxX = new.maxX }
            }
            .allowsHitTesting(false)
    }
}

/// Reports a view's frame in a named coordinate space, for `EdgesIndicator`.
public struct FramePreferenceKey: PreferenceKey {
    public static let defaultValue: [AnyHashable: CGRect] = [:]
    public static func reduce(value: inout [AnyHashable: CGRect], nextValue: () -> [AnyHashable: CGRect]) {
        value.merge(nextValue()) { $1 }
    }
}

public extension View {
    /// Publishes this view's frame under `id` in `space`.
    func reportFrame(_ id: AnyHashable, in space: String) -> some View {
        background(GeometryReader { g in
            Color.clear.preference(key: FramePreferenceKey.self, value: [id: g.frame(in: .named(space))])
        })
    }
}
