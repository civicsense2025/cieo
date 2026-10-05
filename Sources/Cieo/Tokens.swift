import Foundation

/// The same motion tokens as tokens/tokens.json: 99% settle times of each spring, in seconds.
public enum MotionTokens {
    public static let durationSnap: Double = 0.2
    public static let durationBase: Double = 0.3
    public static let durationSoft: Double = 0.44
    public static let durationLazy: Double = 0.74
    public static let durationExit: Double = Motion.exit
    public static let lag: Double = Motion.lag
    public static let staggerMax: Double = Motion.staggerMax
    public static let arriveOpacity: Double = Motion.arriveOpacity
    public static let drift: Double = 4
}
