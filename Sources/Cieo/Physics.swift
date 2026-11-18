import CoreGraphics
import Foundation

/// Gesture release projection, rubber-band boundary resistance, and detent snapping math.
public enum MotionPhysics {
    /// Apple-style asymptotic rubber-band resistance for overshooting a boundary of size `dimension`.
    /// Near zero overshoot the slope equals `resistance`; asymptotically bounded within `(-dimension, dimension)`.
    public static func rubberBand(overshoot: Double, dimension: Double, resistance: Double = 0.55) -> Double {
        guard overshoot.isFinite, dimension.isFinite, dimension > 0 else { return 0 }
        let c = resistance.isFinite ? max(0, resistance) : 0.55
        guard overshoot != 0, c > 0 else { return 0 }
        let distance = abs(overshoot)
        let banded = (1.0 - (1.0 / (((distance * c) / dimension) + 1.0))) * dimension
        return overshoot < 0 ? -banded : banded
    }

    @_disfavoredOverload
    public static func rubberBand(overshoot: CGFloat, dimension: CGFloat, resistance: CGFloat = 0.55) -> CGFloat {
        CGFloat(rubberBand(overshoot: Double(overshoot), dimension: Double(dimension), resistance: Double(resistance)))
    }

    /// Projects resting position from `value` and release `velocity` (points/s) under per-millisecond `decelerationRate`.
    /// Typical rates: `0.998` (normal scroll inertia) and `0.990` (fast sheet/card deceleration).
    public static func projectMomentum(value: Double, velocity: Double, decelerationRate: Double = 0.998) -> Double {
        guard value.isFinite else { return 0 }
        guard velocity.isFinite, velocity != 0 else { return value }
        let rate = decelerationRate.isFinite ? min(0.9999, max(0.001, decelerationRate)) : 0.998
        let travel = (velocity / 1000.0) * rate / (1.0 - rate)
        return value + travel
    }

    @_disfavoredOverload
    public static func projectMomentum(value: CGFloat, velocity: CGFloat, decelerationRate: CGFloat = 0.998) -> CGFloat {
        CGFloat(projectMomentum(value: Double(value), velocity: Double(velocity), decelerationRate: Double(decelerationRate)))
    }

    /// Projects `value` and release `velocity` onto the best detent in `detents`.
    /// When `abs(velocity) >= velocityThreshold`, flicks advance at least one detent in the velocity direction
    /// (unless already at or beyond the terminal detent) and can skip multiple detents on stronger throws.
    public static func projectToDetent(
        value: Double,
        velocity: Double,
        detents: [Double],
        velocityThreshold: Double = 450
    ) -> Double {
        let base = value.isFinite ? value : 0
        let sorted = Array(Set(detents.filter(\.isFinite))).sorted()
        guard !sorted.isEmpty else { return base }
        let v = velocity.isFinite ? velocity : 0
        let threshold = velocityThreshold.isFinite ? max(0, velocityThreshold) : 450

        if abs(v) >= threshold {
            let candidates = v > 0 ? sorted.filter { $0 > base } : sorted.filter { $0 < base }
            guard !candidates.isEmpty else {
                return v > 0 ? sorted[sorted.count - 1] : sorted[0]
            }
            let projected = projectMomentum(value: base, velocity: v, decelerationRate: 0.998)
            return nearest(to: projected, in: candidates)
        }

        let projected = projectMomentum(value: base, velocity: v, decelerationRate: 0.990)
        return nearest(to: projected, in: sorted)
    }

    @_disfavoredOverload
    public static func projectToDetent(
        value: CGFloat,
        velocity: CGFloat,
        detents: [CGFloat],
        velocityThreshold: CGFloat = 450
    ) -> CGFloat {
        CGFloat(
            projectToDetent(
                value: Double(value),
                velocity: Double(velocity),
                detents: detents.map(Double.init),
                velocityThreshold: Double(velocityThreshold)
            )
        )
    }

    private static func nearest(to target: Double, in candidates: [Double]) -> Double {
        var best = candidates[0]
        var bestDistance = abs(candidates[0] - target)
        for candidate in candidates.dropFirst() {
            let dist = abs(candidate - target)
            if dist < bestDistance {
                best = candidate
                bestDistance = dist
            }
        }
        return best
    }
}

/// Bounded sliding-window pointer sample tracker computing release velocity `(vx, vy)` in points/second.
public struct VelocityTracker: Sendable, Equatable {
    private struct Sample: Sendable, Equatable {
        let point: CGPoint
        let time: TimeInterval
    }

    public let window: TimeInterval
    public let maxSamples: Int
    private var samples: [Sample] = []

    public init(window: TimeInterval = 0.1, maxSamples: Int = 20) {
        self.window = window.isFinite && window > 0 ? window : 0.1
        self.maxSamples = max(2, maxSamples)
    }

    public mutating func addSample(_ point: CGPoint, at time: TimeInterval) {
        guard point.x.isFinite, point.y.isFinite, time.isFinite else { return }
        if let last = samples.last, time < last.time {
            samples = [Sample(point: point, time: time)]
            return
        }
        samples.append(Sample(point: point, time: time))
        let cutoff = time - window
        samples.removeAll { $0.time < cutoff }
        if samples.count > maxSamples {
            samples.removeFirst(samples.count - maxSamples)
        }
    }

    public mutating func reset() {
        samples.removeAll(keepingCapacity: true)
    }

    /// Computes `(dx, dy)` velocity over the active sample window relative to the latest recorded timestamp.
    public func velocity() -> CGVector {
        guard let latest = samples.last else { return .zero }
        return velocity(at: latest.time)
    }

    /// Computes `(dx, dy)` velocity at `releaseTime`, returning `.zero` if the pointer paused beyond `window`.
    public func velocity(at releaseTime: TimeInterval) -> CGVector {
        guard releaseTime.isFinite else { return .zero }
        let cutoff = releaseTime - window
        let recent = samples.filter { $0.time >= cutoff && $0.time <= releaseTime }
        guard recent.count >= 2, let first = recent.first, let last = recent.last else { return .zero }
        let dt = last.time - first.time
        guard dt >= 1e-4 else { return .zero }
        return CGVector(
            dx: (last.point.x - first.point.x) / dt,
            dy: (last.point.y - first.point.y) / dt
        )
    }

    /// Convenience tuple `(vx, vy)` matching the current window's release velocity.
    public var releaseVelocity: (vx: Double, vy: Double) {
        let v = velocity()
        return (Double(v.dx), Double(v.dy))
    }
}
