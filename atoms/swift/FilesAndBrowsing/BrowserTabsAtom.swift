import SwiftUI
import MotionKit

public struct BrowserTabsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tabstrip", category: "Files and browsing", name: "Browser tabs",
        summary: "New tabs open from zero width while their siblings make room; closed tabs fade their label, then collapse. The active surface slides between tabs with lagging edges and the page content swaps.")

    private struct Tab: Identifiable { let id = UUID(); let name: String; var width = 1.0; var label = 1.0 }
    private let names = ["Inbox", "Docs · Spring launch", "Figma · Hero", "Analytics", "Search: yearly pricing", "Calendar"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var tabs: [Tab] = []
    @State private var active: UUID?
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var made = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open, close and switch tabs") {
            VStack(spacing: 0) {
                ZStack(alignment: .topLeading) {
                    if let a = active, let f = frames[a] {
                        EdgesIndicator(frame: f, shape: UnevenRoundedRectangle(topLeadingRadius: 9, topTrailingRadius: 9), style: Color(.sRGB, white: 0.5, opacity: 0.25))
                    }
                    HStack(spacing: 0) {
                        ForEach(tabs) { tab in
                            tabView(tab).frame(width: 150 * tab.width, height: 36).clipped().reportFrame(tab.id, in: "tabs")
                        }
                        Button { add() } label: { Image(systemName: "plus").frame(width: 30, height: 30) }
                            .buttonStyle(.plain).foregroundStyle(.secondary).accessibilityLabel("New tab")
                        Spacer(minLength: 0)
                    }.padding(.horizontal, 6).frame(maxWidth: .infinity, alignment: .leading)
                }
                .coordinateSpace(name: "tabs")
                .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .padding(.top, 6).frame(width: 360, height: 42, alignment: .bottomLeading).clipped()
                .background(.quaternary, in: UnevenRoundedRectangle(topLeadingRadius: 12, topTrailingRadius: 12))
                ZStack(alignment: .topLeading) {
                    if let t = tabs.first(where: { $0.id == active }) {
                        Text(t.name).font(.headline).padding(16).id(t.id).motionTransition(.swap())
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: active)
                .frame(width: 360, height: 90, alignment: .topLeading)
                .background(.quaternary.opacity(0.4), in: UnevenRoundedRectangle(bottomLeadingRadius: 12, bottomTrailingRadius: 12))
            }
        }
        .onAppear { if tabs.isEmpty { for _ in 0..<3 { tabs.append(Tab(name: next())) }; active = tabs[0].id } }
    }

    private func tabView(_ tab: Tab) -> some View {
        HStack(spacing: 0) {
            Text(tab.name).font(.footnote).lineLimit(1).padding(.leading, 12).frame(maxWidth: .infinity, alignment: .leading)
            Button { close(tab.id) } label: { Image(systemName: "xmark").font(.system(size: 9, weight: .bold)).frame(width: 20, height: 20) }
                .buttonStyle(.plain).foregroundStyle(.secondary).padding(.trailing, 6).accessibilityLabel("Close \(tab.name)")
        }
        .opacity(tab.label).contentShape(Rectangle()).onTapGesture { withMotion(.base, reduceMotion: reduce) { active = tab.id } }
        .accessibilityAddTraits(active == tab.id ? .isSelected : [])
    }

    private func next() -> String { defer { made += 1 }; return names[made % names.count] }

    private func add() {
        let tab = Tab(name: next(), width: 0, label: 0)
        tabs.append(tab)
        active = tab.id
        DispatchQueue.main.async {
            withMotion(.base, reduceMotion: reduce) { set(tab.id) { $0.width = 1 } }
            withAnimation(reduce ? nil : .motion(.base).delay(0.06)) { set(tab.id) { $0.label = 1 } }
        }
    }

    private func close(_ id: UUID) {
        guard tabs.filter({ $0.width > 0 }).count > 1 else { return }
        withMotion(.snap, reduceMotion: reduce) { set(id) { $0.label = 0 } }
        if active == id, let other = tabs.last(where: { $0.id != id && $0.width > 0 }) { withMotion(.base, reduceMotion: reduce) { active = other.id } }
        withAnimation(reduce ? nil : .motion(.base).delay(Motion.exit)) { set(id) { $0.width = 0 } }
        Task { try? await Task.sleep(for: .seconds(0.6)); tabs.removeAll { $0.id == id } }
    }

    private func set(_ id: UUID, _ f: (inout Tab) -> Void) {
        if let i = tabs.firstIndex(where: { $0.id == id }) { f(&tabs[i]) }
    }
}
