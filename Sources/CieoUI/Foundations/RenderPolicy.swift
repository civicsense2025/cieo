import Foundation

/// A small value contract lets hosts and tests describe real rendering constraints.
public struct RenderPolicy: Equatable, Sendable {
    public let allowsMotion: Bool
    public let allowsShader: Bool

    public init(effectsEnabled: Bool = false, reduceMotion: Bool = false, motionDisabled: Bool = false,
                reduceTransparency: Bool = false, increasedContrast: Bool = false,
                lowPower: Bool = false, active: Bool = true)
    {
        allowsMotion = active && !reduceMotion && !motionDisabled && !lowPower
        allowsShader = effectsEnabled && allowsMotion && !reduceTransparency && !increasedContrast
    }

    /// Sanitize external/progress values before they reach the graphics pipeline.
    public static func progress(_ value: Double) -> Double {
        value.isFinite ? min(1, max(0, value)) : 0
    }
}
