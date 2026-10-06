import SwiftUI
import Cieo

public struct CompareAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "compare", category: "Writing", name: "Version compare slider",
        summary: "The divider follows the pointer one to one. On release it springs to the nearer draft, and the caption swaps to match.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var x = Track(0, preset: .soft)
    @State private var held = false
    @State private var moved = false
    @State private var hx = 0.0
    @State private var vel = 0.0
    @State private var lastX = 0.0
    @State private var lastT = 0.0
    @State private var showing = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the divider, or pick a version") {
            VStack(spacing: 10) {
                GeometryReader { g in
                    TimelineView(.motion(x)) { ctx in
                        let v = max(0, min(1, held && moved ? hx : x.value(at: ctx.date.timeIntervalSinceReferenceDate)))
                        ZStack(alignment: .leading) {
                            draftA
                            draftB.mask(alignment: .leading) { Rectangle().frame(width: g.size.width * v) }
                            Rectangle().fill(.primary).frame(width: 2).offset(x: g.size.width * v - 1)
                            Circle().fill(.primary).frame(width: 28, height: 28).shadow(radius: 3, y: 1)
                                .offset(x: g.size.width * v - 14)
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .contentShape(Rectangle())
                        .gesture(DragGesture(minimumDistance: 0)
                            .onChanged { d in
                                let p = max(0, min(1, d.location.x / g.size.width))
                                let t = Date.timeIntervalSinceReferenceDate
                                if !held {
                                    held = true; moved = false; hx = p; lastX = p; lastT = t; vel = 0
                                    DataMotion.retarget(&x, to: p, preset: .soft, reduce: reduce)
                                } else {
                                    if abs(d.translation.width) > 2 { moved = true }
                                    if t > lastT { vel = vel * 0.6 + ((p - lastX) / (t - lastT)) * 0.4 }
                                    lastX = p; lastT = t; hx = p
                                }
                            }
                            .onEnded { _ in
                                held = false
                                let near = hx < 0.5 ? 0.0 : 1.0
                                if moved {
                                    if reduce { x.jump(near) } else { x.release(from: hx, velocity: vel, to: near, preset: .soft, at: Date.timeIntervalSinceReferenceDate) }
                                }
                                show(near < 0.5 ? 0 : 1)
                            })
                    }
                }
                .frame(maxWidth: 360).aspectRatio(12.0 / 7.0, contentMode: .fit)
                .accessibilityElement()
                .accessibilityLabel("Version")
                .accessibilityValue(showing == 0 ? "Draft 1" : "Draft 2")
                .accessibilityAdjustableAction { pick($0 == .increment ? 1 : 0) }
                HStack {
                    HStack(spacing: 6) {
                        Button("A") { pick(0) }.buttonStyle(.bordered).tint(showing == 0 ? .accentColor : nil)
                        Button("B") { pick(1) }.buttonStyle(.bordered).tint(showing == 1 ? .accentColor : nil)
                    }
                    Spacer()
                    SwapText(showing == 0 ? "Showing draft 1 — 2 changes" : "Showing draft 2 — approved")
                        .font(.caption).foregroundStyle(.secondary)
                }
                .frame(maxWidth: 360)
            }
        }
    }

    private var draftA: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Draft 1").font(.caption).foregroundStyle(.secondary)
            Text("We launch in June.").font(.headline)
            Text("Three chapters cover pricing, refunds, and support hours.").font(.caption).foregroundStyle(.secondary)
        }
        .padding(14).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(.quaternary.opacity(0.5))
    }

    private var draftB: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Draft 2").font(.caption).foregroundStyle(.secondary)
            Text("We launch in July.").font(.headline)
            Text("Three chapters cover pricing, refunds, support hours, and renewals.").font(.caption).foregroundStyle(.secondary)
        }
        .padding(14).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(.background)
    }

    private func show(_ k: Int) { withMotion(.soft, reduceMotion: reduce) { showing = k } }

    private func pick(_ k: Int) {
        DataMotion.retarget(&x, to: Double(k), preset: .soft, reduce: reduce)
        show(k)
    }
}
