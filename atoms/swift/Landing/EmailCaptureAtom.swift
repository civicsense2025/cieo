import SwiftUI
import Cieo

public struct EmailCaptureAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "emailcapture", category: "Landing", name: "Email capture",
        summary: "Submit settles into neutral, invalid or valid. Invalid rings the field danger with a swapped message; valid spins the button, lands a check, and holds the success pill as the terminal state.")

    private enum Phase { case idle, sending, done }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var email = ""
    @State private var invalid = false
    @State private var phase = Phase.idle
    public init() {}

    private var isValid: Bool { email.contains("@") && email.contains(".") && !email.contains(" ") }

    public var body: some View {
        AtomStage(hint: "Invalid rings danger · valid holds the pill") {
            VStack(spacing: 8) {
                Text("Get the launch issue").font(.headline)
                Text("One email a month. Unsubscribe anytime.").font(.caption).foregroundStyle(.secondary)
                HStack(spacing: 8) {
                    TextField("you@example.com", text: $email)
                        .textFieldStyle(.roundedBorder).controlSize(.regular)
                        .overlay(RoundedRectangle(cornerRadius: 9).stroke(invalid ? Color.red : Color.clear, lineWidth: 1.5))
                        .disabled(phase == .done)
                    Button {
                        submit()
                    } label: {
                        ZStack {
                            if phase == .sending { ProgressView().controlSize(.small).id(1).motionTransition(.swap()) }
                            else if phase == .done { Image(systemName: "checkmark").id(2).motionTransition(.swap()) }
                            else { Text("Join").id(0).motionTransition(.swap()) }
                        }.frame(minWidth: 64, minHeight: 36)
                    }.buttonStyle(.borderedProminent).tint(phase == .done ? .green : .accentColor).disabled(phase != .idle)
                }.frame(width: 320)
                ZStack {
                    if invalid { Text("Enter an address like name@example.com").foregroundStyle(.red).id(1).motionTransition(.swap()) }
                    else if phase == .done { Text("Check your inbox to confirm.").foregroundStyle(.green).id(2).motionTransition(.swap()) }
                    else { Text("Get launch updates. Only the good ones.").foregroundStyle(.secondary).id(0).motionTransition(.swap()) }
                }.font(.caption)
                Button("Reset demo") {
                    var t = Transaction(); t.disablesAnimations = true
                    withTransaction(t) { email = ""; invalid = false; phase = .idle }
                }.font(.caption).buttonStyle(.borderless)
            }.frame(width: 340)
        }
    }

    private func submit() {
        guard phase == .idle else { return }
        guard isValid else {
            withMotion(.base, reduceMotion: reduce) { invalid = true }
            return
        }
        invalid = false
        if reduce { phase = .done; return }
        withMotion(.base, reduceMotion: reduce) { phase = .sending }
        Task {
            try? await Task.sleep(for: .seconds(0.9))
            withMotion(.base, reduceMotion: reduce) { phase = .done }
        }
    }
}
