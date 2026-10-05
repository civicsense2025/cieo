import SwiftUI
import MotionKit

public struct ConnectorListAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "connectorlist", category: "MCP and agents", name: "Connected servers",
        summary: "Each row is one server. Its chip morphs fill, label and width between connected, connecting, error and disconnected while the action button swaps its label, so Reconnect never pops in. An error opens a message panel under the row. New rows grow in from zero height, then their content fades up; the list stays pinned to the new row as it grows. Replay re-enters the rows 60ms apart.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum State_ { case connected, connecting, error, disconnected }
    private struct Server: Identifiable { let id: Int; let name: String; var state: State_ }
    @State private var servers = [Server(id: 1, name: "GitHub", state: .connected), Server(id: 2, name: "Postgres", state: .error), Server(id: 3, name: "Linear", state: .disconnected)]
    @State private var nextId = 4
    public init() {}

    private func tone(_ s: State_) -> AgTone { s == .connected ? .success : s == .error ? .danger : s == .connecting ? .info : .neutral }
    private func label(_ s: State_) -> String { s == .connected ? "Connected" : s == .error ? "Error" : s == .connecting ? "Connecting" : "Disconnected" }
    private func action(_ s: State_) -> String { s == .connected ? "Disconnect" : s == .error ? "Reconnect" : s == .connecting ? "Cancel" : "Connect" }

    public var body: some View {
        AtomStage(hint: "Connect, reconnect or add a server") {
            AgCard {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("\(servers.filter { $0.state == .connected }.count) of \(servers.count) connected").font(.headline)
                        Spacer()
                        Button("Add server") { add() }.buttonStyle(AgPress(tone: .info))
                    }
                    if servers.isEmpty { Text("No servers yet. Add one to give Claude more tools.").font(.caption).foregroundStyle(.secondary) }
                    ForEach(servers) { s in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Image(systemName: "server.rack").foregroundStyle(.secondary)
                                Text(s.name).font(.callout.weight(.medium))
                                Spacer()
                                AgChip(text: label(s.state), tone: tone(s.state))
                                Button { act(s.id) } label: { SwapText(action(s.state)) }.buttonStyle(AgPress())
                            }
                            AgReveal(open: s.state == .error) {
                                Text("Could not reach the server: connection refused.").font(.caption).foregroundStyle(.red)
                                    .padding(8).frame(maxWidth: .infinity, alignment: .leading)
                                    .background(Color.red.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
                            }
                        }
                        .transition(reduce ? .identity : .opacity.combined(with: .move(edge: .top)).animation(.motion(.base)))
                    }
                }
            }
            .frame(maxWidth: 440)
            .animation(reduce ? nil : .motion(.base), value: servers.count)
        }
    }

    private func set(_ id: Int, _ st: State_) { withMotion(.base, reduceMotion: reduce) { if let i = servers.firstIndex(where: { $0.id == id }) { servers[i].state = st } } }
    private func act(_ id: Int) {
        guard let s = servers.first(where: { $0.id == id }) else { return }
        switch s.state {
        case .connected: set(id, .disconnected)
        case .connecting: set(id, .disconnected)
        case .error, .disconnected:
            set(id, .connecting)
            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 900_000_000)
                if servers.first(where: { $0.id == id })?.state == .connecting { set(id, .connected) }
            }
        }
    }
    private func add() {
        let id = nextId; nextId += 1
        withMotion(.base, reduceMotion: reduce) { servers.insert(Server(id: id, name: "Server \(id)", state: .connecting), at: 0) }
        Task { @MainActor in try? await Task.sleep(nanoseconds: 900_000_000); set(id, .connected) }
    }
}
