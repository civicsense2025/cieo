import SwiftUI
import Cieo

/// Frame stats sampled from TimelineView dates. Plain vars on purpose:
/// the animation timeline already re-renders every frame, so nothing is published during render.
final class FrameMeterStore: ObservableObject {
    var last = Date()
    var frameMs = 0
    var dropped = 0
    var running = false

    func sample(_ date: Date) {
        let ms = Int(date.timeIntervalSince(last) * 1000)
        last = date
        guard running else { return }
        frameMs = min(999, max(0, ms))
        if ms > 25 { dropped = min(9999, dropped + 1) }
    }
}

/// Notifies once the watched value stops changing, so the parent can
/// retarget its spring outside the render pass.
private struct SettleWatcher: View {
    var value: Double
    var target: Double
    var active: Bool
    var onSettled: () -> Void

    var body: some View {
        Color.clear.onChange(of: Int(value * 1000)) { _ in
            if active && abs(value - target) < 0.005 { onSettled() }
        }
    }
}

public struct FrameMeterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "framemeter", category: "Foundations", name: "Frame meter",
        summary: "Start the spring and watch real frame times roll in. Anything over 25ms counts as dropped.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @StateObject private var meter = FrameMeterStore()
    @State private var swing = Track(0, preset: .soft)
    public init() {}

    public var body: some View {
        AtomStage(hint: "Frame time and dropped frames while the spring runs") {
            VStack(spacing: 16) {
                TimelineView(.animation(paused: false)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    let _ = meter.sample(ctx.date)
                    let v = swing.value(at: t)
                    ZStack {
                        GeometryReader { g in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 10).fill(.quaternary)
                                Circle().fill(Color.accentColor).frame(width: 24, height: 24)
                                    .offset(x: 8 + CGFloat(v) * max(1, g.size.width - 40))
                            }
                        }
                        .frame(height: 40)
                        SettleWatcher(value: v, target: swing.target, active: meter.running && !reduce) { flip(at: t) }
                    }
                }
                HStack(spacing: 16) {
                    HStack(spacing: 4) {
                        Text("frame").font(.caption).foregroundStyle(.secondary)
                        RollingDigits(meter.frameMs).font(.system(size: 13, design: .monospaced))
                        Text("ms").font(.caption).foregroundStyle(.secondary)
                    }
                    HStack(spacing: 4) {
                        Text("dropped").font(.caption).foregroundStyle(.secondary)
                        RollingDigits(meter.dropped).font(.system(size: 13, design: .monospaced))
                    }
                }
                HStack(spacing: 8) {
                    Button("Start") { start() }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity, minHeight: 36)
                    Button("Stop") { stop() }.buttonStyle(.bordered).frame(maxWidth: .infinity, minHeight: 36)
                }
                HStack(spacing: 8) {
                    Text("drop > 25ms").font(.caption).foregroundStyle(.secondary)
                    Button("Reset count") { meter.dropped = 0 }.buttonStyle(.bordered).frame(minHeight: 32)
                }
            }
            .frame(maxWidth: 340)
        }
    }

    private func start() {
        meter.running = true
        meter.last = Date()
        if reduce { swing.jump(1) } else { swing.set(1, at: Date().timeIntervalSinceReferenceDate) }
    }

    private func stop() {
        meter.running = false
        swing.jump(swing.target)
    }

    private func flip(at t: Double) {
        guard meter.running, !reduce else { return }
        swing.set(swing.target > 0.5 ? 0 : 1, at: max(t, Date().timeIntervalSinceReferenceDate))
    }
}
