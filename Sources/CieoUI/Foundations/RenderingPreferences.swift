import SwiftUI

private struct RenderingPreferences: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.colorSchemeContrast) private var contrast
    @Environment(\.scenePhase) private var phase
    @State private var lowPower = ProcessInfo.processInfo.isLowPowerModeEnabled
    let effectsEnabled: Bool

    func body(content: Content) -> some View {
        content.environment(\.renderPolicy, RenderPolicy(
            effectsEnabled: effectsEnabled, reduceMotion: reduceMotion,
            reduceTransparency: reduceTransparency, increasedContrast: contrast == .increased,
            lowPower: lowPower, active: phase == .active
        ))
        .onReceive(NotificationCenter.default.publisher(for: .NSProcessInfoPowerStateDidChange)) { _ in
            lowPower = ProcessInfo.processInfo.isLowPowerModeEnabled
        }
    }
}

public extension View {
    /// Install once at the host root. Graphics are opt-in; constraints follow the OS live.
    func renderingPreferences(effectsEnabled: Bool = false) -> some View {
        modifier(RenderingPreferences(effectsEnabled: effectsEnabled))
    }
}
