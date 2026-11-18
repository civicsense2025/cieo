import Cieo
import SwiftUI

/// Root-installable motion policy mapping interaction categories onto `SpringPreset` slots, scale feedback, and playback speed.
public struct ComponentMotionConfiguration: Equatable, Sendable {
    public var press: SpringPreset
    public var selection: SpringPreset
    public var layout: SpringPreset
    public var progress: SpringPreset
    public var ambient: SpringPreset
    public var pressedScale: CGFloat
    public var liftedScale: CGFloat
    /// Multiplier applied to spring animations (`1.0` normal; `0.25` / `0.1` for slow-motion inspection).
    public var speed: Double

    public init(
        press: SpringPreset = .snap,
        selection: SpringPreset = .snap,
        layout: SpringPreset = .base,
        progress: SpringPreset = .soft,
        ambient: SpringPreset = .lazy,
        pressedScale: CGFloat = 0.98,
        liftedScale: CGFloat = 1.02,
        speed: Double = 1.0
    ) {
        self.press = press
        self.selection = selection
        self.layout = layout
        self.progress = progress
        self.ambient = ambient
        self.pressedScale = Self.clampUnit(pressedScale, fallback: 0.98)
        self.liftedScale = liftedScale.isFinite && liftedScale >= 1.0 ? min(1.25, liftedScale) : 1.02
        self.speed = speed.isFinite && speed > 0 ? min(2.0, max(0.05, speed)) : 1.0
    }

    private static func clampUnit(_ value: CGFloat, fallback: CGFloat) -> CGFloat {
        value.isFinite ? min(1, max(0, value)) : fallback
    }
}

/// Controls how `MotionHaptic` responses map onto system sensory feedback across a subtree.
public enum HapticsPolicy: String, CaseIterable, Equatable, Sendable {
    case disabled
    case subtle
    case standard

    public func feedback(for haptic: MotionHaptic) -> SensoryFeedback? {
        switch self {
        case .disabled:
            return nil
        case .subtle:
            switch haptic {
            case .selection: return .selection
            case .lift, .drop: return .impact(weight: .light, intensity: 0.5)
            case .success: return .success
            case .warning: return .warning
            case .error: return .error
            }
        case .standard:
            return haptic.feedback
        }
    }
}

public extension EnvironmentValues {
    @Entry var componentMotion = ComponentMotionConfiguration()
    @Entry var hapticsPolicy = HapticsPolicy.standard
}

public extension View {
    /// Installs semantic spring presets, scale ratios, and animation speed for descendants.
    func componentMotion(_ configuration: ComponentMotionConfiguration) -> some View {
        environment(\.componentMotion, configuration)
    }

    /// Installs the haptics policy (`.disabled`, `.subtle`, `.standard`) for descendants.
    func hapticsPolicy(_ policy: HapticsPolicy) -> some View {
        environment(\.hapticsPolicy, policy)
    }
}
