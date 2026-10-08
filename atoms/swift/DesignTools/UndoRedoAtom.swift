import SwiftUI
import Cieo

public struct UndoRedoAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "undoredo", category: "Design tools", name: "Undo and redo",
        summary: "Undo and redo spring the shape between saved states. A dashed ghost stays at the state you just left and fades out, so you can see what changed.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Shape: Equatable { var x = 40.0, size = 60.0, color = 0 }
    private let colors: [Color] = [.accentColor, .orange, .primary]
    @State private var history = [Shape()]
    @State private var index = 0
    @State private var ghost: Shape?
    @State private var ghostAt = -9.0
    @State private var xT = Track(40, preset: .base)
    @State private var sT = Track(60, preset: .base)
    @State private var cT = Track(0, preset: .base)
    public init() {}

    public var body: some View {
        AtomStage(hint: "Make a few changes, then undo") {
            VStack(alignment: .leading, spacing: 10) {
                TimelineView(.animation) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    let s = sT.value(at: t), g = max(0, min(1, 1 - (t - ghostAt) / 0.5))
                    ZStack(alignment: .topLeading) {
                        if let ghost {
                            RoundedRectangle(cornerRadius: 10).stroke(.secondary, style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))
                                .frame(width: ghost.size, height: ghost.size).offset(x: ghost.x, y: 75 - ghost.size / 2).opacity(g)
                        }
                        RoundedRectangle(cornerRadius: 10).fill(colors[max(0, min(2, Int(cT.value(at: t).rounded())))])
                            .frame(width: max(0, s), height: max(0, s)).offset(x: xT.value(at: t), y: 75 - s / 2)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                }
                .frame(height: 150).background(.background, in: RoundedRectangle(cornerRadius: 12)).clipShape(RoundedRectangle(cornerRadius: 12))
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
                .accessibilityLabel("Canvas, step \(index) of \(history.count - 1)")
                HStack(spacing: 6) {
                    Button("Nudge right") { act { $0.x = min($0.x + 60, 240) } }
                    Button("Grow") { act { $0.size = min($0.size + 20, 120) } }
                    Button("Recolor") { act { $0.color = ($0.color + 1) % 3 } }
                    Spacer()
                    Button { step(-1) } label: { Image(systemName: "arrow.uturn.backward") }.disabled(index == 0).accessibilityLabel("Undo")
                    Button { step(1) } label: { Image(systemName: "arrow.uturn.forward") }.disabled(index >= history.count - 1).accessibilityLabel("Redo")
                }
                .buttonStyle(.bordered).controlSize(.small)
                Text("Step \(index) of \(history.count - 1)").font(.caption).foregroundStyle(.secondary).monospacedDigit()
            }
            .frame(maxWidth: 340)
        }
    }

    private func act(_ change: (inout Shape) -> Void) {
        var next = history[index]
        change(&next)
        let from = history[index]
        history = Array(history.prefix(index + 1)) + [next]
        index += 1
        apply(from: from)
    }

    private func step(_ d: Int) {
        let from = history[index]
        index += d
        apply(from: from)
    }

    private func apply(from: Shape) {
        let s = history[index]
        DataMotion.retarget(&xT, to: s.x, reduce: reduce)
        DataMotion.retarget(&sT, to: s.size, reduce: reduce)
        DataMotion.retarget(&cT, to: Double(s.color), reduce: reduce)
        ghost = from; ghostAt = DataMotion.now
    }
}
