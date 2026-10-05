import SwiftUI
import Cieo

public struct RadioGroupAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "radio", category: "Inputs", name: "Radio group",
        summary: "The inner dot grows from the center of the new choice while the old one shrinks, on the same spring. Arrow keys move the choice.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var picked = 1
    @FocusState private var focused: Bool
    private let options = ["Daily", "Weekly", "Never"]
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(alignment: .leading, spacing: 10) {
                Text("Email digest").font(.footnote.weight(.semibold))
                ForEach(options.indices, id: \.self) { i in
                    let on = picked == i
                    Button { pick(i) } label: {
                        HStack(spacing: 10) {
                            ZStack {
                                Circle().strokeBorder(on ? Color.primary : Color.primary.opacity(0.25), lineWidth: 2)
                                Circle().fill(.primary).padding(3).scaleEffect(on ? 1 : 0.001)
                            }
                            .frame(width: 20, height: 20)
                            .motion(.snap, value: picked)
                            Text(options[i]).font(.callout)
                        }
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityAddTraits(on ? .isSelected : [])
                }
            }
            .focusable().focused($focused)
            .onKeyPress(.downArrow) { pick(picked + 1); return .handled }
            .onKeyPress(.rightArrow) { pick(picked + 1); return .handled }
            .onKeyPress(.upArrow) { pick(picked - 1); return .handled }
            .onKeyPress(.leftArrow) { pick(picked - 1); return .handled }
            .accessibilityElement(children: .contain)
            .accessibilityLabel("Email digest")
        }
    }

    private func pick(_ i: Int) { picked = (i + options.count) % options.count }
}
