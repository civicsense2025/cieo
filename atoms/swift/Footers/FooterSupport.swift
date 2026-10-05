import SwiftUI
import MotionKit

struct FootBackToTopKey: EnvironmentKey { static let defaultValue: () -> Void = {} }
struct FootVisibleKey: EnvironmentKey { static let defaultValue = true }
extension EnvironmentValues {
    var footBackToTop: () -> Void { get { self[FootBackToTopKey.self] } set { self[FootBackToTopKey.self] = newValue } }
    var footProgress: Double { get { self[FootProgressKey.self] } set { self[FootProgressKey.self] = newValue } }
    var footVisible: Bool { get { self[FootVisibleKey.self] } set { self[FootVisibleKey.self] = newValue } }
}

struct FootProgressKey: EnvironmentKey { static let defaultValue = 1.0 }
struct FootTopKey: PreferenceKey {
    static let defaultValue: CGFloat = .infinity
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}

/// A short stand-in page with the footer at the bottom. Provides `footVisible` (the footer has scrolled into view) and `footBackToTop`.
struct FootPage<Footer: View>: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    var blocks = 3
    var hint: String? = "Scroll to the footer"
    @ViewBuilder var footer: Footer
    @State private var visible = false
    @State private var progress = 0.0
    var body: some View {
        AtomStage(hint: hint) {
            GeometryReader { geo in
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(spacing: 10) {
                            ForEach(0..<blocks, id: \.self) { _ in RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(height: 90) }.accessibilityHidden(true)
                            footer
                                .environment(\.footVisible, visible)
                                .environment(\.footProgress, progress)
                                .background(GeometryReader { g in Color.clear.preference(key: FootTopKey.self, value: g.frame(in: .named("footpage")).minY) })
                        }
                        .id("top")
                    }
                    .coordinateSpace(name: "footpage")
                    .onPreferenceChange(FootTopKey.self) { y in
                        let v = y < geo.size.height - 40
                        if v != visible { visible = v }
                        progress = min(1, max(0, (geo.size.height - y) / 240))
                    }
                    .environment(\.footBackToTop) { withAnimation(reduce ? nil : .motion(.soft)) { proxy.scrollTo("top", anchor: .top) } }
                }
            }
            .frame(minHeight: 230)
        }
    }
}

/// Fades up 10 pt when the footer enters view, `index` steps of `gap` after the first. Leaving view resets it.
struct FootRise: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Environment(\.footVisible) private var visible
    let index: Int
    var gap = 0.045
    func body(content: Content) -> some View {
        content.opacity(visible ? 1 : 0).offset(y: visible ? 0 : 10)
            .animation(reduce ? nil : .motion(.base).delay(visible ? Double(index) * gap : 0), value: visible)
    }
}
extension View { func footRise(_ index: Int, gap: Double = 0.045) -> some View { modifier(FootRise(index: index, gap: gap)) } }

/// Text link whose underline draws left to right on hover and wipes out toward the right on leave.
struct FootLink: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let title: String
    var action: () -> Void = {}
    @State private var lo: CGFloat = 0
    @State private var hi: CGFloat = 0
    @State private var hovering = false
    var body: some View {
        Button(action: action) {
            Text(title).font(.callout).foregroundStyle(hovering ? .primary : .secondary)
                .overlay(alignment: .bottomLeading) {
                    GeometryReader { g in
                        Rectangle().frame(width: g.size.width * (hi - lo), height: 1).offset(x: g.size.width * lo)
                    }.frame(height: 1).offset(y: 2)
                }
        }
        .buttonStyle(.plain)
        .onHover { inside in
            hovering = inside
            if inside {
                var t = Transaction(); t.disablesAnimations = true
                withTransaction(t) { lo = 0; hi = 0 }
                withAnimation(reduce ? nil : .motion(.snap)) { hi = 1 }
            } else {
                withAnimation(reduce ? nil : .motion(.snap)) { lo = hi }
            }
        }
        .animation(reduce ? nil : .motion(.snap), value: hovering)
    }
}
