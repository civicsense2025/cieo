import SwiftUI
import Cieo

public struct BacklinkAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "backlink", category: "Writing", name: "Backlink popover",
        summary: "The popover grows out of the link. Switching tabs swaps the old list out before the new rows rise one after another, and the highlight trails the hovered row.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let linked = [("Spring launch", "3 links"), ("Pricing table", "2 links"), ("Member letter", "1 link")]
    private let unlinked = [("Old roadmap", "no links"), ("Press kit", "no links")]
    private let rowH = 40.0
    @State private var open = false
    @State private var tab = 0
    @State private var hiTop = 0.0
    @State private var hiBottom = 40.0
    public init() {}

    private var rows: [(String, String)] { tab == 0 ? linked : unlinked }

    public var body: some View {
        AtomStage(hint: "Open [[launch notes]], then switch tabs") {
            VStack(alignment: .leading, spacing: 8) {
                Text("The launch plan lives in the notes for this quarter.")
                    .font(.system(size: 14))
                Button("[[launch notes]]") { setOpen(!open) }
                    .font(.system(size: 14)).foregroundStyle(Color.accentColor)
                    .accessibilityAddTraits(.isButton)
                    .accessibilityValue(open ? "expanded" : "collapsed")
                if open { panel.motionTransition(.presence) }
            }
            .frame(maxWidth: 300, alignment: .leading)
        }
    }

    private var panel: some View {
        VStack(spacing: 8) {
            Picker("Backlinks", selection: $tab) {
                Text("Linked").tag(0)
                Text("Unlinked").tag(1)
            }
            .pickerStyle(.segmented).controlSize(.small)
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 7).fill(.quaternary)
                    .frame(height: max(0, hiBottom - hiTop)).offset(y: hiTop)
                VStack(spacing: 0) {
                    ForEach(rows.indices, id: \.self) { i in
                        HStack {
                            Text(rows[i].0).font(.subheadline)
                            Spacer()
                            Text(rows[i].1).font(.system(size: 12.5)).foregroundStyle(.secondary)
                        }
                        .padding(.horizontal, 10).frame(height: rowH, alignment: .leading)
                        .contentShape(Rectangle())
                        .onHover { if $0 { moveHighlight(i) } }
                        .transition(.opacity.combined(with: .offset(y: 8)))
                        .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.03), value: tab)
                    }
                }
                .id(tab).motionTransition(.swap())
            }
            .frame(height: Double(rows.count) * rowH)
            .animation(reduce ? nil : .motion(.base), value: tab)
            .animation(reduce ? nil : .motion(.base), value: rows.count)
        }
        .padding(14)
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
        .shadow(color: .black.opacity(0.12), radius: 8, y: 3)
        .onChange(of: tab) { _, _ in moveHighlight(0) }
    }

    private func setOpen(_ on: Bool) { withMotion(on ? .base : .snap, reduceMotion: reduce) { open = on } }

    /// The highlight's leading edge moves first and its trailing edge follows 60 ms later.
    private func moveHighlight(_ k: Int) {
        let top = Double(k) * rowH, bottom = top + rowH
        guard !reduce else { hiTop = top; hiBottom = bottom; return }
        let down = top >= hiTop
        withAnimation(.motion(.base).delay(down ? Motion.lag : 0)) { hiTop = top }
        withAnimation(.motion(.base).delay(down ? 0 : Motion.lag)) { hiBottom = bottom }
    }
}
