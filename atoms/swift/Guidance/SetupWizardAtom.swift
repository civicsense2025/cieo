import SwiftUI
import Cieo

public struct SetupWizardAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "setupwizard", category: "Guidance", name: "Setup wizard",
        summary: "The segmented thumb trails across three or four steps while panels swap in the direction of travel. Team and personal branch apart; Done and Skipped both hold as terminals.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var team = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Paths branch · Skip lands softly") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Set up your space").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                    HStack(spacing: 4) {
                        ForEach(0..<4, id: \.self) { i in
                            RoundedRectangle(cornerRadius: 3)
                                .fill(i <= min(step, 3) ? Color.accentColor : Color.primary.opacity(0.1))
                                .frame(height: 6)
                        }
                    }.animation(reduce ? nil : .motion(.base).delay(0.06), value: step)
                    ZStack(alignment: .topLeading) {
                        switch step {
                        case 0:
                            wizardText(title: "Welcome in", body: "Four small choices and your space runs itself.").id(0).motionTransition(.swap())
                        case 1:
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Who is this for?").font(.system(size: 14)).lineSpacing(3)
                                pickButton("Just me", "A quiet personal desk.") { team = false; go(2) }
                                pickButton("My team", "Shared queues and roles.") { team = true; go(3) }
                            }.id(1).motionTransition(.swap())
                        case 2:
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Pick a theme").font(.system(size: 14)).lineSpacing(3)
                                pickButton("Warm paper", "Soft and bookish.") { go(4) }
                                pickButton("Midnight", "Dark and focused.") { go(4) }
                            }.id(2).motionTransition(.swap())
                        case 3:
                            VStack(alignment: .leading, spacing: 6) {
                                Text("How big is the team?").font(.system(size: 14)).lineSpacing(3)
                                pickButton("2 – 5 people", "A tight crew.") { go(4) }
                                pickButton("6+ people", "Bring the whole org.") { go(4) }
                            }.id(3).motionTransition(.swap())
                        case 4:
                            wizardText(title: "All set ✓", body: "Your space is ready — invite someone to break it in.", success: true).id(4).motionTransition(.swap())
                        default:
                            wizardText(title: "Skipped — defaults applied", body: "A calm personal space. Change anything later.").id(5).motionTransition(.swap())
                        }
                    }.frame(minHeight: 150, alignment: .top)
                    HStack {
                        Button("Back") { go(step == 4 ? (team ? 3 : 2) : max(0, step - 1)) }
                            .buttonStyle(.bordered).controlSize(.small).opacity((step == 0 || step > 3) ? 0 : 1).disabled(step == 0 || step > 3)
                        Spacer()
                        if step <= 3 {
                            Button("Skip") { go(5) }.buttonStyle(.bordered).controlSize(.small)
                            Button(step == 3 ? "Finish" : "Continue") { advance() }
                                .buttonStyle(.borderedProminent).controlSize(.small).frame(minHeight: 32)
                        } else {
                            Button("Start over") { go(0) }.buttonStyle(.bordered).controlSize(.small)
                        }
                    }.font(.footnote)
                }
                .padding(.horizontal, 14).padding(.vertical, 14)
                .frame(width: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                HStack(spacing: 6) {
                    Text("Jump:").font(.caption).foregroundStyle(.secondary)
                    ForEach(["1", "2", "3"], id: \.self) { l in
                        Button(l) { go((Int(l) ?? 1) - 1) }.buttonStyle(.bordered).controlSize(.mini)
                    }
                    Button("Done") { go(4) }.buttonStyle(.bordered).controlSize(.mini)
                    Button("Skip") { go(5) }.buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
    }

    private func wizardText(title: String, body: String, success: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title).font(.system(size: 14, weight: .semibold)).foregroundStyle(success ? .green : .primary).lineSpacing(3)
            Text(body).font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
        }
    }

    private func pickButton(_ title: String, _ sub: String, _ fn: @escaping () -> Void) -> some View {
        Button(action: { withMotion(.base, reduceMotion: reduce) { fn() } }) {
            VStack(alignment: .leading, spacing: 0) {
                Text(title).font(.system(size: 14))
                Text(sub).font(.caption).foregroundStyle(.secondary)
            }.frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 12).padding(.vertical, 8)
                .background(.background, in: RoundedRectangle(cornerRadius: 9))
        }.buttonStyle(.plain).frame(minHeight: 36)
    }

    private func go(_ n: Int) {
        withMotion(.base, reduceMotion: reduce) { step = n }
    }

    private func advance() {
        if step == 0 { go(1) } else if step == 1 { team = false; go(2) } else { go(4) }
    }
}
