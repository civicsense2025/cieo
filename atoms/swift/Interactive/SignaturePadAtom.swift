import SwiftUI
import MotionKit

public struct SignaturePadAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "signature", category: "Interactive", name: "Signature pad",
        summary: "Ink follows the pointer exactly. Stroke width thins with speed, and Clear fades the ink out on a spring before wiping.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Dot { var p: CGPoint; var t: Double; var w: Double }
    @State private var strokes: [[Dot]] = []
    @State private var ink = Track(1, preset: .snap)
    @State private var clearing = false
    @State private var drawing = false
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
                    Text("Sign with mouse or finger").font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Button("Clear", action: clear).buttonStyle(.bordered).disabled(strokes.isEmpty)
                }
            }
            .frame(maxWidth: 340)
        }
    }

    private func clear() {
        guard !strokes.isEmpty else { return }
        if reduce { strokes = []; return }
        clearing = true
        DataMotion.retarget(&ink, to: 0, reduce: false)
        Task {
            try? await Task.sleep(for: .milliseconds(260))
            if clearing { strokes = []; clearing = false; ink.jump(1) }
        }
    }
}
