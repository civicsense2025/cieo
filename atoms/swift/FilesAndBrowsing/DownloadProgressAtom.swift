import SwiftUI
import MotionKit

public struct DownloadProgressAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "download", category: "Files and browsing", name: "Download progress",
        summary: "The ring fills as bytes arrive, at an uneven real-world pace, while the icon swaps between download, pause and resume. Finishing turns the ring and icon success and the status rolls to “Open”.")

    private enum State { case idle, run, paused, done }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @SwiftUI.State private var state = State.idle
    @SwiftUI.State private var progress = 0.0
    public init() {}

    private var icon: String { state == .idle ? "arrow.down" : state == .run ? "pause.fill" : state == .paused ? "play.fill" : "checkmark" }
    private var status: String {
        switch state {
        case .idle: "8.4 MB"
        case .run: String(format: "%.1f of 8.4 MB", progress * 8.4)
        case .paused: "Paused"
        case .done: "Done · Open"
        }
    }
    private var label: String { ["Download", "Pause", "Resume", "Open"][state == .idle ? 0 : state == .run ? 1 : state == .paused ? 2 : 3] }

    public var body: some View {
        AtomStage(hint: "Tap to download, pause and resume") {
            VStack(spacing: 10) {
                Button(action: tap) {
                    ZStack {
                        Circle().fill(.background).shadow(color: .black.opacity(0.12), radius: 6, y: 2)
                        Circle().trim(from: 0, to: progress).stroke(tint, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                            .rotationEffect(.degrees(-90)).padding(3)
                        ZStack {
                            Image(systemName: icon).font(.title3.weight(.semibold)).foregroundStyle(tint).id(icon)
                                .motionTransition(.swap(drift: 6))
                        }
                        .animation(reduce ? nil : .motion(.base), value: icon)
                    }.frame(width: 64, height: 64)
                }
                .buttonStyle(.plain).accessibilityLabel(label)
                Text("annual-report.pdf").font(.subheadline.weight(.semibold))
                SwapText(status).font(.footnote).monospacedDigit().foregroundStyle(state == .done ? Color.green : .secondary).frame(height: 18)
                Button("Reset") { withMotion(.snap, reduceMotion: reduce) { state = .idle; progress = 0 } }.font(.caption).buttonStyle(.borderless)
            }
        }
        .task(id: state) {
            guard state == .run else { return }
            var last = Date.timeIntervalSinceReferenceDate
            while !Task.isCancelled && progress < 1 {
                try? await Task.sleep(for: .milliseconds(33))
                let t = Date.timeIntervalSinceReferenceDate, dt = t - last; last = t
                progress = min(1, progress + dt * (0.12 + 0.1 * sin(t * 2.7) + 0.06 * sin(t * 7.1)))
            }
            if progress >= 1 { withMotion(.base, reduceMotion: reduce) { state = .done } }
        }
    }

    private var tint: Color { state == .done ? .green : .primary }

    private func tap() {
        withMotion(.base, reduceMotion: reduce) {
            switch state {
            case .idle, .paused: state = .run
            case .run: state = .paused
            case .done: break
            }
        }
    }
}
