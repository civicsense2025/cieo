import SwiftUI
import Cieo

struct PhOffsetKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}

/// A short pinned stage driven by a real ScrollView: the scroll view is never hijacked. Its offset becomes a 0...1
/// progress, a soft follower smooths it, and `pinned` draws the scene from that single number.
struct PhScrollStory<Pinned: View>: View {
    var hint = "Scroll inside the frame"
    var length: Double = 3              // scroll distance, in viewport heights
    var height: CGFloat = 240
    @ViewBuilder var pinned: (_ p: Double, _ size: CGSize) -> Pinned
    @State private var raw = 0.0

    var body: some View {
        AtomStage(hint: hint) {
            GeometryReader { g in
                ZStack {
                    ScrollView(showsIndicators: false) {
                        Color.clear.frame(height: g.size.height * (1 + length))
                            .background(GeometryReader { c in
                                Color.clear.preference(key: PhOffsetKey.self, value: -c.frame(in: .named("phscroll")).minY)
                            })
                    }
                    .coordinateSpace(name: "phscroll")
                    .onPreferenceChange(PhOffsetKey.self) { raw = phClamp(Double($0 / (g.size.height * length))) }
                    PhFollow(target: raw, preset: .soft) { p in
                        pinned(p, g.size).frame(width: g.size.width, height: g.size.height)
                    }
                    .allowsHitTesting(false)
                }
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .frame(height: height)
            .accessibilityElement(children: .contain)
        }
    }
}
