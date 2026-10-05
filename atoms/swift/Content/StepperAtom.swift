import SwiftUI
import MotionKit

public struct StepperAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stepper", category: "Content", name: "Stepper",
        summary: "The connector fills first, then the next node inks in after the lag. Completed nodes swap their number for a check.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var forward = true
    private let labels = ["Account", "Domain", "Theme", "Publish"]
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(spacing: 18) {
                GeometryReader { g in
                    let span = g.size.width - 30
                    ZStack(alignment: .topLeading) {
                        Capsule().fill(.quaternary).frame(width: span, height: 2).offset(x: 15, y: 14)
                        Capsule().fill(.primary).frame(width: span * CGFloat(step) / 3, height: 2).offset(x: 15, y: 14)
                            .animation(reduce ? nil : .motion(.base), value: step)
                        ForEach(labels.indices, id: \.self) { i in
                            node(i).offset(x: span * CGFloat(i) / 3)
                        }
                    }
                }
                .frame(height: 30)
                HStack {
                    ForEach(labels, id: \.self) { l in
                        Text(l).font(.caption).foregroundStyle(.secondary).frame(maxWidth: .infinity)
                    }
                }
                HStack {
                    Spacer()
                    Button("Back") { go(step - 1) }.buttonStyle(.bordered).disabled(step == 0)
                    Button("Next") { go(step + 1) }.buttonStyle(.borderedProminent).disabled(step == 3)
                }
            }
            .frame(maxWidth: 360)
        }
    }

    private func node(_ i: Int) -> some View {
        let inked = i <= step, done = i < step
        return ZStack {
            Circle().fill(inked ? Color.primary : Color.primary.opacity(0.08))
            Circle().strokeBorder(inked ? Color.primary : Color.primary.opacity(0.2), lineWidth: 2)
            ZStack {
                if done {
                    Image(systemName: "checkmark").font(.caption.weight(.bold))
                        .transition(reduce ? .identity : .motionSwap(drift: 0))
                } else {
                    Text("\(i + 1)").font(.footnote.weight(.semibold))
                        .transition(reduce ? .identity : .motionSwap(drift: 0))
                }
            }
            .foregroundStyle(inked ? AnyShapeStyle(.background) : AnyShapeStyle(.secondary))
        }
        .frame(width: 30, height: 30)
        .animation(reduce ? nil : .motion(.base).delay(forward ? Motion.lag * 2 : 0), value: inked)
        .animation(reduce ? nil : .motion(.base), value: done)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(labels[i]), step \(i + 1)")
        .accessibilityValue(done ? "Completed" : (i == step ? "Current" : "Upcoming"))
    }

    private func go(_ s: Int) {
        guard (0..<labels.count).contains(s) else { return }
        forward = s > step
        step = s
    }
}
