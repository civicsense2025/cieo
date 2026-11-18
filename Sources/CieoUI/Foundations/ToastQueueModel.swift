import CoreGraphics
import Foundation
import Observation

/// Bounded priority toast queue with hover/focus deadline freeze and velocity-flick dismissal.
@Observable
@MainActor
public final class ToastQueueModel {
    public enum Priority: Int, Comparable, CaseIterable, Sendable {
        case neutral = 0, info = 1, success = 2, warning = 3, danger = 4
        public static func < (lhs: Priority, rhs: Priority) -> Bool { lhs.rawValue < rhs.rawValue }
    }

    public struct Item: Identifiable, Equatable, Sendable {
        public let id: UUID
        public let title: String
        public let detail: String?
        public let priority: Priority
        public let actionTitle: String?
        public let duration: TimeInterval
        public internal(set) var remaining: TimeInterval
        public internal(set) var deadline: TimeInterval?
        fileprivate let sequence: Int
    }

    public let maxCapacity: Int
    public let maxVisible: Int
    public let dismissVelocityThreshold: CGFloat
    public private(set) var items: [Item] = []
    public private(set) var isPaused: Bool = false
    private var nextSequence = 0

    public init(maxCapacity: Int = 12, maxVisible: Int = 3, dismissVelocityThreshold: CGFloat = 350) {
        self.maxCapacity = max(1, maxCapacity)
        self.maxVisible = max(1, maxVisible)
        self.dismissVelocityThreshold = dismissVelocityThreshold.isFinite ? max(80, dismissVelocityThreshold) : 350
    }

    public var visibleItems: [Item] { Array(items.prefix(maxVisible)) }

    @discardableResult
    public func enqueue(
        id: UUID = UUID(),
        title: String,
        detail: String? = nil,
        priority: Priority = .neutral,
        actionTitle: String? = nil,
        duration: TimeInterval = 4.0,
        now: TimeInterval = ProcessInfo.processInfo.systemUptime
    ) -> UUID {
        let safeDuration = duration.isFinite && duration > 0 ? duration : 4.0
        nextSequence += 1
        let item = Item(
            id: id,
            title: title,
            detail: detail,
            priority: priority,
            actionTitle: actionTitle,
            duration: safeDuration,
            remaining: safeDuration,
            deadline: isPaused ? nil : now + safeDuration,
            sequence: nextSequence
        )
        items.removeAll { $0.id == id }
        items.append(item)
        items.sort { lhs, rhs in
            if lhs.priority != rhs.priority { return lhs.priority > rhs.priority }
            return lhs.sequence < rhs.sequence
        }
        if items.count > maxCapacity {
            items.removeLast(items.count - maxCapacity)
        }
        return id
    }

    public func pause(at now: TimeInterval = ProcessInfo.processInfo.systemUptime) {
        guard !isPaused else { return }
        isPaused = true
        for index in items.indices {
            if let deadline = items[index].deadline {
                items[index].remaining = max(0, deadline - now)
                items[index].deadline = nil
            }
        }
    }

    public func resume(at now: TimeInterval = ProcessInfo.processInfo.systemUptime) {
        guard isPaused else { return }
        isPaused = false
        for index in items.indices {
            items[index].deadline = now + items[index].remaining
        }
    }

    public func tick(at now: TimeInterval = ProcessInfo.processInfo.systemUptime) {
        guard !isPaused else { return }
        items.removeAll { item in
            guard let deadline = item.deadline else { return false }
            return deadline <= now
        }
    }

    public func dismiss(id: UUID) {
        items.removeAll { $0.id == id }
    }

    @discardableResult
    public func dismissIfFlicked(id: UUID, translation: CGFloat, velocity: CGFloat, distanceThreshold: CGFloat = 56) -> Bool {
        let fastEnough = velocity.isFinite && abs(velocity) >= dismissVelocityThreshold
        let farEnough = translation.isFinite && abs(translation) >= distanceThreshold
        guard fastEnough || farEnough else { return false }
        let before = items.count
        dismiss(id: id)
        return items.count != before
    }
}
