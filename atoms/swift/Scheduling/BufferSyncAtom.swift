import SwiftUI
import Cieo

public struct BufferSyncAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "buffersync", category: "Scheduling", name: "Buffer editor",
        summary: "The handle drags the event edge one to one while the buffer edge trails sixty milliseconds behind. Syncing pulses, then lands Synced or Conflict.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var lead = Track(0.45, preset: .base)
    @State private var trail = Track(0.45, preset: .base)
    @State private var pulse = Track(0, preset: .snap)
    @State private var status = 0
    @State private var auto = true
    private let minStart = 0.2
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }
    private func mins(_ f: Double) -> Int { Int((f * 240).rounded()) }

    public var body: some View {
        AtomStage(hint: "Drag the right handle · short buffers conflict") {
            TimelineView(.motion(lead, trail, pulse)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                let buf = mins(trail.value(at: t) - lead.value(at: t) + 0.12)
                VStack(spacing: 10) {
                    HStack {
                        Text("Design review").font(.system(size: 13))
                        Spacer()
                        Text("\(buf) min buffer").font(.system(size: 13, weight: .semibold)).monospacedDigit()
                    }
                    GeometryReader { g in
                        let w = g.size.width
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 10).fill(.quaternary).frame(height: 56)
                            RoundedRectangle(cornerRadius: 8).fill(Color.accentColor.opacity(0.85))
                                .frame(width: w * (lead.value(at: t) - minStart), height: 40)
                                .offset(x: w * minStart, y: 0)
                            RoundedRectangle(cornerRadius: 8)
                                .strokeBorder(.secondary, style: StrokeStyle(dash: [5]))
                                .frame(width: max(8, w * (trail.value(at: t) - lead.value(at: t)) + w * 0.12), height: 40)
                                .offset(x: w * lead.value(at: t))
                            Capsule().fill(.background).frame(width: 20, height: 56)
                                .overlay(Capsule().fill(.secondary).frame(width: 4, height: 24))
                                .offset(x: w * lead.value(at: t) - 10)
                                .gesture(DragGesture(minimumDistance: 0)
                                    .onChanged { d in
                                        let v = min(0.9, max(0.3, minStart + Double(d.location.x / w)))
                                        if reduce { lead.jump(v); trail.jump(v) }
                                        else { lead.set(v, at: now()); trail.set(v, at: now() + 0.06) }
                                    }
                                    .onEnded { _ in if auto { sync() } })
                                .accessibilityAdjustableAction { d in
                                    let v = min(0.9, max(0.3, lead.target + (d == .increment ? 0.05 : -0.05)))
                                    if reduce { lead.jump(v); trail.jump(v) }
                                    else { lead.set(v, at: now()); trail.set(v, at: now() + 0.06) }
                                }
                        }
                    }
                    .frame(height: 56)
                    HStack(spacing: 8) {
                        Circle().fill(status == 2 ? .red : status == 1 ? .green : .secondary.opacity(0.4))
                            .frame(width: 10, height: 10)
                            .scaleEffect(1 + pulse.value(at: t) * 0.8)
                        Text(["Scheduled", "Synced", "Conflict"][status]).font(.system(size: 13))
                        Spacer()
                        Button("Sync") { sync() }.font(.system(size: 13))
                            .padding(.horizontal, 14).frame(minHeight: 32)
                            .background(.background, in: RoundedRectangle(cornerRadius: 8))
                            .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.05)))
                    }
                    .frame(minHeight: 36)
                    Toggle("Auto-sync on release", isOn: $auto)
                        .font(.system(size: 12)).foregroundStyle(.secondary).tint(.secondary)
                }
                .frame(width: 300)
            }
        }
    }

    private func sync() {
        let t = now()
        if reduce { pulse.jump(0) } else { pulse.set(1, at: t); pulse.set(0, at: t + 0.3) }
        let buf = mins(trail.target - lead.target + 0.12)
        DispatchQueue.main.asyncAfter(deadline: .now() + (reduce ? 0 : 0.55)) {
            status = buf >= 15 ? 1 : 2
        }
    }
}
