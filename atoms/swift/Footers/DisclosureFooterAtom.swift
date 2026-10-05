import SwiftUI
import MotionKit

public struct DisclosureFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fz6-disclosure", category: "Footers", name: "Footer with more links and sticky strip",
        summary: "More links opens a drawer under the toggle: the drawer height springs to its measured content, the chevron turns on the same spring, the three link groups rise 60ms apart, and the page scrolls just far enough to show the bottom of it. The label blur-swaps between More links and Fewer links. The strip stuck to the bottom of the page is one element that morphs between a cookie prompt and a one-line legal bar.")
    public init() {}
    public var body: some View { FootPage(blocks: 1) { DisclosureFooter() } }
}

private struct DrawerHeight: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}

private struct DisclosureFooter: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var more = false
    @State private var accepted = false
    @State private var height: CGFloat = 0
    private let groups: [(String, [String])] = [("Explore", ["Index", "Archive", "Map"]), ("Community", ["Forum", "Events", "Slack"]), ("Policies", ["Privacy", "Terms", "Cookies"])]
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("© 2026 Studio").font(.caption).foregroundStyle(.secondary)
                Spacer()
                Button { withMotion(.soft, reduceMotion: reduce) { more.toggle() } } label: {
                    HStack(spacing: 4) { SwapText(more ? "Fewer links" : "More links").font(.callout); Image(systemName: "chevron.down").rotationEffect(.degrees(more ? 180 : 0)) }
                }.buttonStyle(.plain).accessibilityValue(more ? "expanded" : "collapsed")
            }
            .padding(.vertical, 12).animation(reduce ? nil : .motion(.soft), value: more)
            ZStack(alignment: .topLeading) {
                HStack(alignment: .top, spacing: 18) {
                    ForEach(groups.indices, id: \.self) { g in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(groups[g].0).font(.caption.weight(.semibold))
                            ForEach(groups[g].1, id: \.self) { FootLink(title: $0) }
                        }
                        .opacity(more ? 1 : 0.45).offset(y: more ? 0 : 8)
                        .animation(reduce ? nil : .motion(.base).delay(more ? Double(g) * 0.06 : 0), value: more)
                    }
                    Spacer(minLength: 0)
                }
                .padding(.bottom, 12)
                .fixedSize(horizontal: false, vertical: true)
                .background(GeometryReader { Color.clear.preference(key: DrawerHeight.self, value: $0.size.height) })
            }
            .onPreferenceChange(DrawerHeight.self) { height = $0 }
            .frame(height: more ? height : 0, alignment: .top).clipped()
            .animation(reduce ? nil : .motion(.soft), value: more)
            strip
        }
        .overlay(alignment: .top) { Divider() }
    }

    private var strip: some View {
        ZStack {
            if accepted {
                Text("© 2026 Studio · Privacy · Terms · Cookie settings").font(.caption2).foregroundStyle(.secondary)
                    .transition(.opacity.animation(.motion(.base).delay(Motion.exit)))
            } else {
                HStack {
                    Text("We use cookies to keep the site working.").font(.caption)
                    Spacer()
                    Button("Accept") { withMotion(.soft, reduceMotion: reduce) { accepted = true } }.font(.caption.weight(.semibold))
                }
                .transition(.opacity.animation(.motionExit))
            }
        }
        .padding(.horizontal, 12).frame(maxWidth: .infinity).frame(height: accepted ? 30 : 54)
        .background(.quaternary.opacity(0.6), in: RoundedRectangle(cornerRadius: accepted ? 15 : 10, style: .continuous))
        .animation(reduce ? nil : .motion(.soft), value: accepted)
    }
}
