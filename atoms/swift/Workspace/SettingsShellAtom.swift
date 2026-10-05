import SwiftUI
import MotionKit

public struct SettingsShellAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "settingsshell", category: "Workspace", name: "Settings shell",
        summary: "The nav plate edges between items, leading edge first, and tints to danger on Danger zone. Panes swap by nav order: going down they leave upward and the next arrives from below, going up the reverse, never overlapping, while the content area height springs to the next pane. Changing any control starts that pane’s own Saving… then Saved flash inline, then fades. Danger zone reveals a typed confirmation that grows the pane, arms the button only once the site name matches, and replaces itself with a scheduled message and Undo. Narrow: the nav becomes a top segmented row.")

    private enum Save { case idle, saving, saved }
    private let panes = ["General", "Billing", "Notifications", "Danger zone"]
    private let rowH: CGFloat = 34
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pane = 0
    @State private var dir: CGFloat = 1
    @State private var plateY: CGFloat = 0
    @State private var plateH: CGFloat = 34
    @State private var flags = [true, false, true, false]
    @State private var save = [Save](repeating: .idle, count: 4)
    @State private var confirming = false
    @State private var typed = ""
    @State private var scheduled = false
    public init() {}

    private var height: CGFloat { pane == 3 ? (scheduled ? 80 : confirming ? 176 : 100) : 110 }

    public var body: some View {
        AtomStage(hint: "Switch panes, flip a setting, try Danger zone") {
            HStack(alignment: .top, spacing: 12) {
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 8).fill(pane == 3 ? Color.red.opacity(0.15) : Color.secondary.opacity(0.2)).frame(height: plateH).offset(y: plateY)
                    VStack(spacing: 0) { ForEach(panes.indices, id: \.self) { i in
                        Button { go(i) } label: { Text(panes[i]).font(.footnote.weight(.medium)).foregroundStyle(i == 3 ? Color.red : .primary).padding(.leading, 10).frame(maxWidth: .infinity, minHeight: rowH, alignment: .leading) }.buttonStyle(.plain)
                            .accessibilityAddTraits(pane == i ? .isSelected : [])
                    } }
                }.frame(width: 120)
                ZStack(alignment: .topLeading) { content.id(pane).transition(reduce ? .identity : .asymmetric(
                    insertion: .modifier(active: Rise(y: 10 * dir, o: 0), identity: Rise(y: 0, o: 1)).animation(.motion(.base).delay(Motion.exit)),
                    removal: .modifier(active: Rise(y: -10 * dir, o: 0), identity: Rise(y: 0, o: 1)).animation(.motionExit))) }
                    .frame(width: 210, height: height, alignment: .topLeading).clipped().animation(reduce ? nil : .motion(.soft), value: height)
            }
            .padding(12).background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    @ViewBuilder private var content: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(panes[pane]).font(.subheadline.weight(.semibold))
            if pane < 3 {
                Toggle(["Show site in search", "Auto-renew plan", "Weekly digest"][pane], isOn: Binding(get: { flags[pane] }, set: { flags[pane] = $0; flash(pane) })).font(.footnote)
                ZStack(alignment: .leading) {
                    switch save[pane] { case .idle: Color.clear; case .saving: Text("Saving…").foregroundStyle(.secondary).transition(.opacity); case .saved: Label("Saved", systemImage: "checkmark").foregroundStyle(.green).transition(.opacity) }
                }.font(.caption).frame(height: 16).animation(reduce ? nil : .motion(.base), value: save[pane])
            } else if scheduled {
                Text("Deletion scheduled for Friday.").font(.footnote); Button("Undo") { withMotion(.base, reduceMotion: reduce) { scheduled = false; confirming = false; typed = "" } }.controlSize(.small).buttonStyle(.bordered)
            } else {
                Button("Delete site…") { withMotion(.soft, reduceMotion: reduce) { confirming = true } }.controlSize(.small).buttonStyle(.bordered).tint(.red)
                if confirming {
                    Text("Type Harbor & Pine to confirm.").font(.caption).foregroundStyle(.secondary)
                    TextField("Site name", text: $typed).textFieldStyle(.roundedBorder).font(.footnote)
                    Button("Delete") { withMotion(.base, reduceMotion: reduce) { scheduled = true } }.controlSize(.small).buttonStyle(.borderedProminent).tint(.red).disabled(typed != "Harbor & Pine")
                }
            }
        }
    }

    private func go(_ i: Int) {
        guard i != pane else { return }
        let down = i > pane, y = CGFloat(i) * rowH; dir = down ? 1 : -1
        withAnimation(reduce ? nil : .motion(.base).delay(down ? Motion.lag : 0)) { plateY = y }
        withAnimation(reduce ? nil : .motion(.base).delay(down ? 0 : Motion.lag)) { plateH = rowH + (down ? 0 : 0) }
        withMotion(.base, reduceMotion: reduce) { pane = i }
    }

    private func flash(_ p: Int) {
        withMotion(.base, reduceMotion: reduce) { save[p] = .saving }
        Task {
            try? await Task.sleep(for: .seconds(0.8)); withMotion(.base, reduceMotion: reduce) { save[p] = .saved }
            try? await Task.sleep(for: .seconds(1.4)); withMotion(.base, reduceMotion: reduce) { save[p] = .idle }
        }
    }
}

private struct Rise: ViewModifier {
    let y: CGFloat, o: Double
    func body(content: Content) -> some View { content.offset(y: y).opacity(o) }
}
