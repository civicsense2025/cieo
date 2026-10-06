import SwiftUI
import Cieo

public struct PostCallAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "postcall", category: "Video calls", name: "Post-call checkout",
        summary: "Your outcome swaps the follow-up panel; the recap opt-in pops on snap. Submitting swaps in a thanks terminal instead of leaving you hanging.")

    private let panels = [
        ("Loved it", "Tell us one highlight — we will repeat it."),
        ("It was fine", "One thing to fix next time?"),
        ("Rough call", "Sorry — what should we change?")
    ]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var outcome = -1
    @State private var recap = false
    @State private var anonymous = false
    @State private var submitted = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick an outcome, then submit") {
            VStack(alignment: .leading, spacing: 8) {
                Text("How did it go?").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Two taps and you are out.").font(.system(size: 12)).foregroundStyle(.secondary)
                HStack(spacing: 6) {
                    ForEach(0..<panels.count, id: \.self) { i in
                        Button(["Great", "Okay", "Bad"][i]) {
                            withMotion(.base, reduceMotion: reduce) { outcome = i }
                        }
                        .font(.system(size: 13.5, weight: outcome == i ? .semibold : .regular))
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .buttonStyle(.bordered).controlSize(.small)
                    }
                }
                VStack(alignment: .leading, spacing: 0) {
                    Text(panels[max(0, outcome)].0).font(.system(size: 13.5, weight: .semibold))
                    Text(panels[max(0, outcome)].1).font(.system(size: 12.5)).foregroundStyle(.secondary)
                }
                .id(outcome)
                .frame(maxWidth: .infinity, minHeight: 64, alignment: .leading)
                .motionTransition(.swap())
                .animation(reduce ? nil : .motion(.base), value: outcome)
                Toggle("Email me the recap", isOn: $recap)
                    .font(.system(size: 13))
                HStack(spacing: 8) {
                    Button("Submit") {
                        if outcome < 0 { outcome = 1 }
                        withMotion(.snap, reduceMotion: reduce) { submitted = true }
                    }
                    .buttonStyle(.borderedProminent).controlSize(.small)
                    .frame(maxWidth: .infinity, minHeight: 36)
                    Button("Start over") {
                        withMotion(.base, reduceMotion: reduce) {
                            outcome = -1; recap = false; submitted = false
                        }
                    }
                    .buttonStyle(.bordered).controlSize(.small)
                }
                if submitted {
                    Text("✓ " + (anonymous ? "Thanks — noted anonymously" : recap ? "Thanks — recap on its way" : "Thanks — noted"))
                        .font(.system(size: 12.5, weight: .semibold))
                        .foregroundStyle(.green).padding(.horizontal, 10).padding(.vertical, 5)
                        .background(Capsule().fill(.green.opacity(0.12)))
                        .motionTransition(.swap(drift: 0))
                }
                Toggle("Stay anonymous", isOn: $anonymous)
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .padding(14)
        }
    }
}
