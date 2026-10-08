import SwiftUI

/// Downloads shelf: pushes up, rows stagger 40ms, ring fills, success terminal.
public struct DownloadsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "downloads", category: "Chrome", name: "Downloads", summary: "Downloads shelf: pushes up, rows stagger 40ms, ring fills, success terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var running = false
    @State private var progress: Double = 0
    @State private var done = false
    private let files = ["Setup.dmg", "Report.pdf", "Wallpaper.png"]

    public init() {}
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Downloads").font(.system(size: 15, weight: .semibold))
            Text("Shelf pushes up · rows stagger 40ms · ring fills live")
                .font(.system(size: 12.5)).foregroundStyle(.secondary)
            VStack(spacing: 8) {
                Button(done ? "Download again" : "Download 3 files") {
                    running = true; done = false; progress = 0
                    Task {
                        for step in 1...20 {
                            try? await Task.sleep(for: .milliseconds(reduce ? 0 : 120))
                            progress = Double(step) / 20.0
                        }
                        running = false; done = true
                    }
                }
                .frame(maxWidth: .infinity, minHeight: 32)
                if running || done {
                    VStack(spacing: 0) {
                        ForEach(Array(files.enumerated()), id: \.offset) { i, f in
                            HStack(spacing: 10) {
                                ZStack {
                                    Circle().stroke(Color.primary.opacity(0.12), lineWidth: 3)
                                    Circle()
                                        .trim(from: 0, to: done ? 1 : progress)
                                        .stroke(.green, lineWidth: 3)
                                        .rotationEffect(.degrees(-90))
                                    if done { Text("✓").font(.system(size: 12)).foregroundStyle(.green) }
                                    else { Text("\(Int(progress * 100))").font(.system(size: 9)).monospacedDigit() }
                                }
                                .frame(width: 32, height: 32)
                                VStack(alignment: .leading) {
                                    Text(f).font(.system(size: 13.5)).lineLimit(1)
                                    Text(done ? "done ✓" : (running ? "downloading…" : "waiting"))
                                        .font(.system(size: 12)).foregroundStyle(.secondary)
                                }
                                Spacer()
                            }
                            .frame(minHeight: 40).padding(.vertical, 4)
                            .transition(.opacity.combined(with: .move(edge: .top)))
                            if i < files.count - 1 { Divider() }
                        }
                    }
                    .animation(reduce ? nil : .spring(response: 0.3).delay(0.04), value: progress)
                    Text(done ? "3 of 3 complete ✓" : "\(Int(progress * 100))% downloading…")
                        .font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit()
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(15)
            .frame(maxWidth: 440)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
        }
        .focusable(true)
        .escapeKey { running = false; progress = 0; done = false }
    }
}
