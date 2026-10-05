import SwiftUI
import Cieo

public struct ToolPermissionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "toolpermissions", category: "MCP and agents", name: "Server tool permissions",
        summary: "Switches spring one by one. Enable all read-only turns on every read tool still off, 60ms apart from the top, and the button swaps to a Read-only tools enabled label once none are left; flipping any read tool off brings the original label back. The filter indicator edges lag each other, and tools outside the filter collapse in height rather than disappearing. Enabling a destructive tool grows a warning line under it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Tool: Identifiable { let id: Int; let name: String; let kind: String; var on: Bool }
    @State private var tools = [Tool(id: 0, name: "list_repos", kind: "Read", on: false), Tool(id: 1, name: "get_issue", kind: "Read", on: false),
                                Tool(id: 2, name: "search_code", kind: "Read", on: true), Tool(id: 3, name: "create_issue", kind: "Write", on: false),
                                Tool(id: 4, name: "delete_branch", kind: "Write", on: false)]
    @State private var filter = "All"
    public init() {}

    private var readsLeft: Bool { tools.contains { $0.kind == "Read" && !$0.on } }

    public var body: some View {
        AtomStage(hint: "Filter, flip tools, Enable all read-only") {
            AgCard {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Source control tools").font(.headline)
                        Spacer()
                        Text("\(tools.filter(\.on).count) of \(tools.count) enabled").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                    }
                    Picker("Filter", selection: $filter) { ForEach(["All", "Read", "Write"], id: \.self) { Text($0) } }.pickerStyle(.segmented).labelsHidden()
                    HStack {
                        Button { enableReads() } label: { SwapText(readsLeft ? "Enable all read-only" : "Read-only tools enabled") }.buttonStyle(AgPress()).disabled(!readsLeft)
                        Button("Disable all") { disableAll() }.buttonStyle(AgPress())
                    }
                    ForEach(tools) { t in
                        AgReveal(open: filter == "All" || filter == t.kind) {
                            VStack(alignment: .leading, spacing: 2) {
                                HStack {
                                    Text(t.name).font(.callout.monospaced()); AgChip(text: t.kind, tone: t.kind == "Write" ? .warning : .neutral)
                                    Spacer()
                                    Toggle(t.name, isOn: bind(t.id)).labelsHidden()
                                }
                                AgReveal(open: t.on && t.name == "delete_branch") { Text("This tool deletes data. Assistant will ask before using it.").font(.caption).foregroundStyle(.orange) }
                            }.padding(.vertical, 2)
                        }
                    }
                }
            }
            .frame(maxWidth: 420)
            .animation(reduce ? nil : .motion(.base), value: filter)
        }
    }

    private func bind(_ id: Int) -> Binding<Bool> {
        Binding(get: { tools[id].on }, set: { v in withMotion(.snap, reduceMotion: reduce) { tools[id].on = v } })
    }
    private func enableReads() {
        Task { @MainActor in
            for i in tools.indices where tools[i].kind == "Read" && !tools[i].on {
                withMotion(.snap, reduceMotion: reduce) { tools[i].on = true }
                try? await Task.sleep(nanoseconds: 60_000_000)
            }
        }
    }
    private func disableAll() { withMotion(.base, reduceMotion: reduce) { for i in tools.indices { tools[i].on = false } } }
}
