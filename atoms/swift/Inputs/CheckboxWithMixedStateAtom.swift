import SwiftUI
import MotionKit

public struct CheckboxWithMixedStateAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "checkbox", category: "Inputs", name: "Checkbox with mixed state",
        summary: "The parent box morphs its check into a dash when only some children are on. The three points of the check slide to a flat line on one spring, with no swap.")
    @State private var kids = [true, false, false]
    private let names = ["Photos", "Documents", "Audio"]
    public init() {}

    private var onCount: Int { kids.filter { $0 }.count }

    public var body: some View {
        AtomStage {
            VStack(alignment: .leading, spacing: 8) {
                Box(on: onCount > 0, mixed: onCount > 0 && onCount < kids.count, title: "All files", bold: true) {
                    let all = onCount == kids.count
                    kids = kids.map { _ in !all }
                }
                .accessibilityValue(onCount == kids.count ? "Checked" : onCount > 0 ? "Mixed" : "Unchecked")
                ForEach(kids.indices, id: \.self) { i in
                    Box(on: kids[i], mixed: false, title: names[i], bold: false) { kids[i].toggle() }
                        .padding(.leading, 28)
                }
            }
            .frame(minWidth: 200, alignment: .leading)
        }
    }

    private struct Box: View {
        @Environment(\.accessibilityReduceMotion) private var reduce
        let on: Bool
        let mixed: Bool
        let title: String
        let bold: Bool
        let action: () -> Void
        var body: some View {
            Button(action: action) {
                HStack(spacing: 10) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 5).fill(on ? Color.primary : Color.clear)
                        RoundedRectangle(cornerRadius: 5).strokeBorder(on ? Color.primary : Color.primary.opacity(0.25), lineWidth: 1.5)
                        Mark(mixed: mixed ? 1 : 0)
                            .stroke(.background, style: StrokeStyle(lineWidth: 2.6, lineCap: .round, lineJoin: .round))
                            .frame(width: 14, height: 14)
                            .opacity(on ? 1 : 0).scaleEffect(on ? 1 : 0.5)
                    }
                    .frame(width: 18, height: 18)
                    .animation(reduce ? nil : .motion(.base), value: on)
                    .animation(reduce ? nil : .motion(.base), value: mixed)
                    Text(title).font(.callout).fontWeight(bold ? .semibold : .regular)
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityAddTraits(.isToggle)
        }
    }

    /// A check whose three points slide to a flat dash as `mixed` goes from 0 to 1.
    private struct Mark: Shape {
        var mixed: Double
        var animatableData: Double {
            get { mixed }
            set { mixed = newValue }
        }
        func path(in r: CGRect) -> Path {
            let check: [(Double, Double)] = [(5, 12.5), (10, 17.5), (19, 7)], dash: [(Double, Double)] = [(6, 12), (12, 12), (18, 12)]
            let pts = zip(check, dash).map { c, d in
                CGPoint(x: r.width * (c.0 + (d.0 - c.0) * mixed) / 24, y: r.height * (c.1 + (d.1 - c.1) * mixed) / 24)
            }
            var p = Path()
            p.move(to: pts[0])
            p.addLine(to: pts[1])
            p.addLine(to: pts[2])
            return p
        }
    }
}
