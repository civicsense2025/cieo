import Foundation

/// A critically damped spring. `w` is the natural frequency in rad/s; nothing overshoots.
public struct SpringPreset: Hashable, Sendable {
    public let w: Double
    public init(w: Double) { self.w = w }

    /// Presses, checks, knobs, chevrons, exits.
    public static let snap = SpringPreset(w: 34)
    /// Indicators, swaps, overlays entering, list reflow.
    public static let base = SpringPreset(w: 22)
    /// Progress, size morphs, scrolling, long travel.
    public static let soft = SpringPreset(w: 15)
    /// Ambient and decorative motion only.
    public static let lazy = SpringPreset(w: 9)

    /// Seconds until a unit step is within `epsilon` of its target.
    public func settleTime(epsilon: Double = 1e-3) -> Double {
        var lo = 0.0, hi = 60 / w
        for _ in 0..<50 {
            let mid = (lo + hi) / 2
            if Motion.resp(mid, x0: 1, v0: 0, self) > epsilon { lo = mid } else { hi = mid }
        }
        return hi
    }
}

public enum Motion {
    /// Old content leaves in this long before new content enters.
    public static let exit: Double = 0.1
    /// The trailing edge of a sliding indicator follows the leading edge this much later.
    public static let lag: Double = 0.06
    /// Total stagger across a group never exceeds this.
    public static let staggerMax: Double = 0.3
    /// New list items arrive from this opacity, never from 0.
    public static let arriveOpacity: Double = 0.45

    /// Offset left after `dt` seconds for a spring released at offset `x0` with velocity `v0`.
    public static func resp(_ dt: Double, x0: Double, v0: Double, _ p: SpringPreset) -> Double {
        dt <= 0 ? x0 : exp(-p.w * dt) * (x0 + (v0 + p.w * x0) * dt)
    }

    /// Velocity of the same spring after `dt` seconds.
    public static func vel(_ dt: Double, x0: Double, v0: Double, _ p: SpringPreset) -> Double {
        dt <= 0 ? v0 : exp(-p.w * dt) * (v0 - p.w * (v0 + p.w * x0) * dt)
    }

    /// Per-item delay for `count` items so the whole group fits in `staggerMax`.
    public static func stagger(_ index: Int, of count: Int, gap: Double = 0.04) -> Double {
        Double(index) * min(gap, staggerMax / Double(max(1, count - 1)))
    }
}

/// A value that retargets as a sum of springs, so interrupting a motion never jumps. Pure function of time.
public struct Track: Sendable {
    private struct Event: Sendable { var t: Double; var x0: Double; var v0: Double; var p: SpringPreset }
    public private(set) var target: Double
    public var preset: SpringPreset
    private var events: [Event] = []

    public init(_ value: Double, preset: SpringPreset = .base) {
        target = value
        self.preset = preset
    }

    public mutating func set(_ to: Double, preset p: SpringPreset? = nil, at t: Double) {
        guard to != target else { return }
        events.append(Event(t: t, x0: target - to, v0: 0, p: p ?? preset))
        target = to
        if events.count > 12 { prune(at: t) }
    }

    public mutating func release(from: Double, velocity v0: Double, to: Double, preset p: SpringPreset? = nil, at t: Double) {
        events = [Event(t: t, x0: from - to, v0: v0, p: p ?? preset)]
        target = to
    }

    public mutating func jump(_ v: Double) {
        events = []
        target = v
    }

    public func value(at t: Double) -> Double {
        events.reduce(target) { $0 + Motion.resp(t - $1.t, x0: $1.x0, v0: $1.v0, $1.p) }
    }

    public func velocity(at t: Double) -> Double {
        events.reduce(0) { $0 + Motion.vel(t - $1.t, x0: $1.x0, v0: $1.v0, $1.p) }
    }

    @discardableResult
    public mutating func prune(at t: Double) -> Int {
        events.removeAll { e in
            let dt = t - e.t
            return dt >= 0 && exp(-e.p.w * dt) * (1 + e.p.w * dt) * (abs(e.x0) + abs(e.v0) / e.p.w) <= 1e-3
        }
        return events.count
    }

    public var isMoving: Bool { !events.isEmpty }
}
