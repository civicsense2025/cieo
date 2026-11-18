import Cieo
import SwiftUI

/// Bounded parameters for `HighlightSurface`'s decorative sweep and fill opacity.
public struct HighlightConfiguration: Equatable, Sendable {
    public let bandWidth: Double
    public let intensity: Double
    public let opacity: Double

    public init(bandWidth: Double = 0.16, intensity: Double = 0.65, opacity: Double = 0.72) {
        self.bandWidth = bandWidth.isFinite ? min(1.0, max(0.02, bandWidth)) : 0.16
        self.intensity = intensity.isFinite ? min(1.0, max(0.0, intensity)) : 0.65
        self.opacity = opacity.isFinite ? min(1.0, max(0.0, opacity)) : 0.72
    }
}

/// Optional decoration driven by a finite host value. No timer or frame callback is owned here.
public struct HighlightSurface: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentMotion) private var motionConfig
    @Environment(\.renderPolicy) private var policy
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.colorSchemeContrast) private var contrast
    private let progress: Double
    private let configuration: HighlightConfiguration

    public init(progress: Double) {
        self.init(progress: progress, configuration: HighlightConfiguration())
    }

    public init(progress: Double, configuration: HighlightConfiguration) {
        self.progress = RenderPolicy.progress(progress)
        self.configuration = configuration
    }

    public var body: some View {
        Group {
            if policy.allowsShader && !reduceMotion && !reduceTransparency && contrast != .increased {
                surface.colorEffect(
                    ShaderLibrary.bundle(.module).highlightSweep(
                        .boundingRect,
                        .float(Float(progress)),
                        .float(Float(configuration.bandWidth)),
                        .float(Float(configuration.intensity))
                    )
                )
                .motionAnimation(motionConfig.progress, value: progress)
            } else {
                surface
            }
        }
        .accessibilityHidden(true).allowsHitTesting(false)
    }

    private var surface: some View {
        RoundedRectangle(cornerRadius: metrics.corner).fill(theme.accent.opacity(configuration.opacity))
    }
}
