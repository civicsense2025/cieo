import SwiftUI
import MotionKit

public struct SatisfactionFacesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "csat", category: "Forms", name: "Satisfaction faces",
        summary: "One large face holds a continuous mood value. Its mouth curve and eye height follow the hovered or chosen score on a spring, so moving across the scale reads as one expression changing.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var mood = Track(0.5)
    @State private var sel: Int?
    @State private var shownLabel = ""
    private let names = ["Very unhappy", "Unhappy", "Neutral", "Happy", "Very happy"]
    public init() {}

    private func now() -> Double { Date().timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage {
            VStack(spacing: 14) {
                TimelineView(.animation(paused: reduce)) { ctx in
                    Face(mood: mood.value(at: ctx.date.timeIntervalSinceReferenceDate)).frame(width: 64, height: 64)
                }
                .accessibilityHidden(true)
                HStack(spacing: 6) {
                    ForEach(names.indices, id: \.self) { i in
                        let on = sel == i
                        Text("\(i + 1)").font(.callout.weight(.semibold))
                            .foregroundStyle(on ? AnyShapeStyle(.background) : AnyShapeStyle(.primary))
                            .frame(width: 40, height: 40)
                            .background(RoundedRectangle(cornerRadius: 9).fill(on ? Color.primary : Color.primary.opacity(0.08)))
                            .motion(.snap, value: on)
                            .contentShape(Rectangle())
                            .onHover { hovering in
                                target(hovering ? i : sel)
                                shownLabel = hovering ? names[i] : (sel.map { names[$0] } ?? "")
                            }
                            .onTapGesture {
                                sel = i
                                target(i)
                                shownLabel = names[i]
                            }
                            .accessibilityElement(children: .ignore)
                            .accessibilityLabel(names[i])
                            .accessibilityAddTraits(on ? [.isButton, .isSelected] : .isButton)
                            .accessibilityAction { sel = i; target(i); shownLabel = names[i] }
                    }
                }
                SwapText(shownLabel).font(.footnote).foregroundStyle(.secondary).frame(height: 20)
            }
        }
    }

    private func target(_ i: Int?) {
        let to = i.map { Double($0) / 4 } ?? 0.5
        if reduce { mood.jump(to) } else { mood.set(to, at: now()) }
    }

    private struct Face: View {
        let mood: Double
        var body: some View {
            Canvas { c, size in
                let k = size.width / 64
                let curve = -8 + 18 * mood
                c.stroke(Path(ellipseIn: CGRect(x: 3 * k, y: 3 * k, width: 58 * k, height: 58 * k)), with: .color(.primary), lineWidth: 2.5 * k)
                let ey = 26 - 2 * mood
                for x in [23.0, 41.0] {
                    c.fill(Path(ellipseIn: CGRect(x: (x - 3) * k, y: (ey - 3) * k, width: 6 * k, height: 6 * k)), with: .color(.primary))
                }
                var mouth = Path()
                mouth.move(to: CGPoint(x: 20 * k, y: (42 - curve * 0.3) * k))
                mouth.addQuadCurve(to: CGPoint(x: 44 * k, y: (42 - curve * 0.3) * k), control: CGPoint(x: 32 * k, y: (42 + curve) * k))
                c.stroke(mouth, with: .color(.primary), style: StrokeStyle(lineWidth: 2.75 * k, lineCap: .round))
            }
        }
    }
}
