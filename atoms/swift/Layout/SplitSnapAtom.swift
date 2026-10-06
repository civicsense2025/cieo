import SwiftUI
import Cieo

public struct SplitSnapAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "splitsnap", category: "Layout", name: "Split snap drag",
        summary: "The divider tracks the pointer one to one with a grip highlight, then settles into the nearest snap point from your velocity.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var w = Track(200)
    @State private var held = false
    @State private var hw = 0.0
    @State private var sx = 0.0
    @State private var hover = false
    @State private var soft = true
    private let snaps = [0.25, 0.5, 0.75]
    public init() {}

    private func now() -> Double { Date().timeIntervalSinceReferenceDate }
    private var preset: SpringPreset { soft ? .soft : .base }

    public var body: some View {
        AtomStage(hint: "Drag the divider; release to snap to 25, 50, or 75 percent") {
            VStack(spacing: 8) {
                Text("Split snap drag").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("\(Int((w.target / 400 * 100).rounded()))% · settles at 25 / 50 / 75")
                    .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                GeometryReader { g in
                    let total = g.size.width
                    TimelineView(.animation(paused: reduce && !held)) { ctx in
                        let width = max(0, held ? hw : w.value(at: ctx.date.timeIntervalSinceReferenceDate))
                        HStack(spacing: 0) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Notes").fontWeight(.semibold)
                                Text("Spring\nSlotted\nPinned").foregroundStyle(.secondary)
                            }
                            .font(.footnote).padding(14).frame(width: width, alignment: .leading).clipped()
                            handle(total: total)
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Canvas").fontWeight(.semibold)
                                Text("Drag the divider, then let go. It lands softly on a snap point.").foregroundStyle(.secondary)
                            }
                            .font(.footnote).padding(14).frame(maxWidth: .infinity, alignment: .topLeading)
                        }
                        .frame(height: 190, alignment: .top)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
                .frame(maxWidth: 560).frame(height: 190)
                HStack(spacing: 8) {
                    Button("25") { go(0.25) }.buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    Button("50") { go(0.5) }.buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    Button("75") { go(0.75) }.buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    Toggle("Soft settle", isOn: $soft).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
            .frame(maxWidth: 560)
        }
    }

    private func handle(total: Double) -> some View {
        let active = held ? 1.0 : hover ? 0.6 : 0.0
        return ZStack {
            Rectangle().fill(Color.primary.opacity(0.12)).frame(width: 2)
            Capsule().fill(Color.primary.opacity(0.25 + 0.5 * active)).frame(width: 6, height: 28)
                .scaleEffect(y: 1 + 0.3 * active)
                .animation(reduce ? nil : .motion(.snap), value: active)
        }
        .frame(width: 12).padding(.horizontal, -6).contentShape(Rectangle()).zIndex(1)
        .onHover { hover = $0 }
        .gesture(DragGesture(minimumDistance: 0)
            .onChanged { g in
                if !held { held = true; sx = w.value(at: now()) - g.translation.width }
                hw = min(max(sx + g.translation.width, 0), total)
            }
            .onEnded { g in
                held = false
                let f = hw / max(1, total)
                let snap = snaps.min(by: { abs($0 - f) < abs($1 - f) }) ?? 0.5
                let to = snap * total
                if reduce { w.jump(to) } else { w.release(from: hw, velocity: g.velocity.width, to: to, preset: preset, at: now()) }
            })
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Snap divider")
        .accessibilityAdjustableAction { dir in
            go(min(0.75, max(0.25, w.target / max(1, total) + (dir == .increment ? 0.25 : -0.25))))
        }
    }

    private func go(_ frac: Double) {
        if reduce { w.jump(frac * 400) } else { w.set(frac * 400, preset: preset, at: now()) }
    }
}
