import SwiftUI
import Cieo

private struct SwipeRow: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let sender: String
    let preview: String
    let resetToken: Int
    let showDivider: Bool
    @State private var x = Track(0, preset: .base)
    @State private var h = Track(1, preset: .base)
    @State private var held = false
    @State private var hx = 0.0
    @State private var startX = 0.0
    @State private var vel = DataVelocity()
    private let rowHeight = 58.0

    var body: some View {
        GeometryReader { g in
            TimelineView(.motion(x, h)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let px = held ? hx : x.value(at: t), a = min(1, abs(px) / 80), right = px > 0
                ZStack {
                    (a >= 1 ? (right ? Color.green : Color.orange) : Color.gray.opacity(0.15 + 0.85 * a))
                        .overlay(alignment: .leading) { icon("archivebox", a, show: right).padding(.leading, 18) }
                        .overlay(alignment: .trailing) { icon("clock", a, show: !right && px != 0).padding(.trailing, 18) }
                    VStack(alignment: .leading, spacing: 1) {
                        Text(sender).font(.caption.weight(.semibold)); Text(preview).font(.caption).foregroundStyle(.secondary)
                    }
                    .padding(.horizontal, 14).padding(.vertical, 12).frame(maxWidth: .infinity, alignment: .leading)
                    .frame(height: rowHeight).background(.background).offset(x: px)
                    .gesture(DragGesture(minimumDistance: 8)
                        .onChanged { d in
                            if !held { held = true; startX = x.value(at: DataMotion.now); vel.reset() }
                            hx = startX + d.translation.width
                            vel.add(hx, at: d.time.timeIntervalSinceReferenceDate)
                        }
                        .onEnded { _ in end(width: g.size.width) })
                    .accessibilityElement(children: .combine)
                    .accessibilityAction(named: "Archive") { fling(1, g.size.width) }
                    .accessibilityAction(named: "Snooze") { fling(-1, g.size.width) }
                }
                .frame(height: max(0, rowHeight * h.value(at: t))).clipped()
                .overlay(alignment: .bottom) { if showDivider { Divider() } }
            }
        }
        .frame(height: rowHeight)
        .onChange(of: resetToken) { _, _ in DataMotion.retarget(&x, to: 0, reduce: reduce); DataMotion.retarget(&h, to: 1, reduce: reduce) }
    }

    private func icon(_ name: String, _ a: Double, show: Bool) -> some View {
        Image(systemName: name).foregroundStyle(.white).opacity(show ? a : 0).scaleEffect(0.7 + 0.3 * max(0, min(1, abs(held ? hx : x.target) / 80 - 0.2)))
    }

    private func end(width: Double) {
        held = false
        let out = abs(hx) > 80 || abs(vel.v) > 700
        if out { fling(hx == 0 ? (vel.v < 0 ? -1 : 1) : (hx < 0 ? -1 : 1), width, from: hx, velocity: vel.v) }
        else if reduce { x.jump(0) } else { x.release(from: hx, velocity: vel.v, to: 0, at: DataMotion.now) }
    }

    private func fling(_ dir: Double, _ width: Double, from: Double? = nil, velocity: Double = 0) {
        let start = from ?? x.value(at: DataMotion.now)
        if reduce { x.jump(dir * width) } else { x.release(from: start, velocity: velocity, to: dir * width, at: DataMotion.now) }
        DataMotion.retarget(&h, to: 0, preset: .base, delay: 0.15, reduce: reduce)
    }
}

public struct SwipeActionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "swiperow", category: "Email", name: "Swipe actions",
        summary: "The row follows your finger. The action behind it fills with its color and its icon grows once you pass the 80px threshold. Release past it and the row leaves and its space closes; otherwise it springs home.")
    @State private var token = 0
    @State private var showDividers = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Swipe right to archive, left to snooze") {
            VStack(spacing: 14) {
                VStack(spacing: 0) {
                    SwipeRow(sender: "Maya Chen", preview: "Draft is ready for review", resetToken: token, showDivider: showDividers)
                    SwipeRow(sender: "Billing", preview: "Invoice INV-0042 paid", resetToken: token, showDivider: showDividers)
                    SwipeRow(sender: "Theo Park", preview: "Comment on pricing table", resetToken: token, showDivider: false)
                }
                .frame(maxWidth: 340)
                Button("Restore") { token += 1 }.buttonStyle(.bordered)
                Toggle("Dividers", isOn: $showDividers).font(.caption).foregroundStyle(.secondary).toggleStyle(.switch).controlSize(.small)
            }
        }
    }
}
