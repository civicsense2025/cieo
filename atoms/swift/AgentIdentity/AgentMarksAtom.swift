import SwiftUI
import MotionKit

public struct AgentMarksAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentmarks", category: "Agent identity", name: "Agent mark concepts",
        summary: "Five agent marks drawn from Arc’s own vocabulary instead of a generic sparkle: a turning arc, the review tool’s lens, the orbit eye, the path and the invitation frame. Each shows its brand form (paper tile, one wash, 1.7 ink line) and its product form at 32, 24 and 16px as a square outline that inherits text colour. Working turns on each mark’s own motion. Picking a card updates the presence chip, pin and byline below so you judge it in context.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pick = 0
    @State private var working = false
    public init() {}

    private let names = ["Arc", "Lens", "Orbit eye", "Path", "Invitation"]

    public var body: some View {
        AtomStage(hint: "Pick a mark to see it in context") {
            VStack(alignment: .leading, spacing: 10) {
                HStack { Toggle("Working", isOn: $working).toggleStyle(.switch); Spacer() }
                HStack(spacing: 8) {
                    ForEach(names.indices, id: \.self) { i in
                        Button { withMotion(.base, reduceMotion: reduce) { pick = i } } label: {
                            VStack(spacing: 6) {
                                mark(i, size: 56, brand: true)
                                HStack(alignment: .bottom, spacing: 4) { mark(i, size: 32, brand: false); mark(i, size: 24, brand: false); mark(i, size: 16, brand: false) }
                                Text(names[i]).font(.caption2)
                            }
                            .padding(6).background(pick == i ? Color.accentColor.opacity(0.14) : .clear, in: RoundedRectangle(cornerRadius: 10))
                            .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(pick == i ? Color.accentColor : Color.secondary.opacity(0.3)))
                        }.buttonStyle(.plain).accessibilityLabel(names[i]).accessibilityAddTraits(pick == i ? .isSelected : [])
                    }
                }
                HStack(spacing: 10) {
                    HStack(spacing: 4) { mark(pick, size: 16, brand: false); Text("Assistant"); AgentTag() }.font(.caption).padding(6).background(.quaternary, in: Capsule())
                    AgPinMark(label: "1")
                    HStack(spacing: 4) { Text("MR").font(.caption2.weight(.bold)).frame(width: 20, height: 20).background(.quaternary, in: Circle()); Text("Maya") }.font(.caption)
                }
            }
        }
    }

    private func mark(_ k: Int, size: CGFloat, brand: Bool) -> some View {
        TimelineView(.animation(paused: reduce || !working)) { ctx in
            let t = reduce || !working ? 0 : ctx.date.timeIntervalSinceReferenceDate
            let ink = Color.primary, lw = max(1.2, size * 0.06)
            ZStack {
                if brand { RoundedRectangle(cornerRadius: size * 0.22).fill(Color.green.opacity(0.18)) }
                Group {
                    switch k {
                    case 0:
                        Circle().stroke(ink, lineWidth: lw).padding(size * 0.2)
                        Ellipse().stroke(ink, lineWidth: lw).frame(width: size * 0.7, height: size * 0.26).rotationEffect(.degrees(-20 + t * 90))
                    case 1:
                        Circle().stroke(ink, lineWidth: lw).frame(width: size * 0.5, height: size * 0.5).offset(x: -size * 0.06, y: -size * 0.06)
                        Capsule().fill(ink).frame(width: lw, height: size * 0.24).rotationEffect(.degrees(-45)).offset(x: size * 0.22, y: size * 0.22)
                        Circle().fill(ink).frame(width: size * 0.1).offset(x: -size * 0.06 + CGFloat(cos(t * 3)) * size * 0.1, y: -size * 0.06 + CGFloat(sin(t * 3)) * size * 0.1)
                    case 2:
                        Ellipse().stroke(ink, lineWidth: lw).frame(width: size * 0.7, height: size * 0.42)
                        Circle().fill(ink).frame(width: size * 0.18).offset(x: CGFloat(sin(t * 2)) * size * 0.12)
                    case 3:
                        Path { p in p.move(to: CGPoint(x: size * 0.2, y: size * 0.75)); p.addCurve(to: CGPoint(x: size * 0.8, y: size * 0.25), control1: CGPoint(x: size * 0.2, y: size * 0.2), control2: CGPoint(x: size * 0.8, y: size * 0.8)) }
                            .stroke(ink, style: StrokeStyle(lineWidth: lw, lineCap: .round))
                        Circle().fill(ink).frame(width: size * 0.12).position(x: size * 0.2, y: size * 0.75)
                        Rectangle().fill(ink).frame(width: size * 0.12, height: size * 0.12).position(x: size * (0.2 + 0.6 * ((sin(t * 2) + 1) / 2)), y: size * (0.75 - 0.5 * ((sin(t * 2) + 1) / 2)))
                    default:
                        let g = size * (0.26 + CGFloat(sin(t * 2.5)) * 0.03)
                        ForEach(0..<4, id: \.self) { c in
                            Path { p in p.move(to: CGPoint(x: 0, y: size * 0.14)); p.addLine(to: .zero); p.addLine(to: CGPoint(x: size * 0.14, y: 0)) }
                                .stroke(ink, style: StrokeStyle(lineWidth: lw, lineCap: .round)).frame(width: size * 0.14, height: size * 0.14)
                                .rotationEffect(.degrees(Double(c) * 90)).offset(x: c == 0 || c == 3 ? -g : g, y: c < 2 ? -g : g)
                        }
                        Circle().fill(ink).frame(width: size * 0.12)
                    }
                }
            }
            .frame(width: size, height: size)
        }
        .accessibilityHidden(true)
    }
}
