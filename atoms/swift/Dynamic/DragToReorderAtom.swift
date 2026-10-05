import SwiftUI
import MotionKit

public struct DragToReorderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "reorder", category: "Dynamic", name: "Drag to reorder",
        summary: "The held row lifts and follows the pointer exactly. The others spring aside the moment it crosses their midpoint. On release it settles into its slot from your release velocity.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let names = ["Home", "About", "Journal", "Shop", "Contact"]
    private let pitch = 50.0
    @State private var ys = (0..<5).map { Track(Double($0) * 50, preset: .base) }
    @State private var lift = Array(repeating: Track(0, preset: .snap), count: 5)
    @State private var order = Array(0..<5)
    @State private var held: Int?
    @State private var hy = 0.0
    @State private var startY = 0.0
    @State private var vel = DataVelocity()
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag a row up or down") {
            TimelineView(.motion(ys, lift)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                ZStack(alignment: .topLeading) {
                    ForEach(names.indices, id: \.self) { i in
                        let l = max(0, min(1, lift[i].value(at: t)))
                        HStack(spacing: 10) {
                            Image(systemName: "line.3.horizontal").foregroundStyle(.tertiary)
                            Text(names[i]).font(.caption.weight(.medium)).frame(maxWidth: .infinity, alignment: .leading)
                            Text("\((order.firstIndex(of: i) ?? 0) + 1)").font(.caption).monospacedDigit().foregroundStyle(.secondary)
                        }
                        .padding(.horizontal, 12).frame(height: 44)
                        .background(.background, in: RoundedRectangle(cornerRadius: 10))
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(.quaternary))
                        .shadow(color: .black.opacity(0.08 + 0.12 * l), radius: 4 + 20 * l / 2, y: 2 + 10 * l / 2)
                        .scaleEffect(1 + 0.03 * l)
                        .offset(y: held == i ? hy : ys[i].value(at: t))
                        .zIndex(held == i ? 5 : 0)
                        .gesture(drag(i))
                        .accessibilityLabel("\(names[i]), position \((order.firstIndex(of: i) ?? 0) + 1) of 5")
                        .accessibilityAction(named: "Move up") { move(i, by: -1) }
                        .accessibilityAction(named: "Move down") { move(i, by: 1) }
                    }
                }
                .frame(width: 300, height: 246, alignment: .topLeading)
            }
        }
    }

    private func drag(_ i: Int) -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { d in
                if held != i {
                    held = i; startY = ys[i].value(at: DataMotion.now); hy = startY; vel.reset()
                    DataMotion.retarget(&lift[i], to: 1, reduce: reduce)
                }
                var v = startY + d.translation.height
                let maxV = Double(names.count - 1) * pitch
                if v < 0 { v = DataMotion.rubber(v, limit: 24) }
                if v > maxV { v = maxV + DataMotion.rubber(v - maxV, limit: 24) }
                hy = v
                vel.add(v, at: d.time.timeIntervalSinceReferenceDate)
                let k = max(0, min(names.count - 1, Int((v / pitch).rounded())))
                if let cur = order.firstIndex(of: i), k != cur { order.remove(at: cur); order.insert(i, at: k); layout() }
            }
            .onEnded { _ in
                guard held == i, let k = order.firstIndex(of: i) else { return }
                if reduce { ys[i].jump(Double(k) * pitch) } else { ys[i].release(from: hy, velocity: vel.v, to: Double(k) * pitch, at: DataMotion.now) }
                DataMotion.retarget(&lift[i], to: 0, reduce: reduce)
                held = nil
            }
    }

    private func layout() {
        for (slot, i) in order.enumerated() where i != held { DataMotion.retarget(&ys[i], to: Double(slot) * pitch, reduce: reduce) }
    }

    private func move(_ i: Int, by d: Int) {
        guard let cur = order.firstIndex(of: i), (0..<names.count).contains(cur + d) else { return }
        order.remove(at: cur); order.insert(i, at: cur + d); layout()
    }
}
