import SwiftUI
import Cieo

public struct ExportFlowAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "exportflow", category: "Documents", name: "Export flow",
        summary: "The button swaps to a spinner while the bar creeps to ninety percent, then springs full and lands an exported terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Phase { case idle, busy, done }
    @State private var phase = Phase.idle
    @State private var progress = 0.0
    @State private var run: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Export, watch it creep, then pop done") {
            VStack(spacing: 12) {
                Text("Contract.pdf · 2.4 MB").font(.headline)
                ZStack {
                    switch phase {
                    case .idle: Button("Export PDF", action: start).frame(minHeight: 32)
                    case .busy:
                        HStack(spacing: 8) {
                            TimelineView(.animation(paused: reduce)) { ctx in
                                Image(systemName: "arrow.2.circlepath").rotationEffect(.degrees(reduce ? 0 : (ctx.date.timeIntervalSinceReferenceDate * 420).truncatingRemainder(dividingBy: 360)))
                            }
                            Text("Exporting…")
                        }.font(.callout)
                    case .done: Label("Exported ✓", systemImage: "checkmark").foregroundStyle(.white).padding(.horizontal, 14).padding(.vertical, 6).background(.green, in: Capsule())
                    }
                }
                .frame(height: 36).motionTransition(.swap()).animation(reduce ? nil : .motion(.base), value: phaseHash)
                GeometryReader { geo in
                    Capsule().fill(.quaternary)
                    Capsule().fill(progress > 99 ? .green : Color.accentColor).frame(width: geo.size.width * min(1, progress / 100))
                        .animation(reduce ? nil : .motion(.lazy), value: progress)
                }
                .frame(height: 8)
                ZStack(alignment: .leading) {
                    if phase == .done { Text("Saved to Downloads ✓").foregroundStyle(.green).motionTransition(.swap()) }
                    else { Text(phase == .busy ? "Writing pages…" : "Ready to export").foregroundStyle(.secondary).motionTransition(.swap()) }
                }
                .font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                Toggle("Include annotations", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
            .padding(16).frame(maxWidth: 340)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
        .onDisappear { run?.cancel() }
    }

    private var phaseHash: Int { phase == .idle ? 0 : phase == .busy ? 1 : 2 }

    private func start() {
        guard phase == .idle else { return }
        run = Task {
            withMotion(.base, reduceMotion: reduce) { phase = .busy; progress = 0 }
            withMotion(.lazy, reduceMotion: reduce) { progress = 90 }
            try? await Task.sleep(for: .milliseconds(2100))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { progress = 100; phase = .done }
            try? await Task.sleep(for: .milliseconds(2600))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { phase = .idle; progress = 0 }
        }
    }
}
