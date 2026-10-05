import SwiftUI
import MotionKit

public struct NewsletterFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "footer-newsletter", category: "Footers", name: "Footer with newsletter signup",
        summary: "Submit an invalid address and the field rings danger red while a message opens beneath. A valid one shrinks the button to a spinner, then resolves one of three ways: success turns the button green with a check, then the whole field morphs into a tinted confirmation; a server failure turns the button red with Try again; an address already on the list rings the field amber. Columns rise into view in order as the footer enters.")
    public init() {}
    public var body: some View { FootPage(hint: "Try: a typo, ok@x.com, fail@x.com, used@x.com") { NewsletterForm() } }
}

private enum Phase { case idle, invalid, loading, done, failed, duplicate }

private struct NewsletterForm: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var email = ""
    @State private var phase = Phase.idle
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Stay in the loop").font(.callout.weight(.semibold)).footRise(0)
            ZStack {
                if phase == .done {
                    Label("You are on the list", systemImage: "checkmark.circle.fill").font(.callout).foregroundStyle(.green)
                        .frame(maxWidth: .infinity, minHeight: 36).background(Color.green.opacity(0.14), in: RoundedRectangle(cornerRadius: 8))
                        .transition(.opacity)
                } else {
                    HStack(spacing: 6) {
                        TextField("you@example.com", text: $email).textFieldStyle(.plain).padding(.horizontal, 10).frame(height: 36)
                            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 8))
                            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(ring, lineWidth: 1.5))
                            .onSubmit(submit)
                        Button(action: submit) {
                            ZStack {
                                if phase == .loading { ProgressView().controlSize(.small) }
                                else { Text(phase == .failed ? "Try again" : "Join").font(.callout.weight(.semibold)).foregroundStyle(.white) }
                            }
                            .frame(width: phase == .loading ? 36 : (phase == .failed ? 84 : 60), height: 36)
                            .background(phase == .failed ? Color.red : Color.accentColor, in: RoundedRectangle(cornerRadius: 8))
                        }.buttonStyle(.plain).disabled(phase == .loading)
                    }
                    .transition(.opacity)
                }
            }
            .footRise(1)
            .animation(reduce ? nil : .motion(.base), value: phase)
            if let message { Text(message).font(.caption).foregroundStyle(ring).transition(.opacity.combined(with: .offset(y: -4))) }
        }
        .padding(.vertical, 16).overlay(alignment: .top) { Divider() }
        .animation(reduce ? nil : .motion(.base), value: phase)
    }

    private var ring: Color { phase == .invalid || phase == .failed ? .red : (phase == .duplicate ? .orange : .clear) }
    private var message: String? {
        switch phase { case .invalid: "Enter an address like name@example.com"; case .failed: "Something went wrong on our side"; case .duplicate: "That address is already subscribed"; default: nil }
    }

    private func submit() {
        guard email.contains("@"), email.contains(".") else { phase = .invalid; return }
        phase = .loading
        Task {
            try? await Task.sleep(for: .milliseconds(900))
            phase = email.hasPrefix("fail") ? .failed : (email.hasPrefix("used") ? .duplicate : .done)
        }
    }
}
