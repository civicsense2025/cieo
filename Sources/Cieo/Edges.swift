import SwiftUI

/// Which axes `EdgesIndicator` glides along with a lagging trailing edge.
public enum EdgesAxis: Sendable, CaseIterable {
    case horizontal, vertical, both
}

/// A sliding selection indicator whose leading edge moves first and trailing edge follows `Motion.lag` later.
/// Give it the selected item's frame (in a shared coordinate space); it draws `shape` between its tracked edges.
public struct EdgesIndicator<S: Shape>: View {
    public typealias Axis = EdgesAxis

    @Environment(\.accessibilityReduceMotion) private var reduce
    let frame: CGRect
    let shape: S
    let style: AnyShapeStyle
    let axis: Axis
    let motionEnabled: Bool
    @State private var minX: CGFloat?
    @State private var maxX: CGFloat?
    @State private var minY: CGFloat?
    @State private var maxY: CGFloat?

    public init(frame: CGRect, shape: S, style: some ShapeStyle, axis: Axis = .horizontal, motionEnabled: Bool = true) {
        self.frame = frame
        self.shape = shape
        self.style = AnyShapeStyle(style)
        self.axis = axis
        self.motionEnabled = motionEnabled
    }

    static func edgeDelays(from old: CGRect, to new: CGRect, axis: Axis) -> (minX: Double, maxX: Double, minY: Double, maxY: Double) {
        let tracksX = axis == .horizontal || axis == .both
        let tracksY = axis == .vertical || axis == .both
        let right = new.minX >= old.minX
        let down = new.minY >= old.minY
        return (
            minX: tracksX ? (right ? Motion.lag : 0) : 0,
            maxX: tracksX ? (right ? 0 : Motion.lag) : 0,
            minY: tracksY ? (down ? Motion.lag : 0) : 0,
            maxY: tracksY ? (down ? 0 : Motion.lag) : 0
        )
    }

    public var body: some View {
        let tracksX = axis == .horizontal || axis == .both
        let tracksY = axis == .vertical || axis == .both
        let loX = tracksX ? (minX ?? frame.minX) : frame.minX
        let hiX = tracksX ? (maxX ?? frame.maxX) : frame.maxX
        let loY = tracksY ? (minY ?? frame.minY) : frame.minY
        let hiY = tracksY ? (maxY ?? frame.maxY) : frame.maxY
        shape
            .fill(style)
            .frame(width: max(0, hiX - loX), height: max(0, hiY - loY))
            .position(x: (loX + hiX) / 2, y: (loY + hiY) / 2)
            .onAppear {
                minX = frame.minX
                maxX = frame.maxX
                minY = frame.minY
                maxY = frame.maxY
            }
            .onChange(of: frame) { old, new in
                guard !reduce, motionEnabled else {
                    minX = new.minX
                    maxX = new.maxX
                    minY = new.minY
                    maxY = new.maxY
                    return
                }
                let delays = Self.edgeDelays(from: old, to: new, axis: axis)
                if tracksX {
                    withAnimation(.motion(.base).delay(delays.minX)) { minX = new.minX }
                    withAnimation(.motion(.base).delay(delays.maxX)) { maxX = new.maxX }
                } else {
                    minX = new.minX
                    maxX = new.maxX
                }
                if tracksY {
                    withAnimation(.motion(.base).delay(delays.minY)) { minY = new.minY }
                    withAnimation(.motion(.base).delay(delays.maxY)) { maxY = new.maxY }
                } else {
                    minY = new.minY
                    maxY = new.maxY
                }
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
