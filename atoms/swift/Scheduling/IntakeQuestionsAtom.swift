import SwiftUI
import Cieo

public struct IntakeQuestionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "intakeq", category: "Scheduling", name: "Intake questions",
        summary: "Answers slide the next question up while progress fills. Continuing empty shakes the card and names what is missing.")

    private let qs = [
        ("What brings you in?", ["Tour", "Consult", "Follow-up"]),
        ("Party size?", ["1–2", "3–5", "6+"]),
        ("Preferred time?", ["Mornings", "Afternoons", "Evenings"])]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var ans: [String?] = [nil, nil, nil]
    @State private var prog = Track(0)
    @State private var shake = Track(0, preset: .snap)
    @State private var need = false
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Answer to advance · empty continues shake") {
            TimelineView(.motion(prog, shake)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                VStack(spacing: 10) {
                    HStack(spacing: 8) {
                        GeometryReader { g in
                            Capsule().fill(.quaternary).frame(height: 6)
                            Capsule().fill(.primary).frame(width: g.size.width * prog.value(at: t), height: 6)
                        }
                        .frame(height: 6)
                        Text(step >= 3 ? "Done" : "\(step + 1) of 3")
                            .font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit()
                    }
                    ZStack {
                        ForEach(qs.indices, id: \.self) { i in
                            if i == step && step < 3 {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(qs[i].0).font(.system(size: 14, weight: .semibold))
                                    ForEach(qs[i].1, id: \.self) { o in
                                        Button(o) { ans[i] = o; need = false; advance() }
                                            .font(.system(size: 13)).frame(maxWidth: .infinity, minHeight: 34, alignment: .leading)
                                            .padding(.horizontal, 12)
                                            .background(.background, in: RoundedRectangle(cornerRadius: 8))
                                            .overlay(RoundedRectangle(cornerRadius: 8)
                                                .strokeBorder(ans[i] == o ? Color.primary : Color.secondary.opacity(0.3)))
                                    }
                                    Button("Continue") { cont() }
                                        .font(.system(size: 13, weight: .semibold))
                                        .frame(maxWidth: .infinity, minHeight: 34)
                                        .background(.primary, in: RoundedRectangle(cornerRadius: 8))
                                        .foregroundStyle(.white)
                                    Text(need ? "Pick one to continue" : " ")
                                        .font(.system(size: 12)).foregroundStyle(.red).frame(height: 18)
                                }
                                .transition(.opacity.combined(with: .move(edge: .bottom)))
                            }
                        }
                        if step >= 3 {
                            VStack(spacing: 6) {
                                Image(systemName: "checkmark").font(.system(size: 18, weight: .semibold))
                                    .foregroundStyle(.white).frame(width: 40, height: 40)
                                    .background(.green, in: Circle()).offset(y: -1)
                                Text("Request sent").font(.system(size: 14, weight: .semibold))
                                Text(ans.compactMap { $0 }.joined(separator: " · "))
                                    .font(.system(size: 12)).foregroundStyle(.secondary)
                            }
                            .transition(.opacity.combined(with: .move(edge: .bottom)))
                        }
                    }
                    .frame(minHeight: 190)
                    .animation(.spring, value: step)
                    HStack {
                        Button("Back") { back() }.font(.system(size: 12)).foregroundStyle(.secondary)
                            .frame(minHeight: 32)
                        Spacer()
                    }
                }
                .frame(maxWidth: 300)
                .offset(x: shake.value(at: t))
            }
        }
    }

    private func advance() {
        step = min(3, step + 1)
        if reduce { prog.jump(Double(step) / 3) } else { prog.set(Double(step) / 3, at: now()) }
    }

    private func cont() {
        if ans[step] != nil { need = false; advance() }
        else { need = true; shake(from: 10) }
    }

    private func back() {
        guard step > 0 else { return }
        step -= 1; ans[step] = nil; need = false
        if reduce { prog.jump(Double(step) / 3) } else { prog.set(Double(step) / 3, at: now()) }
    }

    private func shake(from x: Double) {
        if reduce { shake.jump(0); return }
        shake.release(from: x, velocity: 0, to: 0, at: now())
    }
}
