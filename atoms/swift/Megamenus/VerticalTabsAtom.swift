import SwiftUI
import MotionKit

public struct VerticalTabsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-tabs", category: "Mega menus", name: "Vertical tabs, hover to swap",
        summary: "Hovering a row on the left waits 70 ms so a quick pass across the list changes nothing. The selection plate then moves with lagging edges, leading edge first, and the right pane swaps: old content out in 100 ms, new content in from the direction of travel. Arrow keys follow the same path. At phone width each category becomes a nested accordion.")
    public init() {}
    public var body: some View {
        MegaShell(items: ["Platform", "Company"], hint: "Hover a category, or use the arrow keys") { i in
            TabsPanel(cats: i == 0
                ? [("Data", ["Tables", "Pipelines", "Exports"]), ("Auth", ["Single sign-on", "Roles", "Audit log"]), ("Edge", ["Functions", "Caching", "Regions"])]
                : [("About", ["Story", "Values", "Press"]), ("Careers", ["Open roles", "Benefits", "Teams"]), ("Contact", ["Sales", "Support", "Offices"])])
        }
    }
}

private struct TabsPanel: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let cats: [(String, [String])]
    @State private var sel = 0
    @State private var dir: CGFloat = 1
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var task: Task<Void, Never>?

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            VStack(spacing: 2) {
                ForEach(cats.indices, id: \.self) { i in
                    Text(cats[i].0).font(.callout.weight(.medium))
                        .frame(maxWidth: .infinity, alignment: .leading).padding(8)
                        .contentShape(Rectangle())
                        .reportFrame(i, in: "tabs")
                        .onHover { inside in
                            task?.cancel()
                            guard inside, i != sel else { return }
                            task = Task {
                                try? await Task.sleep(for: .milliseconds(70))
                                guard !Task.isCancelled else { return }
                                choose(i)
                            }
                        }
                        .accessibilityAddTraits(i == sel ? [.isButton, .isSelected] : .isButton)
                        .onTapGesture { choose(i) }
                }
            }
            .frame(width: 120)
            .background { MegaPlate(frame: frames[AnyHashable(sel)]) }
            .coordinateSpace(name: "tabs")
            .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
            .focusable()
            .focusEffectDisabled()
            .onKeyPress(.downArrow) { choose(min(cats.count - 1, sel + 1)); return .handled }
            .onKeyPress(.upArrow) { choose(max(0, sel - 1)); return .handled }

            ZStack(alignment: .topLeading) {
                VStack(alignment: .leading, spacing: 2) {
                    ForEach(cats[sel].1.indices, id: \.self) { r in MegaRow(title: cats[sel].1[r], symbol: "chevron.right") }
                }
                .id(sel)
                .transition(reduce ? .identity : .asymmetric(
                    insertion: .opacity.combined(with: .offset(y: 8 * dir)).animation(.motion(.base).delay(Motion.exit)),
                    removal: .opacity.animation(.motionExit)))
            }
            .frame(maxWidth: .infinity, minHeight: 100, alignment: .topLeading)
        }
    }

    private func choose(_ i: Int) {
        guard i != sel else { return }
        dir = i > sel ? 1 : -1
        withMotion(.base, reduceMotion: reduce) { sel = i }
    }
}
