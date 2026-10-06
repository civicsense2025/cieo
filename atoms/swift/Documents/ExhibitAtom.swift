import SwiftUI
import Cieo

public struct ExhibitAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "exhibit", category: "Documents", name: "Exhibit upload",
        summary: "The row opens its height, the bar fills, then the check inks — or the row rings danger with a retry. Success holds attached.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Phase { case idle, busy, done, failed }
    @State private var phase = Phase.idle
    @State private var progress = 0.0
    @State private var failNext = false
    @State private var run: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Attach it — toggle failure to feel retry") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Exhibits · 1 of 3").font(.headline)
                    Button("Attach Exhibit B", action: start).frame(minHeight: 32).buttonStyle(.bordered)
                    if phase != .idle {
                        HStack(spacing: 10) {
                            Text("📄").frame(width: 36, height: 36).background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                            VStack(alignment: .leading, spacing: 6) {
                                HStack(spacing: 8) {
                                    Text("Exhibit-B.pdf").font(.callout)
                                    Text(phase == .busy ? "uploading…" : phase == .done ? "done" : "failed")
                                        .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                                }
                                GeometryReader { geo in
                                    Capsule().fill(.quaternary)
                                    Capsule().fill(phase == .failed && progress > 99 ? .red : progress > 99 ? .green : Color.accentColor)
                                        .frame(width: geo.size.width * min(1, progress / 100))
                                        .animation(reduce ? nil : .motion(.soft), value: progress)
                                }.frame(height: 6)
                            }
                            if phase == .done { Image(systemName: "checkmark").foregroundStyle(.green).motionTransition(.swap()) }
                            if phase == .failed { Button("Retry", action: start).frame(minHeight: 32) }
                        }
                        .padding(4).motionTransition(.swap())
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(phase == .failed ? .red : .clear, lineWidth: 2))
                    }
                    ZStack(alignment: .leading) {
                        if phase == .done { Text("Exhibit B attached ✓").foregroundStyle(.green).motionTransition(.swap()) }
                        if phase == .failed { Text("Upload failed — check the file and retry").foregroundStyle(.red).motionTransition(.swap()) }
                    }
                    .font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                }
                .padding(16).frame(maxWidth: 360)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                Toggle("Simulate failed upload", isOn: $failNext).font(.caption).foregroundStyle(.secondary)
            }
        }
        .onDisappear { run?.cancel() }
    }

    private func start() {
        run?.cancel()
        run = Task {
            withMotion(.base, reduceMotion: reduce) { phase = .busy; progress = 0 }
            withMotion(.soft, reduceMotion: reduce) { progress = 100 }
            try? await Task.sleep(for: .milliseconds(1400))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { phase = failNext ? .failed : .done }
        }
    }
}
