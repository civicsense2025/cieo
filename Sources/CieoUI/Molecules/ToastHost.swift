import Cieo
import SwiftUI

/// Container hosting visible toast banners from a `ToastQueueModel` with hover/focus pause and velocity-flick dismissal.
public struct ToastHost: View {
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentMotion) private var motionConfig

    @Bindable private var queue: ToastQueueModel
    @FocusState private var isFocused: Bool
    @State private var isHovering = false
    @State private var dismissedCount = 0
    private let onAction: ((ToastQueueModel.Item) -> Void)?

    public init(queue: ToastQueueModel, onAction: ((ToastQueueModel.Item) -> Void)? = nil) {
        self.queue = queue
        self.onAction = onAction
    }

    public var body: some View {
        let visible = queue.visibleItems
        VStack(spacing: metrics.compact) {
            ForEach(visible) { item in
                SwipeableToastRow(
                    item: item,
                    queue: queue,
                    onAction: onAction,
                    onFlickDismiss: { dismissedCount += 1 }
                )
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .frame(maxWidth: .infinity)
        .focused($isFocused)
        .onHover { hovering in
            isHovering = hovering
            syncPauseState()
        }
        .onChange(of: isFocused) { _, _ in
            syncPauseState()
        }
        .task(id: TaskKey(ids: visible.map(\.id), paused: queue.isPaused)) {
            guard !queue.isPaused, let earliest = visible.compactMap(\.deadline).min() else { return }
            let delay = max(0, earliest - ProcessInfo.processInfo.systemUptime)
            try? await Task.sleep(for: .seconds(delay))
            guard !Task.isCancelled else { return }
            queue.tick()
        }
        .motionAnimation(motionConfig.layout, value: visible.map(\.id))
        .motionHaptic(.drop, trigger: dismissedCount)
        .accessibilityElement(children: .contain)
    }

    private func syncPauseState() {
        if isHovering || isFocused {
            queue.pause()
        } else {
            queue.resume()
        }
    }

    private struct TaskKey: Equatable {
        let ids: [UUID]
        let paused: Bool
    }
}

private struct SwipeableToastRow: View {
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentMotion) private var motionConfig

    let item: ToastQueueModel.Item
    let queue: ToastQueueModel
    let onAction: ((ToastQueueModel.Item) -> Void)?
    let onFlickDismiss: () -> Void
    @State private var dragX: CGFloat = 0
    @State private var tracker = VelocityTracker()

    var body: some View {
        ToastBanner(
            item: item,
            onDismiss: { queue.dismiss(id: item.id) },
            onAction: item.actionTitle != nil ? {
                onAction?(item)
                queue.dismiss(id: item.id)
            } : nil
        )
        .offset(x: dragX)
        .gesture(
            DragGesture(minimumDistance: metrics.compact)
                .onChanged { value in
                    dragX = value.translation.width
                    tracker.addSample(
                        CGPoint(x: value.translation.width, y: value.translation.height),
                        at: ProcessInfo.processInfo.systemUptime
                    )
                }
                .onEnded { value in
                    let trackedVx = tracker.velocity().dx
                    let vx = abs(trackedVx) > abs(value.velocity.width) ? trackedVx : value.velocity.width
                    tracker.reset()
                    if queue.dismissIfFlicked(id: item.id, translation: value.translation.width, velocity: vx) {
                        onFlickDismiss()
                    } else {
                        dragX = 0
                    }
                }
        )
        .motionAnimation(motionConfig.press, value: dragX == 0)
    }
}
