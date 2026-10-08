import SwiftUI
import Cieo

public struct HoldConfirmAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "holdconfirm", category: "Scheduling", name: "Hold to confirm",
        summary: "Holding fills the ring steadily. An early release springs the fill back; a full hold swaps in a check that holds.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var fill = Track(0)
    @State private var done = Track(0)
    @State private var holding = false
    @State private var progress: Double = 0
    @State private var last = Date.timeIntervalSinceReferenceDate
    private let dur = 0.9
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Press and hold the ring") {
            TimelineView(.motion(fill, done)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                let _ = tick(t)
                let p = holding ? progress : fill.value(at: t)
                let d = done.value(at: t)
                VStack(spacing: 10) {
                    Text("Tue 9:00 AM · 30 min · Room B").font(.system(size: 13))
                    ZStack {
                        Circle().fill(.quaternary.opacity(0.5)).frame(width: 56, height: 56)
                        Circle().trim(from: 0, to: min(1, max(0, holding ? progress : (done.target > 0 ? 1 : p))))
                            .stroke(Color.primary, lineWidth: 6)
                            .frame(width: 56, height: 56).rotationEffect(.degrees(-90))
                        Image(systemName: d > 0.5 ? "checkmark" : "arrow.right")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(d > 0.5 ? .green : .primary)
                            .offset(y: -1)
                    }
                    .frame(width: 64, height: 64, alignment: .center)
                    .contentShape(Circle())
                    .gesture(DragGesture(minimumDistance: 0)
                        .onChanged { _ in if done.target == 0 { holding = true } }
                        .onEnded { _ in release() })
                    .accessibilityLabel(done.target > 0 ? "Booked" : "Press and hold to confirm")
                    Text(done.target > 0 ? "Booked · Tue 9:00" : "Hold to confirm")
                        .font(.system(size: 13))
                }
                .frame(maxWidth: 300)
                .overlay(RoundedRectangle(cornerRadius: 14).fill(d > 0.02 ? .green : .secondary.opacity(0.25)).opacity(0.10).allowsHitTesting(false))
            }
        }
    }

    private func release() {
        if done.target > 0 { holding = false; return }
        holding = false
        if reduce { fill.jump(0); progress = 0 }
        else { fill.release(from: progress, velocity: 0, to: 0, at: now()); progress = 0 }
    }

    private func tick(_ t: Double) {
        let dt = min(0.05, t - last); last = t
        guard holding, done.target == 0 else { return }
        let d = reduce ? 0.001 : dur
        progress = min(1, progress + dt / d)
        if progress >= 1 { holding = false; done.set(1, at: t) }
    }
}
