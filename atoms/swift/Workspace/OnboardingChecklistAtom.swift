import SwiftUI
import MotionKit

public struct OnboardingChecklistAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "onboarding", category: "Workspace", name: "Onboarding checklist",
        summary: "Start setup swaps the welcome card for the checklist while the card height springs to fit. Opening a task slides its body out in place. Mark done runs in order: box fills, check draws, strike runs through, then 40ms later the ring fills and the count rolls, then the task closes and the next one opens. When the fourth lands the checklist fades, the card shrinks around the finished state, and the success circle draws, then its check, then the message, then Continue. No confetti.")

    private enum Stage { case welcome, list, done }
    private let tasks = ["Name your site", "Add a first page", "Connect a domain", "Invite a teammate"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var stage = Stage.welcome
    @State private var done = [false, false, false, false]
    @State private var open: Int? = 0
    @State private var finished = false
    public init() {}

    private var count: Int { done.filter { $0 }.count }

    public var body: some View {
        AtomStage(hint: "Start setup and mark tasks done") {
            VStack(spacing: 0) {
                switch stage {
                case .welcome:
                    VStack(spacing: 8) { Text("Welcome aboard").font(.headline); Text("Four quick steps get your site ready.").font(.footnote).foregroundStyle(.secondary)
                        Button("Start setup") { withMotion(.base, reduceMotion: reduce) { stage = .list } }.buttonStyle(.borderedProminent).controlSize(.small) }.transition(reduce ? .identity : .motionSwap())
                case .list:
                    VStack(alignment: .leading, spacing: 0) {
                        HStack { Text("Setup").font(.footnote.weight(.semibold)); Spacer(); Text("\(count) of 4").font(.caption).foregroundStyle(.secondary)
                            Circle().trim(from: 0, to: Double(count) / 4).stroke(Color.accentColor, style: StrokeStyle(lineWidth: 3, lineCap: .round)).rotationEffect(.degrees(-90)).frame(width: 20, height: 20)
                                .background(Circle().stroke(.quaternary, lineWidth: 3)).animation(reduce ? nil : .motion(.base).delay(0.12), value: count) }.padding(.bottom, 8)
                        ForEach(tasks.indices, id: \.self) { i in task(i) }
                    }.transition(reduce ? .identity : .motionSwap())
                case .done:
                    VStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill").font(.system(size: 40)).foregroundStyle(.green).scaleEffect(finished ? 1 : 0.5).opacity(finished ? 1 : 0).animation(reduce ? nil : .motion(.base).delay(0.1), value: finished)
                        Text("You’re all set").font(.headline).opacity(finished ? 1 : 0).animation(reduce ? nil : .motion(.base).delay(0.25), value: finished)
                        Button("Continue") {}.buttonStyle(.borderedProminent).controlSize(.small).opacity(finished ? 1 : 0).animation(reduce ? nil : .motion(.base).delay(0.35), value: finished)
                    }.transition(reduce ? .identity : .motionSwap())
                }
            }
            .padding(16).frame(width: 300).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14)).animation(reduce ? nil : .motion(.base), value: stage).animation(reduce ? nil : .motion(.base), value: open)
        }
    }

    private func task(_ i: Int) -> some View {
        let d = done[i]
        return VStack(alignment: .leading, spacing: 6) {
            Button { withMotion(.base, reduceMotion: reduce) { open = open == i ? nil : i } } label: {
                HStack(spacing: 8) {
                    ZStack { Circle().strokeBorder(.quaternary, lineWidth: 2); Circle().fill(Color.green).opacity(d ? 1 : 0)
                        Image(systemName: "checkmark").font(.system(size: 9, weight: .bold)).foregroundStyle(.white).opacity(d ? 1 : 0).animation(reduce ? nil : .motion(.base).delay(0.04), value: d) }.frame(width: 18, height: 18)
                    Text(tasks[i]).font(.footnote).foregroundStyle(d ? .secondary : .primary)
                        .overlay(alignment: .leading) { GeometryReader { g in Rectangle().fill(.secondary).frame(width: d ? g.size.width : 0, height: 1).offset(y: g.size.height / 2) }.animation(reduce ? nil : .motion(.base).delay(0.08), value: d) }
                    Spacer()
                }
            }.buttonStyle(.plain).padding(.vertical, 6)
            if open == i && !d {
                HStack { Text("A short note on how to do this step.").font(.caption).foregroundStyle(.secondary); Spacer()
                    Button("Mark done") { complete(i) }.controlSize(.small).buttonStyle(.bordered) }.padding(.leading, 26).transition(.opacity.combined(with: .move(edge: .top)))
            }
        }.animation(reduce ? nil : .motion(.base), value: d)
    }

    private func complete(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) { done[i] = true }
        Task {
            try? await Task.sleep(for: .seconds(0.35))
            if done.allSatisfy({ $0 }) {
                withMotion(.base, reduceMotion: reduce) { stage = .done }
                try? await Task.sleep(for: .seconds(0.2)); finished = true
            } else { withMotion(.base, reduceMotion: reduce) { open = done.firstIndex(of: false) } }
        }
    }
}
