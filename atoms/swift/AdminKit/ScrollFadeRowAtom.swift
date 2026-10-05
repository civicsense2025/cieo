import SwiftUI
import Cieo

public struct ScrollFadeRowAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "scrollfade", category: "Admin kit", name: "Scroll-fade row",
        summary: "The row keeps real scroll position, and each frame it asks whether there is content beyond either edge. Only then does that edge’s fade mask grow in, on a spring, and it shrinks away as you reach the end. With four chips nothing overflows, so no mask exists; switch to eleven and the end mask arrives, then the start mask once you scroll. The arrows scroll on the same spring.")

    private let viewW: CGFloat = 300
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var many = false
    @State private var offset: CGFloat = 0
    @State private var contentW: CGFloat = 0
    public init() {}

    private var count: Int { many ? 11 : 4 }
    private var scrollable: Bool { contentW > viewW + 1 }
    private var startFade: CGFloat { scrollable && offset > 0 ? 28 : 0 }
    private var endFade: CGFloat { scrollable && offset + viewW < contentW - 1 ? 28 : 0 }

    public var body: some View {
        AtomStage(hint: "Switch to eleven chips and scroll") {
            VStack(spacing: 14) {
                Picker("Chips", selection: $many) { Text("4 chips").tag(false); Text("11 chips").tag(true) }.pickerStyle(.segmented).labelsHidden().frame(width: 200)
                ScrollViewReader { proxy in
                    HStack(spacing: 6) {
                        Button { jump(proxy, -3) } label: { Image(systemName: "chevron.left") }.buttonStyle(.plain).accessibilityLabel("Scroll left")
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) { ForEach(0..<count, id: \.self) { i in Text("Filter \(i + 1)").font(.footnote).padding(.horizontal, 12).padding(.vertical, 6).background(Capsule().fill(.quaternary)).id(i) } }
                                .background(GeometryReader { g in Color.clear.preference(key: Metrics.self, value: CGPoint(x: -g.frame(in: .named("sf")).minX, y: g.size.width)) })
                        }
                        .coordinateSpace(name: "sf").onPreferenceChange(Metrics.self) { offset = $0.x; contentW = $0.y }
                        .frame(width: viewW)
                        .mask(HStack(spacing: 0) {
                            LinearGradient(colors: [.clear, .black], startPoint: .leading, endPoint: .trailing).frame(width: startFade)
                            Rectangle()
                            LinearGradient(colors: [.black, .clear], startPoint: .leading, endPoint: .trailing).frame(width: endFade)
                        })
                        .animation(reduce ? nil : .motion(.base), value: startFade).animation(reduce ? nil : .motion(.base), value: endFade)
                        Button { jump(proxy, 3) } label: { Image(systemName: "chevron.right") }.buttonStyle(.plain).accessibilityLabel("Scroll right")
                    }
                }
            }
        }
    }

    private func jump(_ proxy: ScrollViewProxy, _ by: Int) {
        let i = min(count - 1, max(0, Int(offset / 90) + by + (by > 0 ? 2 : 0)))
        withMotion(.base, reduceMotion: reduce) { proxy.scrollTo(i, anchor: by > 0 ? .trailing : .leading) }
    }
}

private struct Metrics: PreferenceKey {
    static var defaultValue = CGPoint.zero
    static func reduce(value: inout CGPoint, nextValue: () -> CGPoint) { value = nextValue() }
}
