import Cieo
import SwiftUI

/// Optional decoration driven by a finite host value. No timer or frame callback is owned here.
public struct HighlightSurface: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.renderPolicy) private var policy
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.colorSchemeContrast) private var contrast
    private let progress: Double

    public init(progress: Double) {
        self.progress = RenderPolicy.progress(progress)
    }

    public var body: some View {
        Group {
            if policy.allowsShader && !reduceMotion && !reduceTransparency && contrast != .increased {
                surface.colorEffect(ShaderLibrary.bundle(.module).highlightSweep(.boundingRect, .float(Float(progress))))
                    .animation(.motion(.soft), value: progress)
            } else { surface }
        }
        .accessibilityHidden(true).allowsHitTesting(false)
    }

    private var surface: some View {
        RoundedRectangle(cornerRadius: metrics.corner).fill(theme.accent.opacity(0.72)) // literal-ok: fill strength of the highlight; no theme role is a 72% accent
    }
}
