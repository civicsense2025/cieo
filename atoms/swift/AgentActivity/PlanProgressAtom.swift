import SwiftUI
import Cieo

public struct PlanProgressAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "planprogress", category: "Agent activity", name: "Agent plan progress",
        summary: "Steps tick on a spring: the mark swaps from ring to spinner to check, and the row’s substeps tick one by one under the current step, which is the only one open. When a step fails it stops the run, opens on the error and offers Retry or Skip; retrying runs only that step. Add step grows an input row, and the new step slides in after the current one while the bar fill and the rolling percent move to the new total.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum St { case todo, running, done, failed, skipped }
    private struct Step: Identifiable { let id: Int; var title: String; var st = St.todo; var subs = 0; var total = 2 }
    @State private var steps = [Step(id: 1, title: "Open northwind.app"), Step(id: 2, title: "Fill the signup form", total: 3), Step(id: 3, title: "Confirm the email", total: 2), Step(id: 4, title: "Pick the Team trial")]
    @State private var run = 0
    @State private var adding = false
    @State private var newTitle = ""
    @State private var nextId = 5
    @State private var failedOnce = false
    public init() {}

    private var pct: Int { steps.isEmpty ? 0 : steps.filter { $0.st == .done || $0.st == .skipped }.count * 100 / steps.count }

    public var body: some View {
        AtomStage(hint: "Step 3 fails once; Retry runs only that step") {
            AgCard {
                VStack(alignment: .leading, spacing: 8) {
                    HStack { Text("Plan").font(.headline); Spacer(); HStack(spacing: 0) { RollingDigits(pct); Text("%") }.font(.callout.monospacedDigit()); Button("Replay") { failedOnce = false; run += 1 }.buttonStyle(AgPress()) }
                    GeometryReader { g in ZStack(alignment: .leading) { Capsule().fill(.quaternary); Capsule().fill(Color.accentColor).frame(width: g.size.width * Double(pct) / 100) } }
                        .frame(height: 4).animation(reduce ? nil : .motion(.soft), value: pct)
                    ForEach(steps) { s in
                        VStack(alignment: .leading, spacing: 3) {
                            HStack(spacing: 8) {
                                Group {
                                    switch s.st {
                                    case .running: AgSpinner(size: 12)
                                    case .done: Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                                    case .failed: Image(systemName: "exclamationmark.circle.fill").foregroundStyle(.red)
                                    case .skipped: Image(systemName: "forward.circle").foregroundStyle(.secondary)
                                    case .todo: Image(systemName: "circle").foregroundStyle(.secondary)
                                    }
                                }.frame(width: 16)
                                Text(s.title).font(.callout)
                                Spacer()
                            }
                            AgReveal(open: s.st == .running || s.st == .failed) {
                                VStack(alignment: .leading, spacing: 2) {
                                    ForEach(0..<s.total, id: \.self) { i in
                                        Label("Substep \(i + 1)", systemImage: i < s.subs ? "checkmark" : "circle").font(.caption).foregroundStyle(i < s.subs ? Color.green : .secondary)
                                    }
                                    if s.st == .failed {
                                        Text("Could not find the confirmation email.").font(.caption).foregroundStyle(.red)
                                        HStack { Button("Retry") { retry(s.id) }.buttonStyle(AgPress(tone: .info)); Button("Skip") { skip(s.id) }.buttonStyle(AgPress()) }
                                    }
                                }.padding(.leading, 24)
                            }
                        }
                        .transition(reduce ? .identity : .opacity.combined(with: .move(edge: .top)))
                    }
                    if adding {
                        HStack { TextField("New step", text: $newTitle).textFieldStyle(.roundedBorder); Button("Add") { add() }.buttonStyle(AgPress(tone: .info)); Button("Cancel") { adding = false }.buttonStyle(AgPress()) }.transition(.opacity)
                    } else { Button { withMotion(.base, reduceMotion: reduce) { adding = true } } label: { Label("Add step", systemImage: "plus") }.buttonStyle(AgPress()) }
                }
            }
            .frame(maxWidth: 400)
            .animation(reduce ? nil : .motion(.base), value: steps.count)
            .animation(reduce ? nil : .motion(.base), value: adding)
        }
        .task(id: run) { await play() }
    }

    private func set(_ i: Int, _ f: (inout Step) -> Void) { withMotion(.base, reduceMotion: reduce) { if let k = steps.firstIndex(where: { $0.id == i }) { f(&steps[k]) } } }
    private func play() async {
        withMotion(.base, reduceMotion: reduce) { for k in steps.indices { steps[k].st = .todo; steps[k].subs = 0 } }
        for s in steps where s.st == .todo { if !(await runStep(s.id)) { return } }
    }
    private func runStep(_ id: Int) async -> Bool {
        set(id) { $0.st = .running; $0.subs = 0 }
        let total = steps.first { $0.id == id }?.total ?? 2
        for i in 1...total {
            try? await Task.sleep(nanoseconds: 600_000_000)
            if Task.isCancelled { return false }
            set(id) { $0.subs = i }
        }
        if id == 3 && !failedOnce { failedOnce = true; set(id) { $0.st = .failed; $0.subs = 1 }; return false }
        set(id) { $0.st = .done }
        return true
    }
    private func retry(_ id: Int) { Task { if await runStep(id) { for s in steps where s.st == .todo { if !(await runStep(s.id)) { return } } } } }
    private func skip(_ id: Int) { set(id) { $0.st = .skipped }; Task { for s in steps where s.st == .todo { if !(await runStep(s.id)) { return } } } }
    private func add() {
        guard !newTitle.isEmpty else { return }
        withMotion(.base, reduceMotion: reduce) { steps.append(Step(id: nextId, title: newTitle)); adding = false }
        nextId += 1; newTitle = ""
    }
}
