import SwiftUI
import Cieo

public struct CoachmarksAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "coachmarks", category: "Guidance", name: "Coachmark sequence",
        summary: "The card trails its dot from step to step while copy swaps in the direction of travel. The step count rolls and the last card holds as a success terminal.")

    private let steps: [(title: String, body: String)] = [
        ("Add names", "Type one name, or paste the whole hiring loop at once."),
        ("Pick roles", "Editors draft, viewers comment, guests just peek."),
        ("Send invites", "Everyone lands in the right channel together.")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var done = false
    public init() {}

    private func dot(_ n: Int) -> some View {
        let on = n == step && !done
        return Button("\(n + 1)") { go(n) }
            .font(.caption.weight(.semibold)).foregroundStyle(on ? Color.accentColor : Color.secondary)
            .frame(width: 28, height: 28).background(Circle().fill(on ? Color.accentColor.opacity(0.15) : Color.primary.opacity(0.08)))
            .overlay(Circle().stroke(on ? Color.accentColor : Color.primary.opacity(0.2), lineWidth: 1.5))
            .scaleEffect(on ? 1.12 : 1)
    }

    public var body: some View {
        AtomStage(hint: "Next travels forward, Back slides back") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Invite the team").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                    Text("Three dots, three jobs. The card follows its dot.").font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
                    HStack {
                        ForEach(steps.indices, id: \.self) { n in dot(n) }
                        if steps.count > 1 { Spacer() }
                    }.padding(.top, 10).animation(reduce ? nil : .motion(.base), value: step)
                    VStack(alignment: .leading, spacing: 2) {
                        ZStack(alignment: .topLeading) {
                            if done {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Done — team invited ✓").font(.footnote.weight(.semibold)).foregroundStyle(.green)
                                    Text("Three seats filled. Replay any step.").font(.caption).foregroundStyle(.secondary)
                                }.id("done").motionTransition(.swap())
                            } else {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(steps[step].title).font(.footnote.weight(.semibold))
                                    Text(steps[step].body).font(.caption).foregroundStyle(.secondary).lineSpacing(2)
                                }.id(step).motionTransition(.swap())
                            }
                        }
                        HStack {
                            Text(done ? "3 of 3 ✓" : "\(step + 1) of 3").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                            Spacer()
                            if step > 0 { Button("Back") { go(step - 1) }.buttonStyle(.borderless) }
                            Button(done ? "Replay" : step == steps.count - 1 ? "Done" : "Next") { go(done ? 0 : step + 1) }
                                .buttonStyle(.borderless).fontWeight(.semibold)
                        }.font(.caption)
                    }
                    .padding(12).frame(maxWidth: .infinity, alignment: .leading)
                    .background(.background, in: RoundedRectangle(cornerRadius: 10)).shadow(color: .black.opacity(0.18), radius: 8, y: 2)
                }
                .padding(.horizontal, 14).padding(.vertical, 14)
                .frame(maxWidth: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                HStack(spacing: 6) {
                    Text("Steps:").font(.caption).foregroundStyle(.secondary)
                    ForEach(steps.indices, id: \.self) { n in Button("\(n + 1)") { go(n) }.buttonStyle(.bordered).controlSize(.mini) }
                    Button("Done") { finish() }.buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
    }

    private func go(_ n: Int) {
        if n >= steps.count { finish(); return }
        withMotion(.base, reduceMotion: reduce) { step = max(0, n); done = false }
    }

    private func finish() {
        withMotion(.base, reduceMotion: reduce) { done = true }
    }
}
