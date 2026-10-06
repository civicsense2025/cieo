import SwiftUI
import Cieo

public struct TabRestoreAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tabrestore", category: "Views", name: "Tab state restore",
        summary: "Tabs swap with no travel: the old pane leaves, then the new one arrives. Each tab restores its scroll position and stack depth instantly. The indicator stretches leading-edge-first and badges roll down to zero.")

    private let tabs = ["Read", "Saved", "Me"]
    private let rows = [
        ["Water board vote", "Bus route 12", "Library hours", "Clerk packet 2291", "Voter drive shifts", "Budget hearing"],
        ["Consent calendars", "City budgets", "Agenda requests", "Zoning maps"],
        ["Profile", "Notifications", "Reading history", "Membership"]]
    private let depths = [2, 1, 0]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur = 0
    @State private var counts = [3, 1, 0]
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Scroll a tab, switch away, come back") {
            VStack(spacing: 8) {
                VStack(spacing: 0) {
                    ZStack(alignment: .bottomLeading) {
                        EdgesIndicator(frame: CGRect(x: (frames[cur]?.minX ?? 12) + 12, y: 34, width: max(0, (frames[cur]?.width ?? 0) - 24), height: 2), shape: Rectangle(), style: Color.primary)
                        HStack(spacing: 0) {
                            ForEach(tabs.indices, id: \.self) { i in
                                Button { go(i) } label: {
                                    HStack(spacing: 4) {
                                        Text(tabs[i]).font(.footnote.weight(cur == i ? .semibold : .regular))
                                        RollingDigits(counts[i]).font(.caption2.weight(.semibold))
                                    }.frame(maxWidth: .infinity, minHeight: 36)
                                }.buttonStyle(.plain).foregroundStyle(cur == i ? .primary : .secondary)
                                    .reportFrame(i, in: "tr").accessibilityAddTraits(cur == i ? .isSelected : [])
                            }
                        }
                    }
                    .coordinateSpace(name: "tr").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                    Divider()
                    // All panes stay alive so scroll offset and stack depth restore instantly; only visibility toggles.
                    ZStack {
                        ForEach(tabs.indices, id: \.self) { i in
                            ScrollView {
                                LazyVStack(alignment: .leading, spacing: 0) {
                                    ForEach(rows[i], id: \.self) { r in
                                        Text(r).font(.footnote).padding(.vertical, 8)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                        if r != rows[i].last { Divider() }
                                    }
                                }.padding(.horizontal, 14)
                            }
                            .frame(height: 150)
                            .opacity(i == cur ? 1 : 0)
                            .allowsHitTesting(i == cur)
                            .animation(nil, value: cur)
                        }
                    }
                    Text("\(tabs[cur]) · \(depths[cur]) deep · scroll restores").font(.caption).foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading).padding(10)
                }
                .frame(width: 340)
                .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12)).clipShape(RoundedRectangle(cornerRadius: 12))
                HStack(spacing: 8) {
                    Button("Simulate alert") { ping() }.buttonStyle(.bordered).controlSize(.small)
                    Text("switching a tab clears its badge").font(.caption).foregroundStyle(.secondary)
                }
            }
        }
    }

    private func go(_ i: Int) {
        guard i != cur else { return }
        withMotion(.base, reduceMotion: reduce) {
            cur = i
            counts[i] = 0
        }
    }

    private func ping() {
        var i = (cur + 1) % tabs.count
        if i == cur { i = (i + 1) % tabs.count }
        withMotion(.base, reduceMotion: reduce) { counts[i] += 1 }
    }
}
