import SwiftUI
import Cieo

public struct SurveyBlockAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "surveyblock", category: "Newsletter", name: "Reader survey",
        summary: "Panels slide sideways between questions while progress fills. Thanks morphs to a success tint with a counted total.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    private let questions = [
        ("How often do you open us?", ["Every week", "Monthly", "Rarely"]),
        ("What do you want more of?", ["Rivers", "Kitchens", "Maps"]),
    ]
    public init() {}

    private var finished: Bool { step >= questions.count }

    public var body: some View {
        AtomStage(hint: "Answer twice") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Two quick questions").font(.callout.weight(.semibold))
                GeometryReader { geo in
                    Capsule().fill(.quaternary)
                        .overlay(alignment: .leading) {
                            Capsule().fill(.primary)
                                .frame(width: geo.size.width * CGFloat(step) / CGFloat(questions.count))
                                .animation(reduce ? nil : .motion(.base), value: step)
                        }
                }.frame(height: 6)
                ZStack {
                    if !finished {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(questions[step].0).font(.footnote.weight(.semibold)).id("q\(step)")
                            ForEach(questions[step].1, id: \.self) { o in
                                Button(o) {
                                    withMotion(.base, reduceMotion: reduce) { step += 1 }
                                }
                                .buttonStyle(.bordered).controlSize(.regular)
                                .frame(maxWidth: .infinity, minHeight: 44)
                            }
                        }
                        .motionTransition(.swap())
                        .id(step)
                    } else {
                        Label("Thanks — counted. You're reader 128.", systemImage: "checkmark")
                            .font(.footnote.weight(.semibold)).foregroundStyle(.green)
                            .motionTransition(.swap())
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: step)
                .frame(minHeight: 150)
                Button("Reset") { withMotion(.snap, reduceMotion: reduce) { step = 0 } }
                    .font(.caption).buttonStyle(.borderless)
            }
            .padding(16).frame(maxWidth: 340)
            .background(finished ? Color.green.opacity(0.15) : Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 14))
            .animation(reduce ? nil : .motion(.base), value: finished)
            .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
        }
    }
}
