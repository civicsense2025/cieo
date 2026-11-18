import CoreGraphics
import Foundation

/// Four-phase disclosure that keeps its direction when reversed mid-flight, so a close during an open settles from where it is.
public enum DisclosurePhase: Equatable, Sendable {
    case closed, opening, open, closing

    public var isOpen: Bool { self == .open || self == .opening }
}

public enum DisclosureEvent: Equatable, Sendable {
    case open, opened, close, closed, toggle
}

public struct DisclosureState: Equatable, Sendable {
    public private(set) var phase: DisclosurePhase

    public init(startsOpen: Bool = false) {
        phase = startsOpen ? .open : .closed
    }

    @discardableResult
    public mutating func send(_ event: DisclosureEvent) -> TransitionEnvelope<DisclosurePhase, DisclosureEvent> {
        let prev = phase
        var next = prev
        var direction = 0
        var haptic: MotionHaptic?
        switch event {
        case .open where prev == .closed || prev == .closing:
            next = .opening; direction = 1; haptic = .selection
        case .opened where prev == .opening:
            next = .open; direction = 1
        case .close where prev == .open || prev == .opening:
            next = .closing; direction = -1
        case .closed where prev == .closing:
            next = .closed; direction = -1
        case .toggle:
            next = prev.isOpen ? .closing : .opening
            direction = prev.isOpen ? -1 : 1
            haptic = prev.isOpen ? nil : .selection
        default:
            return TransitionEnvelope(prev: prev, next: prev, event: event)
        }
        phase = next
        return TransitionEnvelope(prev: prev, next: next, event: event, direction: direction, haptic: haptic)
    }
}

public enum FieldValidationStatus: Equatable, Sendable {
    case idle, valid, invalid
}

public enum FieldValidationEvent: Equatable, Sendable {
    case input(String)
    case blur
    case reset
}

/// Reward early, punish late: a fix is acknowledged as it is typed, but an error only appears once the person leaves the field.
public struct FieldValidationState: Equatable, Sendable {
    public private(set) var status: FieldValidationStatus = .idle
    public private(set) var value = ""
    /// Kept after the field turns valid so the error can fade out instead of vanishing mid-sentence.
    public private(set) var message = ""
    public private(set) var showsMessage = false

    public init() {}

    @discardableResult
    public mutating func send(
        _ event: FieldValidationEvent,
        validate: (String) -> String?
    ) -> TransitionEnvelope<FieldValidationStatus, FieldValidationEvent> {
        let before = self
        var direction = 0
        var haptic: MotionHaptic?
        switch event {
        case .input(let text):
            let valid = validate(text) == nil
            value = text
            switch status {
            case .invalid where valid, .idle where valid && !text.isEmpty:
                status = .valid; showsMessage = false; direction = 1; haptic = .success
            case .valid where !valid:
                status = .idle; showsMessage = false; direction = -1
            default: break
            }
        case .blur:
            if let error = validate(value) {
                guard !(status == .invalid && message == error && showsMessage) else { break }
                status = .invalid; message = error; showsMessage = true; direction = -1; haptic = .error
            } else if status != .valid, !value.isEmpty {
                status = .valid; showsMessage = false; direction = 1
            }
        case .reset:
            self = FieldValidationState()
        }
        return TransitionEnvelope(
            prev: before.status, next: status, event: event,
            direction: self == before ? 0 : direction, haptic: haptic,
            announcement: status == .invalid && before.status != .invalid ? message : nil
        )
    }
}

public enum SelectionEvent<Item: Hashable & Sendable>: Equatable, Sendable {
    case select(Item), toggle(Item), focus(Int), moveFocus(Int, select: Bool), home(select: Bool), end(select: Bool), clear
}

/// Single or multiple selection with a roving focus index; `direction` is the sign of the index change, so indicators know which way to travel.
public struct SelectionState<Item: Hashable & Sendable>: Equatable, Sendable {
    public private(set) var items: [Item]
    public private(set) var selected: [Item]
    public private(set) var focusedIndex: Int
    public let allowsMultiple: Bool
    public let loops: Bool

    public var value: Item? { selected.first }

    public init(items: [Item], selected: [Item] = [], allowsMultiple: Bool = false, loops: Bool = true) {
        let kept = selected.filter(items.contains)
        self.items = items
        self.allowsMultiple = allowsMultiple
        self.loops = loops
        self.selected = allowsMultiple ? kept : Array(kept.prefix(1))
        focusedIndex = kept.first.flatMap(items.firstIndex(of:)) ?? (items.isEmpty ? -1 : 0)
    }

    @discardableResult
    public mutating func send(_ event: SelectionEvent<Item>) -> TransitionEnvelope<[Item], SelectionEvent<Item>> {
        let before = self
        switch event {
        case .select(let item):
            guard let index = items.firstIndex(of: item) else { break }
            if allowsMultiple { if !selected.contains(item) { selected.append(item) } } else { selected = [item] }
            focusedIndex = index
        case .toggle(let item):
            guard let index = items.firstIndex(of: item) else { break }
            if selected.contains(item) { selected.removeAll { $0 == item } } else if allowsMultiple { selected.append(item) } else { selected = [item] }
            focusedIndex = index
        case .focus(let index):
            guard !items.isEmpty else { break }
            focusedIndex = min(items.count - 1, max(0, index))
        case .moveFocus(let delta, let select):
            move(to: focusedIndex < 0 ? (delta > 0 ? 0 : items.count - 1) : wrapped(focusedIndex + delta), select: select)
        case .home(let select): move(to: 0, select: select)
        case .end(let select): move(to: items.count - 1, select: select)
        case .clear:
            selected = []
        }
        let direction = before.focusedIndex < 0 || focusedIndex < 0 ? 0 : (focusedIndex - before.focusedIndex).signum()
        return TransitionEnvelope(prev: before.selected, next: selected, event: event, direction: direction, haptic: selected == before.selected ? nil : .selection)
    }

    private func wrapped(_ raw: Int) -> Int {
        raw < 0 ? (loops ? items.count - 1 : 0) : raw >= items.count ? (loops ? 0 : items.count - 1) : raw
    }

    private mutating func move(to index: Int, select: Bool) {
        guard !items.isEmpty, items.indices.contains(index) else { return }
        focusedIndex = index
        if select, !allowsMultiple { selected = [items[index]] }
    }
}
