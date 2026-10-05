import SwiftUI

/// A timeline that ticks at display rate only while a spring is still moving, then stops on one last frame.
/// Unlike `.animation`, an idle view costs nothing. Springs set with `Track.jump` (Reduce Motion) never tick.
public struct MotionSchedule: TimelineSchedule {
    /// When the last spring comes to rest, in seconds since the reference date. Nil means already at rest.
    public let rest: Double?

    public init(rest: Double?) { self.rest = rest }

    public func entries(from start: Date, mode _: TimelineScheduleMode) -> AnySequence<Date> {
        let step = 1.0 / 60
        let end = rest.map { Date(timeIntervalSinceReferenceDate: $0) }
        return AnySequence(sequence(state: Optional(start)) { (next: inout Date?) -> Date? in
            guard let d = next else { return nil }
            if let end, d < end {
                let after = d.addingTimeInterval(step)
                next = after >= end ? end : after
            } else {
                next = nil
            }
            return d
        })
    }
}

/// Something that holds springs: one `Track` or an array of them.
public protocol TrackGroup { var restTime: Double? { get } }
extension Track: TrackGroup {}
extension Array: TrackGroup where Element == Track {
    public var restTime: Double? { compactMap(\.restTime).max() }
}

public extension TimelineSchedule where Self == MotionSchedule {
    /// Ticks until every given track, or array of tracks, has settled.
    static func motion(_ groups: any TrackGroup...) -> MotionSchedule {
        MotionSchedule(rest: groups.compactMap(\.restTime).max())
    }
}
