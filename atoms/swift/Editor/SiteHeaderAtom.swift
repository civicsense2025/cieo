import SwiftUI
import MotionKit

public struct SiteHeaderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "siteheader", category: "Editor", name: "Site header",
        summary: "Scroll the page: the progress bar tracks the scroll position one to one, and once you pass 16px the header compacts, with its height, logo scale and shadow all moving on one spring. Hovering a link slides a plate between links with lagging edges. The search button widens into a field, folding the nav (or the logo, when narrow) out of its way. Narrow: the menu button morphs into a cross and the panel opens below the header, then each link enters 40ms after the last.")

    private let links = ["Stories", "Method", "Members", "About"]
    private let page: CGFloat = 640, view: CGFloat = 250
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var scroll: CGFloat = 0
    @State private var hover: Int?
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var searching = false
    @State private var query = ""
    public init() {}

    private var compact: Bool { scroll > 16 }

    public var body: some View {
        AtomStage(hint: "Scroll the page, hover the links") {
            ZStack(alignment: .top) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(0..<6, id: \.self) { i in
                            VStack(alignment: .leading, spacing: 4) { Text("Section \(i + 1)").font(.headline); Text("A short paragraph of page copy that gives the header something to scroll over.").font(.footnote).foregroundStyle(.secondary) }
                        }
                    }
                    .padding(.horizontal, 16).padding(.top, 76).frame(width: 420, height: page, alignment: .topLeading)
                    .background(GeometryReader { g in Color.clear.preference(key: ScrollKey.self, value: -g.frame(in: .named("sh")).minY) })
                }
                .coordinateSpace(name: "sh").onPreferenceChange(ScrollKey.self) { scroll = max(0, $0) }
                header
            }
            .frame(width: 420, height: view).background(.quaternary.opacity(0.3)).clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }

    private var header: some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                if !searching { Text("Harbor").font(.headline).scaleEffect(compact ? 0.85 : 1, anchor: .leading).transition(.opacity) }
                if !searching {
                    ZStack(alignment: .topLeading) {
                        if let h = hover, let f = frames[h] { EdgesIndicator(frame: f, shape: Capsule(), style: Color.secondary.opacity(0.2)) }
                        HStack(spacing: 0) { ForEach(links.indices, id: \.self) { i in
                            Text(links[i]).font(.footnote.weight(.medium)).padding(.horizontal, 10).padding(.vertical, 5).reportFrame(i, in: "nav")
                                .onHover { hover = $0 ? i : (hover == i ? nil : hover) }
                        } }
                    }
                    .coordinateSpace(name: "nav").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }.transition(.opacity)
                }
                Spacer(minLength: 0)
                HStack(spacing: 6) {
                    Button { withMotion(.base, reduceMotion: reduce) { searching.toggle(); query = "" } } label: { Image(systemName: searching ? "xmark" : "magnifyingglass").frame(width: 20, height: 20) }
                        .buttonStyle(.plain).accessibilityLabel(searching ? "Close search" : "Search")
                    if searching { TextField("Search", text: $query).textFieldStyle(.plain).font(.footnote).transition(.opacity) }
                }
                .padding(.horizontal, 8).frame(width: searching ? 330 : 36, height: 30).background(Capsule().fill(.quaternary))
            }
            .padding(.horizontal, 16).frame(height: compact ? 44 : 64).background(.background)
            GeometryReader { g in Rectangle().fill(Color.accentColor).frame(width: g.size.width * min(1, scroll / (page - view))) }.frame(height: 2)
        }
        .shadow(color: .black.opacity(compact ? 0.12 : 0), radius: 6, y: 2)
        .animation(reduce ? nil : .motion(.base), value: compact).animation(reduce ? nil : .motion(.base), value: searching)
    }
}

private struct ScrollKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}
