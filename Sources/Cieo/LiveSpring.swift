import Foundation

public enum LiveSpringError: Error, Equatable { case invalidValue, invalidTime, invalidFrequency }
public struct LiveSpringSample: Equatable, Sendable {
    public let value: Double
    public let velocity: Double
    public let moving: Bool
}

// Live controls retain one state instead of accumulating retarget events.
public struct LiveSpring: Sendable {
    public private(set) var target: Double
    private var origin: Double
    private var velocity: Double = 0
    private var epoch: Double
    private var frequency: Double
    private let positionTolerance: Double
    private let velocityTolerance: Double

    public init(_ value: Double, at time: Double, frequency: Double = 22,
                positionTolerance: Double = 0.001, velocityTolerance: Double = 0.001) throws {
        try Self.value(value)
        try Self.time(time, since: 0)
        try Self.frequency(frequency)
        guard positionTolerance.isFinite, velocityTolerance.isFinite,
              (1e-12...1e6).contains(positionTolerance),
              (1e-12...1e6).contains(velocityTolerance) else { throw LiveSpringError.invalidValue }
        target = value
        origin = value
        epoch = time
        self.frequency = frequency
        self.positionTolerance = positionTolerance
        self.velocityTolerance = velocityTolerance
    }

    public func sample(at time: Double) throws -> LiveSpringSample {
        try Self.time(time, since: epoch)
        let dt = time - epoch
        let w = frequency
        let u = w * dt
        if u > 745 { return LiveSpringSample(value: target, velocity: 0, moving: false) }
        let offset = origin - target
        let e = exp(-u)
        let a = velocity + w * offset
        let remaining = e * (offset + a * dt)
        let speed = e * (velocity - w * a * dt)
        let positionEnvelope = e * (1 + u) * (abs(offset) + abs(velocity) / w)
        let velocityEnvelope = w * positionEnvelope + e * abs(velocity)
        let moving = positionEnvelope > positionTolerance || velocityEnvelope > velocityTolerance
        return LiveSpringSample(value: moving ? target + remaining : target,
                                velocity: moving ? speed : 0, moving: moving)
    }

    public mutating func retarget(_ value: Double, at time: Double, frequency: Double? = nil) throws {
        try Self.value(value)
        let nextFrequency = frequency ?? self.frequency
        try Self.frequency(nextFrequency)
        let current = try sample(at: time)
        origin = current.value
        velocity = current.velocity
        target = value
        epoch = time
        self.frequency = nextFrequency
    }

    public mutating func release(from: Double, velocity: Double, to: Double,
                                 at time: Double, frequency: Double? = nil) throws {
        try Self.value(from)
        try Self.value(velocity)
        try Self.value(to)
        try Self.time(time, since: epoch)
        let nextFrequency = frequency ?? self.frequency
        try Self.frequency(nextFrequency)
        origin = from
        self.velocity = velocity
        target = to
        epoch = time
        self.frequency = nextFrequency
    }

    public mutating func jump(_ value: Double, at time: Double) throws {
        try release(from: value, velocity: 0, to: value, at: time)
    }
    private static func value(_ value: Double) throws {
        guard value.isFinite, abs(value) <= 1e12 else { throw LiveSpringError.invalidValue }
    }
    private static func time(_ value: Double, since: Double) throws {
        guard value.isFinite, value >= since, value <= 9_007_199_254_740_991 else {
            throw LiveSpringError.invalidTime
        }
    }
    private static func frequency(_ value: Double) throws {
        guard value.isFinite, (0.001...10_000).contains(value) else { throw LiveSpringError.invalidFrequency }
    }
}
