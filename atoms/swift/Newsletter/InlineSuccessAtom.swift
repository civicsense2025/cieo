import SwiftUI
import Cieo

public struct InlineSuccessAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "inlinesuccess", category: "Newsletter", name: "Inline success",
        summary: "A valid address shrinks the button into a spinner, then morphs it into a success pill. The count rides to the subscriber total and a referral line swaps in.")

    private enum Phase { case idle, loading, done }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var email = ""
    @State private var phase = Phase.idle
    @State private var count = 0
    @State private var run: Task<Void, Never>?
    public init() {}

    private var valid: Bool { email.range(of: #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#, options: .regularExpression) != nil }

    public var body: some View {
        AtomStage(hint: "Enter a valid address") {
            VStack(spacing: 8) {
                Text("Get the Sunday letter").font(.callout.weight(.semibold))
                Text("One email a week. Unsubscribe any time.").font(.footnote).foregroundStyle(.secondary)
                HStack(spacing: 8) {
                    TextField("you@example.com", text: $email)
                        .textFieldStyle(.plain).padding(.horizontal, 12)
                        .frame(height: 44)
                        .background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                        .disabled(phase != .idle)
                    Button(action: submit) { label.frame(maxWidth: .infinity, maxHeight: .infinity) }
                        .buttonStyle(.plain).foregroundStyle(.white)
                        .frame(width: phase == .idle ? 120 : phase == .loading ? 44 : 110, height: 44)
                        .background(Capsule().fill(phase == .done ? Color.green : Color.primary))
                        .clipShape(Capsule())
                        .accessibilityLabel(phase == .idle ? "Subscribe" : phase == .loading ? "Subscribing" : "Subscribed")
                }
                HStack(spacing: 6) {
                    Text("\(count)").font(.footnote.monospacedDigit())
                    Text("readers already in").font(.caption).foregroundStyle(.secondary)
                }
                .opacity(phase == .done ? 1 : 0.4)
                ZStack {
                    if phase == .done {
                        Text("Refer a friend, skip the waitlist").font(.caption).foregroundStyle(.secondary)
                            .motionTransition(.swap())
                    }
                }.frame(height: 18)
                Button("Reset") { reset() }.font(.caption).buttonStyle(.borderless)
            }.frame(width: 340).padding(16)
        }
    }

    @ViewBuilder private var label: some View {
        ZStack {
            switch phase {
            case .idle: Text("Subscribe").fontWeight(.medium).id(0)
            case .loading: Spinner().id(1)
            case .done: Label("You're in", systemImage: "checkmark").fontWeight(.semibold).id(2)
            }
        }
        .motionTransition(.swap())
        .animation(reduce ? nil : .motion(.base), value: phase)
    }

    private func submit() {
        guard phase == .idle, valid else { return }
        withMotion(.base, reduceMotion: reduce) { phase = .loading }
        run = Task {
            try? await Task.sleep(for: .seconds(0.8)); if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { phase = .done }
            if reduce { count = 12480 } else {
                for v in stride(from: 0, through: 12480, by: 1248) {
                    if Task.isCancelled { return }
                    count = v
                    try? await Task.sleep(for: .seconds(0.05))
                }
                count = 12480
            }
        }
    }

    private func reset() {
        run?.cancel()
        withMotion(.snap, reduceMotion: reduce) { phase = .idle; email = ""; count = 0 }
    }
}

private struct Spinner: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    var body: some View {
        TimelineView(.animation(paused: reduce)) { tl in
            Circle().trim(from: 0, to: 0.25).stroke(style: StrokeStyle(lineWidth: 2.25, lineCap: .round))
                .frame(width: 18, height: 18)
                .rotationEffect(.degrees(reduce ? 0 : tl.date.timeIntervalSinceReferenceDate * 420))
        }.accessibilityHidden(true)
    }
}
