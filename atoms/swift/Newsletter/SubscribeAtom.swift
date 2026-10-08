import SwiftUI
import Cieo

public struct SubscribeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "newsletter", category: "Newsletter", name: "Subscribe",
        summary: "An invalid address rings the field in the danger color and opens a message. A valid one shrinks the button into a spinner, turns it success-colored with a check, then morphs the whole field into a tinted confirmation pill.")

    private enum Phase { case idle, loading, ok, done }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var email = ""
    @State private var phase = Phase.idle
    @State private var invalid = false
    @State private var run: Task<Void, Never>?
    public init() {}

    private var valid: Bool { email.range(of: #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#, options: .regularExpression) != nil }
    private var done: Bool { phase == .done }

    public var body: some View {
        AtomStage(hint: "Submit an invalid address, then a valid one") {
            VStack(spacing: 10) {
                field
                ZStack {
                    if invalid {
                        Text("Enter an address like name@example.com").font(.footnote).foregroundStyle(.red)
                            .motionTransition(.presence)
                    }
                }.frame(height: 18)
                Button("Replay", action: reset).font(.caption).buttonStyle(.borderless)
            }
        }
    }

    private var field: some View {
        ZStack {
            HStack(spacing: 6) {
                TextField("you@example.com", text: $email)
                    .textFieldStyle(.plain).padding(.horizontal, 14)
                    .opacity(phase == .idle ? 1 : 0).disabled(phase != .idle)
                    .accessibilityLabel("Email")
                    .onSubmit(submit)
                    .onChange(of: email) { if invalid && valid { withMotion(.base, reduceMotion: reduce) { invalid = false } } }
                Button(action: submit) { label.frame(maxWidth: .infinity, maxHeight: .infinity) }
                    .buttonStyle(.plain).foregroundStyle(phase == .ok ? Color.white : Color(white: 1, opacity: 0.95))
                    .frame(width: phase == .idle ? 108 : 40, height: 40)
                    .background(Capsule().fill(phase == .ok ? Color.green : Color.primary))
                    .clipShape(Capsule())
                    .accessibilityLabel(phase == .idle ? "Subscribe" : phase == .loading ? "Subscribing" : "Subscribed")
            }
            .opacity(done ? 0 : 1)
            Label("You’re on the list", systemImage: "checkmark").fontWeight(.medium).foregroundStyle(.green)
                .opacity(done ? 1 : 0).offset(y: done ? 0 : 4)
        }
        .padding(4)
        .frame(width: done ? 210 : 320, height: 48)
        .background(Capsule().fill(done ? Color.green.opacity(0.15) : Color.secondary.opacity(0.12)))
        .overlay(Capsule().fill(Color.red.opacity(invalid ? 1 : 0)).opacity(0.10).allowsHitTesting(false))
    }

    @ViewBuilder private var label: some View {
        ZStack {
            switch phase {
            case .idle: Text("Subscribe").fontWeight(.medium).id(0)
            case .loading: Spinner().id(1)
            default: Image(systemName: "checkmark").fontWeight(.bold).id(2)
            }
        }
        .motionTransition(.swap())
        .animation(reduce ? nil : .motion(.base), value: phase)
    }

    private func submit() {
        guard phase == .idle else { return }
        guard valid else { withMotion(.base, reduceMotion: reduce) { invalid = true }; return }
        withMotion(.base, reduceMotion: reduce) { invalid = false; phase = .loading }
        run = Task {
            try? await Task.sleep(for: .seconds(0.9)); if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { phase = .ok }
            try? await Task.sleep(for: .seconds(0.6)); if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { phase = .done }
        }
    }

    private func reset() {
        run?.cancel()
        withMotion(.snap, reduceMotion: reduce) { phase = .idle; invalid = false; email = "" }
    }
}

/// A short arc that turns continuously; stops turning under Reduce Motion.
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
