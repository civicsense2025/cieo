import SwiftUI
import Cieo

public struct ServerStatusAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "serverstatus", category: "MCP and agents", name: "Server connection health",
        summary: "Connecting walks four steps in order: each swaps its ring for a spinner, then a check, 450 to 600ms apart, and the chip morphs to Connected when the last lands. The latency number rolls digit by digit with each ping while the sparkline shifts one bar left and every bar springs to its neighbor’s height. Simulate outage drops the bars flat and morphs everything to the error state; a countdown rolls down, the first auto retry fails at Initialize, and the second succeeds. Retry now skips the wait.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Health { case connecting, connected, error }
    @State private var health = Health.connecting
    @State private var stepsDone = 0
    @State private var latency = 42
    @State private var bars: [Double] = Array(repeating: 0, count: 12)
    @State private var retry = 0
    @State private var runToken = 0
    public init() {}

    private let steps = ["Open transport", "Initialize", "List tools", "Ping"]
    private var tone: AgTone { health == .connected ? .success : health == .error ? .danger : .info }

    public var body: some View {
        AtomStage(hint: "Simulate outage to see retries") {
            AgCard {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Image(systemName: "externaldrive.connected.to.line.below").foregroundStyle(.secondary)
                        VStack(alignment: .leading, spacing: 0) { Text("Postgres").font(.headline); Text("analytics-ro · stdio").font(.caption).foregroundStyle(.secondary) }
                        Spacer()
                        AgChip(text: health == .connected ? "Connected" : health == .error ? "Error" : "Connecting", tone: tone)
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        ForEach(steps.indices, id: \.self) { i in
                            HStack(spacing: 6) {
                                Group {
                                    if stepsDone > i { Image(systemName: "checkmark.circle.fill").foregroundStyle(.green) }
                                    else if stepsDone == i && health == .connecting { AgSpinner(size: 12) }
                                    else { Image(systemName: "circle").foregroundStyle(.secondary) }
                                }.frame(width: 16)
                                Text(steps[i]).font(.caption)
                            }
                        }
                    }
                    HStack(alignment: .bottom) {
                        VStack(alignment: .leading, spacing: 0) {
                            Text("Round-trip latency").font(.caption).foregroundStyle(.secondary)
                            HStack(spacing: 2) { if health == .connected { RollingDigits(latency) } else { Text("—") }; Text("ms") }.font(.title3.weight(.semibold))
                        }
                        Spacer()
                        HStack(alignment: .bottom, spacing: 3) {
                            ForEach(bars.indices, id: \.self) { i in
                                RoundedRectangle(cornerRadius: 2).fill(tone.color.opacity(0.7)).frame(width: 6, height: max(2, bars[i] * 36))
                            }
                        }.frame(height: 36, alignment: .bottom).accessibilityHidden(true)
                    }
                    if health == .error { Text(retry == 0 ? "Retrying in 3s, attempt 1" : "Retrying, attempt \(retry + 1)").font(.caption).foregroundStyle(.red).transition(.opacity) }
                    HStack {
                        Button("Simulate outage") { runToken += 1; outage() }.buttonStyle(AgPress()).disabled(health != .connected)
                        Button("Reconnect") { runToken += 1 }.buttonStyle(AgPress())
                    }
                }
            }
            .frame(maxWidth: 420)
            .animation(reduce ? nil : .motion(.base), value: health)
        }
        .task(id: runToken) { await connect() }
    }

    private func connect() async {
        withMotion(.base, reduceMotion: reduce) { health = .connecting; stepsDone = 0; retry = 0; bars = Array(repeating: 0, count: 12) }
        for i in 1...steps.count {
            try? await Task.sleep(nanoseconds: 500_000_000)
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { stepsDone = i }
        }
        withMotion(.base, reduceMotion: reduce) { health = .connected }
        while !Task.isCancelled {
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            if Task.isCancelled { return }
            let next = Int.random(in: 28...64)
            withMotion(.base, reduceMotion: reduce) { latency = next; bars.removeFirst(); bars.append(Double(next) / 80) }
        }
    }
    private func outage() {
        withMotion(.base, reduceMotion: reduce) { health = .error; bars = Array(repeating: 0, count: 12); stepsDone = 1 }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 2_500_000_000)
            withMotion(.base, reduceMotion: reduce) { retry = 1 }
            try? await Task.sleep(nanoseconds: 1_500_000_000)
            runToken += 1
        }
    }
}
