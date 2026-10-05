import SwiftUI
import MotionKit

public struct NavigationMenuAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "navmenu", category: "Navigation", name: "Navigation menu",
        summary: "Moving between triggers keeps one panel open and morphs its position, width and height to the new content. The content slides in from the side you moved toward.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur: Int?
    @State private var geo = CGRect.zero
    @State private var dir: CGFloat = 1
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var closing: Task<Void, Never>?
    private let menus: [(title: String, items: [(String, String)], cols: Int)] = [
        ("Product", [("Editor", "Write and lay out pages"), ("Members", "Paid and free tiers"), ("Commerce", "Sell from any page"), ("Analytics", "Private, cookie-free")], 2),
        ("Resources", [("Docs", "Guides and reference"), ("Templates", "Starting points"), ("Changelog", "What shipped")], 1),
        ("Company", [("About", "Who builds this"), ("Careers", "Two open roles")], 1),
    ]
    public init() {}

    private func size(_ i: Int) -> CGSize {
        let m = menus[i], rows = (m.items.count + m.cols - 1) / m.cols
        return CGSize(width: CGFloat(m.cols) * 190 + CGFloat(m.cols - 1) * 4 + 24, height: CGFloat(rows) * 50 + CGFloat(rows - 1) * 4 + 24)
    }

    public var body: some View {
        AtomStage(hint: "Hover or tap a trigger, then move to the next") {
            GeometryReader { g in
                VStack(spacing: 6) {
                    HStack(spacing: 2) {
                        ForEach(menus.indices, id: \.self) { i in
                            Button { cur == i ? close() : show(i, width: g.size.width) } label: {
                                HStack(spacing: 4) { Text(menus[i].title); Image(systemName: "chevron.down").font(.caption2.weight(.semibold)) }
                                    .font(.callout.weight(.medium)).padding(.horizontal, 12).frame(height: 34)
                                    .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(cur == i ? 0.08 : 0)))
                                    .contentShape(Rectangle()).reportFrame(i, in: "nav")
                            }
                            .buttonStyle(.plain)
                            .onHover { if $0 { show(i, width: g.size.width) } }
                            .accessibilityValue(cur == i ? "Expanded" : "Collapsed")
                        }
                    }
                    .padding(6).frame(maxWidth: .infinity)
                    .basicsPanel()
                    ZStack(alignment: .topLeading) {
                        if let c = cur {
                            ZStack(alignment: .topLeading) {
                                pane(c).id(c).transition(reduce ? .identity : slide)
                            }
                            .frame(width: geo.width, height: geo.height, alignment: .topLeading)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .basicsPanel()
                            .offset(x: geo.minX)
                            .transition(reduce ? .identity : .basicsPop(anchor: .top, rise: 0))
                        }
                    }
                    .frame(maxWidth: .infinity, minHeight: 140, alignment: .topLeading)
                }
                .coordinateSpace(name: "nav")
                .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .onHover { $0 ? closing?.cancel() : scheduleClose() }
            }
            .frame(maxWidth: 520)
        }
    }

    private var slide: AnyTransition {
        .asymmetric(
            insertion: .opacity.combined(with: .offset(x: 20 * dir)).animation(.motion(.base).delay(Motion.exit)),
            removal: .opacity.combined(with: .offset(x: -20 * dir)).animation(.motionExit))
    }

    private func pane(_ i: Int) -> some View {
        LazyVGrid(columns: Array(repeating: GridItem(.fixed(190), spacing: 4), count: menus[i].cols), spacing: 4) {
            ForEach(menus[i].items.indices, id: \.self) { k in
                Button {} label: {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(menus[i].items[k].0).font(.footnote.weight(.semibold))
                        Text(menus[i].items[k].1).font(.footnote).foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 10).frame(height: 50)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(12).frame(width: size(i).width, height: size(i).height, alignment: .topLeading)
    }

    private func show(_ i: Int, width: CGFloat) {
        closing?.cancel()
        guard let f = frames[i] else { return }
        let s = size(i)
        let rect = CGRect(x: min(max(0, f.midX - s.width / 2), max(0, width - s.width)), y: 0, width: s.width, height: s.height)
        if let c = cur {
            guard c != i else { return }
            dir = i > c ? 1 : -1
            withMotion(.base, reduceMotion: reduce) {
                geo = rect
                cur = i
            }
        } else {
            var t = Transaction()
            t.disablesAnimations = true
            withTransaction(t) { geo = rect }
            withMotion(.base, reduceMotion: reduce) { cur = i }
        }
    }

    private func close() { withMotion(.snap, reduceMotion: reduce) { cur = nil } }

    private func scheduleClose() {
        closing?.cancel()
        closing = Task {
            try? await Task.sleep(for: .seconds(0.15))
            guard !Task.isCancelled else { return }
            close()
        }
    }
}
