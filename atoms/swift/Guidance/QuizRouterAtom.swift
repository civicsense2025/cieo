import SwiftUI
import Cieo

public struct QuizRouterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "quizrouter", category: "Guidance", name: "Goal router",
        summary: "Tapping a goal dips the card, then swaps to the branch that goal routes to while the step rolls forward. Every path ends in a terminal with a start-over.")

    private let goals = ["Ship faster", "Look sharper", "Stay organized"]
    private let paces = ["A calm weekly digest", "A brisk daily briefing"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var goal = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a goal — the next card is routed to it") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .firstTextBaseline) {
                        Text("Welcome").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                        Spacer()
                        Text("\(min(step + 1, 2)) of 2").font(.caption).foregroundStyle(.secondary).monospacedDigit().id(step).motionTransition(.swap())
                    }
                    ZStack(alignment: .topLeading) {
                        if step == 0 {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("What brings you here?").font(.system(size: 13)).lineSpacing(3)
                                ForEach(goals.indices, id: \.self) { g in
                                    Button { pick(g) } label: {
                                        Text(goals[g]).font(.system(size: 14)).frame(maxWidth: .infinity, alignment: .leading)
                                            .padding(.horizontal, 12).padding(.vertical, 8)
                                            .background(.background, in: RoundedRectangle(cornerRadius: 9))
                                    }.buttonStyle(.plain).frame(minHeight: 36)
                                }
                            }.id("q0").motionTransition(.swap())
                        } else if step == 1 {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("For **\(goals[goal].lowercased())** — pick a pace.").font(.system(size: 13)).lineSpacing(3)
                                ForEach(paces.indices, id: \.self) { p in
                                    Button { finish() } label: {
                                        Text(paces[p]).font(.system(size: 14)).frame(maxWidth: .infinity, alignment: .leading)
                                            .padding(.horizontal, 12).padding(.vertical, 8)
                                            .background(.background, in: RoundedRectangle(cornerRadius: 9))
                                    }.buttonStyle(.plain).frame(minHeight: 36)
                                }
                            }.id("q\(goal)").motionTransition(.swap())
                        } else {
                            VStack(spacing: 4) {
                                Text("You are set ✓").font(.system(size: 14, weight: .semibold)).foregroundStyle(.green)
                                Text("\(goals[goal]) · changeable anytime.").font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
                                Button("Start over") { withMotion(.base, reduceMotion: reduce) { step = 0 } }
                                    .buttonStyle(.bordered).controlSize(.small).padding(.top, 2)
                            }.frame(maxWidth: .infinity).id("done").motionTransition(.swap())
                        }
                    }.frame(minHeight: 172, alignment: .top)
                }
                .padding(.horizontal, 14).padding(.vertical, 14)
                .frame(width: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                HStack(spacing: 6) {
                    Text("Jump:").font(.caption).foregroundStyle(.secondary)
                    Button("1") { withMotion(.base, reduceMotion: reduce) { step = 0 } }.buttonStyle(.bordered).controlSize(.mini)
                    Button("2") { withMotion(.base, reduceMotion: reduce) { step = 1 } }.buttonStyle(.bordered).controlSize(.mini)
                    Button("Done") { finish() }.buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
    }

    private func pick(_ g: Int) {
        withMotion(.base, reduceMotion: reduce) { goal = g; step = 1 }
    }

    private func finish() {
        withMotion(.base, reduceMotion: reduce) { step = 2 }
    }
}
