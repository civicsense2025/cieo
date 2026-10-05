import SwiftUI
import Cieo

public struct ResizablePanelsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "resizable", category: "Layout", name: "Resizable panels",
        summary: "The divider follows the pointer exactly between its limits and rubber-bands beyond them. Releasing under 70px snaps the sidebar shut from your release velocity; a double-click springs it back.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var w = Track(180)
    @State private var held = false
    @State private var hw = 0.0
    @State private var sx = 0.0
    @State private var hover = false
    private let minW = 120.0
    public init() {}

    private func now() -> Double { Date().timeIntervalSinceReferenceDate }
    private func rubber(_ x: Double) -> Double { (x < 0 ? -1 : 1) * 30 * (1 - exp(-abs(x) / 30)) }

    public var body: some View {
        AtomStage(hint: "Drag the divider; pull it far left to collapse, double-tap to restore") {
            GeometryReader { g in
                let maxW = g.size.width - 160
                TimelineView(.animation(paused: reduce && !held)) { ctx in
                    let width = max(0, held ? hw : w.value(at: ctx.date.timeIntervalSinceReferenceDate))
                    HStack(spacing: 0) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Pages").fontWeight(.semibold)
                            Text("Home\nAbout\nJournal\nContact").foregroundStyle(.secondary)
                        }
                        .font(.footnote).padding(12).frame(minWidth: 120, alignment: .leading).fixedSize()
                        .frame(width: width, alignment: .leading).clipped()
                        handle(maxW: maxW)
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Editor").fontWeight(.semibold)
                            Text("Drag the divider. Pull it far left to collapse the sidebar, double-tap to bring it back.").foregroundStyle(.secondary)
                        }
                        .font(.footnote).padding(12).frame(maxWidth: .infinity, alignment: .topLeading)
                    }
                    .frame(height: 200, alignment: .top)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            .frame(maxWidth: 560).frame(height: 200)
        }
    }

    private func handle(maxW: Double) -> some View {
        let active = held ? 1.0 : hover ? 0.6 : 0.0
        return ZStack {
            Rectangle().fill(Color.primary.opacity(0.12)).frame(width: 2)
            Capsule().fill(Color.primary.opacity(0.25 + 0.5 * active)).frame(width: 6, height: 28).scaleEffect(y: 1 + 0.3 * active)
                .animation(reduce ? nil : .motion(.snap), value: active)
        }
        .frame(width: 12).padding(.horizontal, -6).contentShape(Rectangle()).zIndex(1)
        .onHover { hover = $0 }
        .onTapGesture(count: 2) { go(180) }
        .gesture(DragGesture(minimumDistance: 0)
            .onChanged { g in
                if !held {
                    held = true
                    sx = w.value(at: now()) - g.translation.width
                }
                var v = sx + g.translation.width
                if v > maxW { v = maxW + rubber(v - maxW) } else if v < minW { v = v < 70 ? max(0, v) : minW + rubber(v - minW) }
                hw = v
            }
            .onEnded { g in
                held = false
                let to = hw < 70 ? 0 : min(max(hw, minW), maxW)
                if reduce { w.jump(to) } else { w.release(from: hw, velocity: g.velocity.width, to: to, at: now()) }
            })
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Resize panels")
        .accessibilityAdjustableAction { dir in go(min(maxW, max(0, w.target + (dir == .increment ? 20 : -20)))) }
    }

    private func go(_ to: Double) {
        if reduce { w.jump(to) } else { w.set(to, at: now()) }
    }
}
