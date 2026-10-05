import SwiftUI
import MotionKit

/// Shared by the Data atoms: a wall clock for `Track`, and a retarget that respects Reduce Motion.
enum DataMotion {
    static var now: Double { Date.timeIntervalSinceReferenceDate }

    /// Retargets `track` after `delay` seconds, or jumps straight there under Reduce Motion.
    static func retarget(_ track: inout Track, to value: Double, preset: SpringPreset? = nil, delay: Double = 0, reduce: Bool) {
        if reduce { track.jump(value) } else { track.set(value, preset: preset, at: now + delay) }
    }
}

extension DataMotion {
    /// Resistance past an edge: 1:1 near zero, never more than `limit` in total.
    static func rubber(_ d: Double, limit: Double = 60) -> Double {
        (d < 0 ? -1 : 1) * limit * (1 - exp(-abs(d) / limit))
    }
}

/// Smoothed pointer velocity (points per second) from drag samples, for `Track.release`.
struct DataVelocity {
    private var lastX = 0.0, lastT = 0.0, primed = false
    private(set) var v = 0.0
    mutating func reset() { primed = false; v = 0 }
    mutating func add(_ x: Double, at t: Double) {
        if primed, t > lastT { v = v * 0.6 + (x - lastX) / (t - lastT) * 0.4 }
        lastX = x; lastT = t; primed = true
    }
}
