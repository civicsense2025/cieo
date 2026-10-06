import SwiftUI
import Cieo

public struct HoldScrimAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "holdscrim", category: "Overlays", name: "Hold scrim dismiss",
        summary: "Pressing dims the scrim deeper as a snap preview. Holding 500ms dismisses; releasing early springs back. Space held works the same.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var progress: Double = 0
    @State private var task: Task<Void, Never>?
    public init() {}
    public var body: some View {
        AtomStage(hint: "Press dims deeper · hold 500ms dismisses") {
            ZStack {
                VStack(spacing: 8) {
                    Toggle("Space holds too", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary).controlSize(.small)
                    Button("Open preview") { withMotion(.base, reduceMotion: reduce) { open = true; progress = 0 } }
                        .buttonStyle(.borderedProminent)
                    Text("Hold the shade to dismiss").font(.headline)
                }
                if open {
                    Color.black.opacity(0.35 + progress * 0.3).ignoresSafeArea()
                        .onTapGesture {}
                        .gesture(DragGesture(minimumDistance: 0).onChanged { _ in press() }.onEnded { _ in release() })
                        .transition(.opacity.animation(reduce ? nil : .motion(.snap)))
                    ProgressRing(progress: progress)
                        .transition(reduce ? .identity : .scale(scale: 0.9).combined(with: .opacity).animation(.motion(.snap)))
                }
            }
            .onKeyPress(.space) { press(); return .handled }
            .onKeyPress(.escape) { dismiss(); return .handled }
        }
    }
    private struct ProgressRing: View {
        let progress: Double
        var body: some View {
            ZStack {
                Circle().stroke(.white.opacity(0.4), lineWidth: 3).frame(width: 44, height: 44)
                Circle().trim(from: 0, to: progress).stroke(.white, lineWidth: 3)
                    .frame(width: 44, height: 44).rotationEffect(.degrees(-90))
                Text(progress >= 1 ? "✓" : "500").font(.caption2).foregroundStyle(.white)
            }
        }
    }
    private func press() {
        task?.cancel(); task = Task {
            for i in 1...5 { try? await Task.sleep(for: .seconds(0.1)); guard !Task.isCancelled else { return }
                await MainActor.run { withMotion(.snap, reduceMotion: reduce) { progress = Double(i) / 5 } } }
            await MainActor.run { dismiss() }
        }
    }
    private func release() { task?.cancel(); withMotion(.snap, reduceMotion: reduce) { if progress < 1 { progress = 0 } } }
    private func dismiss() { task?.cancel(); withMotion(.snap, reduceMotion: reduce) { open = false; progress = 0 } }
}
