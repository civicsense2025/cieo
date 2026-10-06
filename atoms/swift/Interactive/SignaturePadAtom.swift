import SwiftUI
import Cieo

public struct SignaturePadAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "signature", category: "Interactive", name: "Signature pad",
        summary: "Ink follows the pointer exactly. Stroke width thins with speed, and Clear fades the ink out on a spring before wiping.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Dot { var p: CGPoint; var t: Double; var w: Double }
    @State private var strokes: [[Dot]] = []
    @State private var ink = Track(1, preset: .snap)
    @State private var clearing = false
    @State private var drawing = false
    @State private var saved = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Sign with mouse or finger") {
            VStack(spacing: 8) {
                TimelineView(.animation(paused: strokes.isEmpty && !clearing)) { ctx in
                    let a = max(0, min(1, ink.value(at: ctx.date.timeIntervalSinceReferenceDate)))
                    Canvas { c, _ in
                        for s in strokes where s.count > 1 {
                            for i in 1..<s.count {
                                var seg = Path(); seg.move(to: s[i - 1].p); seg.addLine(to: s[i].p)
                                c.stroke(seg, with: .color(.primary.opacity(a)), style: StrokeStyle(lineWidth: s[i].w, lineCap: .round, lineJoin: .round))
                            }
                        }
                    }
                }
                .frame(height: 150)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                .contentShape(Rectangle())
                .gesture(DragGesture(minimumDistance: 0)
                    .onChanged { d in
                        let now = d.time.timeIntervalSinceReferenceDate
                        if clearing { strokes = []; clearing = false; ink.jump(1) }
                        if saved { withMotion(.snap, reduceMotion: reduce) { saved = false } }
                        if !drawing {
                            drawing = true
                            strokes.append([Dot(p: d.location, t: now, w: 3.2)])
                        } else if var cur = strokes.popLast() {
                            let last = cur[cur.count - 1], dt = max(1e-3, now - last.t)
                            let speed = hypot(d.location.x - last.p.x, d.location.y - last.p.y) / dt
                            cur.append(Dot(p: d.location, t: now, w: 3.2 - min(1, speed / 1800) * 2))
                            strokes.append(cur)
                        }
                    }
                    .onEnded { _ in drawing = false }
                    )
                .accessibilityLabel("Signature pad")
                HStack {
                    ZStack(alignment: .leading) {
                        if saved {
                            Text("✓ Signature saved").font(.caption).fontWeight(.semibold).foregroundStyle(.green)
                                .id("done").motionTransition(.swap())
                        } else {
                            Text("Sign with mouse or finger").font(.caption).foregroundStyle(.secondary)
                                .id("pad").motionTransition(.swap())
                        }
                    }
                    Spacer()
                    Button("Clear", action: clear).buttonStyle(.bordered).disabled(strokes.isEmpty)
                    Button("Save") { withMotion(.base, reduceMotion: reduce) { saved = true } }
                        .buttonStyle(.borderedProminent).controlSize(.small).disabled(strokes.isEmpty)
                }
                HStack(spacing: 6) {
                    Text("View:").font(.caption).foregroundStyle(.secondary)
                    Button("Pad") { withMotion(.base, reduceMotion: reduce) { saved = false } }.buttonStyle(.bordered).controlSize(.mini)
                    Button("Saved") { if !strokes.isEmpty { withMotion(.base, reduceMotion: reduce) { saved = true } } }.buttonStyle(.bordered).controlSize(.mini)
                    Button("Draw again", action: redraw).buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: 340)
        }
    }

    private func redraw() {
        withMotion(.snap, reduceMotion: reduce) { saved = false }
        clear()
    }

    private func clear() {
        guard !strokes.isEmpty else { return }
        withMotion(.snap, reduceMotion: reduce) { saved = false }
        if reduce { strokes = []; return }
        clearing = true
        DataMotion.retarget(&ink, to: 0, reduce: false)
        Task {
            try? await Task.sleep(for: .milliseconds(260))
            if clearing { strokes = []; clearing = false; ink.jump(1) }
        }
    }
}
