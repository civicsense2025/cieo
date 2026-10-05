import SwiftUI
import MotionKit

public struct PrizeWheelAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "spinwheel", category: "Newsletter", name: "Prize wheel",
        summary: "The wheel turns on a slow critically damped spring toward a precomputed angle, so it decelerates smoothly and stops without rocking back. The result swaps in once it settles.")

    private let prizes = ["10% off", "Free shipping", "15% off", "Free gift", "20% off", "Early access"]
    private let slow = SpringPreset(w: 1.8)
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var angle = Track(0, preset: SpringPreset(w: 1.8))
    @State private var spinning = false
    @State private var result = "Spin for a welcome offer"
    @State private var settle: Task<Void, Never>?
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Spin once") {
            VStack(spacing: 12) {
                ZStack {
                    TimelineView(.animation(paused: !angle.isMoving)) { tl in
                        wheel.rotationEffect(.degrees(angle.value(at: tl.date.timeIntervalSinceReferenceDate)))
                    }.frame(width: 200, height: 200).accessibilityHidden(true)
                    Triangle().fill(.primary).frame(width: 16, height: 14).offset(y: -106)
                    Button("Spin", action: spin).buttonStyle(.borderedProminent).clipShape(Circle())
                        .controlSize(.large).disabled(spinning)
                }
                SwapText(result).font(.footnote.weight(result.hasPrefix("You won") ? .semibold : .regular))
                    .foregroundStyle(result.hasPrefix("You won") ? Color.green : .secondary).frame(height: 20)
            }
        }
    }

    private var wheel: some View {
        let seg = 360.0 / Double(prizes.count)
        return ZStack {
            ForEach(prizes.indices, id: \.self) { i in
                Wedge(start: Double(i) * seg - seg / 2 - 90, end: Double(i + 1) * seg - seg / 2 - 90)
                    .fill(i % 3 == 0 ? Color.secondary.opacity(0.2) : i % 3 == 1 ? Color.secondary.opacity(0.08) : Color.accentColor.opacity(0.18))
                Wedge(start: Double(i) * seg - seg / 2 - 90, end: Double(i + 1) * seg - seg / 2 - 90).stroke(.quaternary)
                Text(prizes[i]).font(.system(size: 9.5, weight: .semibold))
                    .frame(width: 60).offset(y: -62).rotationEffect(.degrees(Double(i) * seg))
            }
        }
    }

    private func spin() {
        guard !spinning else { return }
        spinning = true
        let seg = 360.0 / Double(prizes.count), win = Int.random(in: 0..<prizes.count)
        let from = angle.target, target = (from / 360).rounded(.up) * 360 + 5 * 360 - Double(win) * seg
        withMotion(.base, reduceMotion: reduce) { result = "Spinning…" }
        if reduce { angle.jump(target); finish(win) ; return }
        angle.set(target, at: now())
        let wait = slow.settleTime(epsilon: 0.3 / abs(target - from))
        settle = Task { try? await Task.sleep(for: .seconds(wait)); if !Task.isCancelled { finish(win) } }
    }

    private func finish(_ win: Int) {
        spinning = false
        result = "You won: \(prizes[win])"
    }
}

private struct Wedge: Shape {
    let start: Double, end: Double
    func path(in r: CGRect) -> Path {
        var p = Path(); let c = CGPoint(x: r.midX, y: r.midY)
        p.move(to: c)
        p.addArc(center: c, radius: r.width / 2 - 4, startAngle: .degrees(start), endAngle: .degrees(end), clockwise: false)
        p.closeSubpath(); return p
    }
}

private struct Triangle: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path(); p.move(to: CGPoint(x: r.minX, y: r.minY)); p.addLine(to: CGPoint(x: r.maxX, y: r.minY))
        p.addLine(to: CGPoint(x: r.midX, y: r.maxY)); p.closeSubpath(); return p
    }
}
