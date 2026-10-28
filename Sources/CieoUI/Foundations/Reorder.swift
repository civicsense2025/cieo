import Cieo
import SwiftUI

/// A row being dragged to a new place in a vertical list. It holds only numbers, so the rules for where a
/// row lands and how the others make room are testable without a screen. Row positions are measured once,
/// when the drag starts.
public struct ReorderDrag: Equatable, Sendable {
    /// The dragged row's index when the drag began.
    public let from: Int
    /// Each row's vertical centre when the drag began, top to bottom.
    public let centers: [Double]
    /// The dragged row's height.
    public let height: Double
    /// The gap between rows.
    public let spacing: Double
    /// How far the finger has moved vertically since the drag began.
    public private(set) var translation: Double = 0
    /// The index the row would take if dropped now.
    public private(set) var over: Int

    public init?(from: Int, centers: [Double], height: Double, spacing: Double) {
        guard centers.indices.contains(from), height.isFinite, spacing.isFinite,
              centers.allSatisfy(\.isFinite) else { return nil }
        self.from = from
        self.centers = centers
        self.height = max(0, height)
        self.spacing = max(0, spacing)
        self.over = from
    }

    /// A row's height plus the gap below it: how far the other rows slide to make room.
    public var step: Double { height + spacing }

    /// True once the row has crossed at least one neighbour.
    public var isMoving: Bool { over != from }

    /// Follows the finger. A non-finite value is ignored.
    public mutating func update(translation newValue: Double) {
        guard newValue.isFinite else { return }
        translation = newValue
        over = Self.dropIndex(centers: centers, from: from, draggedCenter: centers[from] + newValue, draggedHeight: height)
    }

    /// How far the row at `index` slides while another is dragged, so the gap follows the finger.
    public func shift(forRowAt index: Int) -> Double {
        if index == from { return 0 }
        if from < over, index > from, index <= over { return -step }
        if from > over, index >= over, index < from { return step }
        return 0
    }

    /// The place a row lands when its centre is at `draggedCenter`. The leading edge, not the centre, is
    /// compared with the other rows' centres, because a centre rarely reaches the next row's centre exactly
    /// and would drop the row one place short. A `draggedHeight` of 0 compares centres.
    public static func dropIndex(centers: [Double], from: Int, draggedCenter: Double, draggedHeight: Double = 0) -> Int {
        guard centers.indices.contains(from) else { return 0 }
        let half = draggedHeight / 2
        let edge = draggedCenter > centers[from] ? draggedCenter + half
            : draggedCenter < centers[from] ? draggedCenter - half : draggedCenter
        return centers.enumerated().filter { $0.offset != from && $0.element < edge }.count
    }
}

/// What a drag is doing, for the haptics that mark it.
enum ReorderPhase: Equatable {
    case idle
    case lifted(over: Int)

    init(_ drag: ReorderDrag?) { self = drag.map { .lifted(over: $0.over) } ?? .idle }

    static func haptic(from old: ReorderPhase, to new: ReorderPhase) -> MotionHaptic? {
        switch (old, new) {
        case (.idle, .lifted): .lift
        case (.lifted(let before), .lifted(let after)): before == after ? nil : .selection
        case (.lifted, .idle): .drop
        case (.idle, .idle): nil
        }
    }
}

/// A row's measured position in its list's coordinate space.
public struct ReorderRowFrame: Equatable, Sendable {
    public let id: String
    public let frame: CGRect
    public init(id: String, frame: CGRect) { self.id = id; self.frame = frame }
}

private struct ReorderFramesKey: PreferenceKey {
    static let defaultValue: [String: CGRect] = [:]
    static func reduce(value: inout [String: CGRect], nextValue: () -> [String: CGRect]) {
        value.merge(nextValue()) { $1 }
    }
}

private struct ReorderRowModifier: ViewModifier {
    @Environment(\.renderPolicy) private var policy
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let id: String
    let index: Int
    let drag: ReorderDrag?
    let coordinateSpace: String

    func body(content: Content) -> some View {
        let lifted = drag.map { $0.from == index } ?? false
        let shift = drag?.shift(forRowAt: index) ?? 0
        content
            .background {
                GeometryReader { proxy in
                    Color.clear.preference(key: ReorderFramesKey.self, value: [id: proxy.frame(in: .named(coordinateSpace))])
                }
            }
            .offset(y: lifted ? (drag?.translation ?? 0) : shift)
            .zIndex(lifted ? 1 : 0)
            // The dragged row follows the finger without easing; the others slide out of its way.
            .animation(policy.allowsMotion && !reduceMotion ? .motion(.snap) : nil, value: lifted ? 0 : shift)
    }
}

private struct ReorderListModifier: ViewModifier {
    let coordinateSpace: String
    @Binding var frames: [String: CGRect]

    func body(content: Content) -> some View {
        content
            .coordinateSpace(name: coordinateSpace)
            .onPreferenceChange(ReorderFramesKey.self) { frames = $0 }
    }
}

private struct ReorderHandleModifier: ViewModifier {
    @Binding var drag: ReorderDrag?
    @GestureState private var isTracking = false
    let id: String
    let order: [String]
    let frames: [String: CGRect]
    let spacing: Double
    let coordinateSpace: String
    let onBegin: () -> Void
    let onDrop: (_ from: Int, _ to: Int) -> Void

    func body(content: Content) -> some View {
        content
            .gesture(
                DragGesture(minimumDistance: 2, coordinateSpace: .named(coordinateSpace))
                    .updating($isTracking) { _, tracking, _ in tracking = true }
                    .onChanged { value in
                        if drag == nil { begin() }
                        drag?.update(translation: Double(value.translation.height))
                    }
                    .onEnded { _ in
                        guard let finished = drag else { return }
                        drag = nil
                        onDrop(finished.from, finished.over)
                    }
            )
            // The system can cancel a drag (a scroll takes over, a sheet appears) without calling onEnded;
            // the gesture state still resets, and a drag left open would strand its rows out of place.
            .onChange(of: isTracking) { _, tracking in
                if !tracking, drag != nil { drag = nil }
            }
            .motionHaptic(trigger: ReorderPhase(drag)) { ReorderPhase.haptic(from: $0, to: $1) }
    }

    private func begin() {
        guard let from = order.firstIndex(of: id), let height = frames[id]?.height else { return }
        onBegin()
        drag = ReorderDrag(from: from, centers: order.map { Double(frames[$0]?.midY ?? 0) },
                           height: Double(height), spacing: spacing)
    }
}

public extension View {
    /// Marks the container of a reorderable vertical list: it measures each row and names the space the
    /// drag is tracked in. Give every row `.reorderRow`, and one view in each row `.reorderHandle`.
    func reorderList(space: String = "cieo.reorder", frames: Binding<[String: CGRect]>) -> some View {
        modifier(ReorderListModifier(coordinateSpace: space, frames: frames))
    }

    /// Lets a row follow the finger while it is dragged and slide aside while another is, on Cieo's snap
    /// spring (immediate under Reduce Motion or a restricted render policy).
    func reorderRow(id: String, index: Int, drag: ReorderDrag?, space: String = "cieo.reorder") -> some View {
        modifier(ReorderRowModifier(id: id, index: index, drag: drag, coordinateSpace: space))
    }

    /// Drag this view to move its row. Picking up, crossing a neighbour and putting down each play their
    /// haptic. `onDrop` gets the row's first and final index; they are equal when nothing moved.
    func reorderHandle(
        drag: Binding<ReorderDrag?>,
        id: String,
        order: [String],
        frames: [String: CGRect],
        spacing: Double,
        space: String = "cieo.reorder",
        onBegin: @escaping () -> Void = {},
        onDrop: @escaping (_ from: Int, _ to: Int) -> Void
    ) -> some View {
        modifier(ReorderHandleModifier(drag: drag, id: id, order: order, frames: frames, spacing: spacing,
                                       coordinateSpace: space, onBegin: onBegin, onDrop: onDrop))
    }
}
