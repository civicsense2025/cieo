import SwiftUI
import MotionKit

public struct ToolCallLogAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "toolcalllog", category: "MCP and agents", name: "Tool call log",
        summary: "Calls stream in on a run clock, newest at the top. Each row grows from zero height and its content fades up; the spinner turns on that clock, then swaps to a check or an error as the call finishes, and the duration stops counting. Several calls overlap, so more than one spinner can run. Pause freezes the run clock without losing the queue. Click a row to grow its arguments and result; failed rows open on the error.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum St { case running, ok, failed }
    private struct Call: Identifiable { let id: Int; let name: String; var st: St; var open = false }
    @State private var calls: [Call] = []
    @State private var paused = false
    @State private var runToken = 0
    public init() {}

    private let script = ["pages.list", "pages.read", "pages.update", "media.upload", "pages.publish", "search.query"]

    public var body: some View {
        AtomStage(hint: "Calls stream in; tap a row to open its result") {
            AgCard {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("\(calls.count) calls · \(calls.filter { $0.st == .failed }.count) failed").font(.headline).monospacedDigit()
                        Spacer()
                        Button(paused ? "Resume" : "Pause") { paused.toggle() }.buttonStyle(AgPress())
                        Button("Replay") { replay() }.buttonStyle(AgPress())
                    }
                    ForEach(calls) { c in
                        VStack(alignment: .leading, spacing: 4) {
                            Button { toggle(c.id) } label: {
                                HStack {
                                    Group {
                                        switch c.st {
                                        case .running: AgSpinner(size: 12)
                                        case .ok: Image(systemName: "checkmark.circle").foregroundStyle(.green)
                                        case .failed: Image(systemName: "exclamationmark.circle").foregroundStyle(.red)
                                        }
                                    }.frame(width: 16)
                                    Text(c.name).font(.callout.monospaced()); Spacer()
                                    Text(c.st == .running ? "running" : "\(120 + c.id * 37) ms").font(.caption).foregroundStyle(.secondary)
                                }
                            }.buttonStyle(.plain)
                            AgReveal(open: c.open || c.st == .failed && c.open) {
                                Text(c.st == .failed ? "Error: upstream timed out after 30s." : "{ \"status\": \"ok\" }").font(.caption.monospaced())
                                    .padding(6).frame(maxWidth: .infinity, alignment: .leading).background(.quaternary, in: RoundedRectangle(cornerRadius: 6))
                            }
                        }
                        .transition(reduce ? .identity : .opacity.combined(with: .move(edge: .top)))
                    }
                }
            }
            .frame(maxWidth: 420)
            .animation(reduce ? nil : .motion(.base), value: calls.count)
        }
        .task(id: runToken) { await stream() }
    }

    private func stream() async {
        calls = []
        for (i, name) in script.enumerated() {
            while paused { try? await Task.sleep(nanoseconds: 100_000_000) }
            if Task.isCancelled { return }
            let c = Call(id: i + 1, name: name, st: .running)
            withMotion(.base, reduceMotion: reduce) { calls.insert(c, at: 0) }
            let id = c.id, fail = i == 3
            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 1_100_000_000)
                withMotion(.snap, reduceMotion: reduce) { if let k = calls.firstIndex(where: { $0.id == id }) { calls[k].st = fail ? .failed : .ok; calls[k].open = fail } }
            }
            try? await Task.sleep(nanoseconds: 600_000_000)
        }
    }
    private func toggle(_ id: Int) { withMotion(.base, reduceMotion: reduce) { if let k = calls.firstIndex(where: { $0.id == id }) { calls[k].open.toggle() } } }
    private func replay() { runToken += 1 }
}
