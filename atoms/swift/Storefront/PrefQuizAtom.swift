import SwiftUI
import Cieo

public struct PrefQuizAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "prefquiz", category: "Storefront", name: "Preference quiz",
        summary: "Cards slide in the direction of travel with a blur swap while progress fills. The result swaps into a mini shelf that holds as the terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var dir: CGFloat = 1
    public init() {}
    public var body: some View {
        AtomStage(hint: "Answer two questions for a shelf") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Find your fit").font(.callout.weight(.semibold))
                GeometryReader { g in
                    Capsule().fill(.quaternary).overlay(alignment: .leading) {
                        Capsule().fill(Color.primary).frame(width: g.size.width * CGFloat(step) / 2).motion(.base, value: step)
                    }
                }.frame(height: 4).accessibilityLabel("Quiz progress step \(step) of 2")
                ZStack(alignment: .topLeading) {
                    if step == 0 { qcard("Weekend uniform?", ["Trail", "Street"]) }
                    else if step == 1 { qcard("Palette?", ["Earth", "Ink"]) }
                    else {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Your shelf").font(.footnote.weight(.semibold))
                            HStack(spacing: 8) {
                                RoundedRectangle(cornerRadius: 12).fill(.quaternary).frame(height: 66).overlay(Text("Trail").font(.caption2).foregroundStyle(.secondary))
                                RoundedRectangle(cornerRadius: 12).fill(.quaternary).frame(height: 66).overlay(Text("Earth").font(.caption2).foregroundStyle(.secondary))
                            }
                            Text("2 picks · prices from $32.").font(.caption2).foregroundStyle(.secondary)
                            Button("Retake") { dir = -1; withMotion(.base, reduceMotion: reduce) { step = 0 } }.buttonStyle(.bordered).controlSize(.small)
                        }.padding(14).background(.background, in: RoundedRectangle(cornerRadius: 12)).overlay(RoundedRectangle(cornerRadius: 12).stroke(.quaternary))
                    }
                }.frame(height: 170).clipped()
                .transition(reduce ? .identity : .asymmetric(
                    insertion: .modifier(active: QuizSlide(x: 24 * dir), identity: QuizSlide(x: 0)).animation(.motion(.base).delay(Motion.exit)),
                    removal: .modifier(active: QuizSlide(x: -24 * dir), identity: QuizSlide(x: 0)).animation(.motionExit)))
                .id(step)
                Toggle("Restart when done", isOn: .constant(false)).font(.caption).foregroundStyle(.secondary)
            }.frame(width: 320)
        }
    }
    private func qcard(_ q: String, _ answers: [String]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(q).font(.footnote.weight(.semibold))
            ForEach(answers, id: \.self) { a in
                Button(a) { dir = 1; withMotion(.base, reduceMotion: reduce) { step += 1 } }.buttonStyle(.bordered).controlSize(.small)
            }
        }.padding(14).background(.background, in: RoundedRectangle(cornerRadius: 12)).overlay(RoundedRectangle(cornerRadius: 12).stroke(.quaternary))
    }
}

private struct QuizSlide: ViewModifier {
    let x: CGFloat
    func body(content: Content) -> some View { content.offset(x: x).blur(radius: x == 0 ? 0 : 4).opacity(x == 0 ? 1 : 0) }
}
