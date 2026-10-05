import SwiftUI
import MotionKit

public struct DonutAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "donut", category: "Data", name: "Donut",
        summary: "Segments sweep in together on one spring. Hovering a segment thickens it and swaps the center label.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let parts: [(name: String, value: Double, color: Color)] = [("Direct", 42, .primary), ("Search", 28, .secondary), ("Social", 18, .accentColor), ("Email", 12, Color.primary.opacity(0.15))]
    @State private var draw = Track(0, preset: .lazy)
    @State private var widths = Array(repeating: Track(16, preset: .snap), count: 4)
    @State private var active = -1
    public init() {}

    private func hover(_ i: Int) {
        active = i
        for j in widths.indices { DataMotion.retarget(&widths[j], to: j == i ? 22 : 16, reduce: reduce) }
    }

    private func segment(at p: CGPoint, in size: CGSize) -> Int {
        let dx = p.x - size.width / 2, dy = p.y - size.height / 2, r = hypot(dx, dy)
        guard abs(r - 60 / 160 * size.width) < 16 else { return -1 }
        var a = atan2(dy, dx) + .pi / 2; if a < 0 { a += 2 * .pi }
        var s = 0.0
        for (i, part) in parts.enumerated() { s += part.value; if a / (2 * .pi) * 100 <= s { return i } }
        return -1
    }

    public var body: some View {
        AtomStage(hint: "Hover or tap a segment") {
            VStack(spacing: 14) {
                HStack(spacing: 22) {
                    ring
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(parts.indices, id: \.self) { i in
                            HStack(spacing: 8) {
                                RoundedRectangle(cornerRadius: 3).fill(parts[i].color).frame(width: 10, height: 10)
                                Text(parts[i].name)
                            }
                            .font(.caption).contentShape(Rectangle())
                            .onHover { hover($0 ? i : -1) }
                            .onTapGesture { hover(active == i ? -1 : i) }
                        }
                    }
                }
                Button("Replay") { draw.jump(0); DataMotion.retarget(&draw, to: 1, reduce: reduce) }.buttonStyle(.bordered)
            }
        }
        .onAppear { draw.jump(0); DataMotion.retarget(&draw, to: 1, reduce: reduce) }
    }

    private var ring: some View {
        TimelineView(.animation) { ctx in
            let t = ctx.date.timeIntervalSinceReferenceDate
            let p = max(0, min(1, draw.value(at: t)))
            ZStack {
                Canvas { c, size in
                    var s = 0.0
                    let rect = CGRect(x: 0, y: 0, width: size.width, height: size.height).insetBy(dx: size.width * 20 / 160, dy: size.height * 20 / 160)
                    for i in parts.indices {
                        let from = s * p / 100, len = max(0, parts[i].value * p - 0.8) / 100
                        var path = Path()
                        path.addArc(center: CGPoint(x: rect.midX, y: rect.midY), radius: rect.width / 2, startAngle: .degrees(-90 + from * 360), endAngle: .degrees(-90 + (from + len) * 360), clockwise: false)
                        c.stroke(path, with: .color(parts[i].color), lineWidth: widths[i].value(at: t) * size.width / 160)
                        s += parts[i].value
                    }
                }
                Group {
                    VStack(spacing: 0) {
                        Text(active < 0 ? "100%" : "\(Int(parts[active].value))%").font(.title2.weight(.semibold)).monospacedDigit()
                        Text(active < 0 ? "Total" : parts[active].name).font(.caption).foregroundStyle(.secondary)
                    }
                    .id(active).motionTransition(.swap())
                }
                .animation(reduce ? nil : .motion(.base), value: active)
            }
            .frame(width: 150, height: 150)
            .contentShape(Circle())
            .onContinuousHover { phase in
                if case .active(let p) = phase { hover(segment(at: p, in: CGSize(width: 150, height: 150))) } else { hover(-1) }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Traffic sources")
        .accessibilityValue(parts.map { "\($0.name) \(Int($0.value))%" }.joined(separator: ", "))
    }
}
