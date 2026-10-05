import SwiftUI
import MotionKit

/// Heights reported by `basicsReportHeight`, keyed by an id the caller picks.
struct BasicsHeightKey: PreferenceKey {
    static let defaultValue: [Int: CGFloat] = [:]
    static func reduce(value: inout [Int: CGFloat], nextValue: () -> [Int: CGFloat]) {
        value.merge(nextValue()) { $1 }
    }
}

extension View {
    /// Publishes this view's height under `id` so a container can spring to it.
    func basicsReportHeight(_ id: Int) -> some View {
        background(GeometryReader { Color.clear.preference(key: BasicsHeightKey.self, value: [id: $0.size.height]) })
    }
}

/// Blur that animates with the transition it is part of.
struct BasicsBlur: ViewModifier, Animatable {
    var radius: CGFloat
    var animatableData: CGFloat {
        get { radius }
        set { radius = newValue }
    }
    func body(content: Content) -> some View { content.blur(radius: radius) }
}

extension AnyTransition {
    /// The motion swap with the 4 pt blur the web atoms use: old content leaves in 100 ms, then the new one rises in on base.
    static func basicsSwap(drift: CGFloat = 4) -> AnyTransition {
        .asymmetric(
            insertion: .modifier(active: BasicsBlur(radius: 4), identity: BasicsBlur(radius: 0))
                .combined(with: .opacity).combined(with: .offset(y: drift))
                .animation(.motion(.base).delay(Motion.exit)),
            removal: .modifier(active: BasicsBlur(radius: 4), identity: BasicsBlur(radius: 0))
                .combined(with: .opacity).combined(with: .offset(y: -drift))
                .animation(.motionExit)
        )
    }
}

/// Clips its content to a height that follows `open`; the caller animates `open` with a motion spring.
struct BasicsHeightReveal<Content: View>: View {
    let open: Bool
    @ViewBuilder let content: Content
    @State private var measured: CGFloat?

    var body: some View {
        content
            .fixedSize(horizontal: false, vertical: true)
            .basicsReportHeight(0)
            .frame(height: open ? measured : 0, alignment: .top)
            .clipped()
            .onPreferenceChange(BasicsHeightKey.self) { measured = $0[0] }
            .accessibilityHidden(!open)
    }
}
