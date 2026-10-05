import SwiftUI
import MotionKit

public struct AuthShellAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "authshell", category: "Workflow", name: "Auth shell",
        summary: "One card holds every pane, so the frame never changes. Going to Forgot password or Enter code, the old pane slides out 18px and fades (100ms), then the next pane arrives from the direction of travel. The card’s height springs to the new pane on the same tick, so it never jumps. An error opens a danger line inside the card and adds its height to the same spring. The primary button swaps its label while it works. Everything here is demo text and nothing is sent.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Pane: Int { case signIn, forgot, code }
    @State private var pane = Pane.signIn
    @State private var forward = true
    @State private var email = ""
    @State private var password = ""
    @State private var error: String?
    @State private var working = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Demo text only. Nothing is sent.") {
            AgCard {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Label("Admin access", systemImage: "lock").font(.caption).foregroundStyle(.secondary)
                        Spacer()
                        Button("Start over") { go(.signIn, forward: false) }.buttonStyle(AgPress()).font(.caption)
                    }
                    ZStack {
                        content.id(pane)
                            .transition(reduce ? .identity : .asymmetric(
                                insertion: .opacity.combined(with: .offset(x: forward ? 18 : -18)).animation(.motion(.base).delay(Motion.exit)),
                                removal: .opacity.combined(with: .offset(x: forward ? -18 : 18)).animation(.motionExit)))
                    }
                    AgReveal(open: error != nil) {
                        Label(error ?? " ", systemImage: "exclamationmark.circle").font(.caption).foregroundStyle(.red)
                    }
                }
            }
            .frame(maxWidth: 380)
        }
    }

    @ViewBuilder private var content: some View {
        switch pane {
        case .signIn:
            VStack(alignment: .leading, spacing: 8) {
                Text("Sign in").font(.headline)
                TextField("you@example.com", text: $email).textFieldStyle(.roundedBorder).accessibilityLabel("Email")
                SecureField("Demo only, 8+ characters", text: $password).textFieldStyle(.roundedBorder)
                Button { submit() } label: { HStack { if working { AgSpinner(size: 12) }; SwapText(working ? "Checking…" : "Enter") } }
                    .buttonStyle(AgPress(tone: .info)).disabled(working)
                Button("Forgot password?") { go(.forgot, forward: true) }.buttonStyle(.plain).font(.caption).foregroundStyle(Color.accentColor)
            }
        case .forgot:
            VStack(alignment: .leading, spacing: 8) {
                Text("Reset password").font(.headline)
                Text("We will send a code to the email on file.").font(.caption).foregroundStyle(.secondary)
                Button("Send code") { go(.code, forward: true) }.buttonStyle(AgPress(tone: .info))
                Button("Back to sign in") { go(.signIn, forward: false) }.buttonStyle(.plain).font(.caption).foregroundStyle(Color.accentColor)
            }
        case .code:
            VStack(alignment: .leading, spacing: 8) {
                Text("Enter code").font(.headline)
                Text("Check your inbox for a 6-digit code.").font(.caption).foregroundStyle(.secondary)
                Button("Back") { go(.forgot, forward: false) }.buttonStyle(AgPress())
            }
        }
    }

    private func go(_ p: Pane, forward f: Bool) {
        forward = f
        withMotion(.base, reduceMotion: reduce) { pane = p; error = nil; working = false }
    }
    private func submit() {
        withMotion(.snap, reduceMotion: reduce) { working = true; error = nil }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 800_000_000)
            withMotion(.base, reduceMotion: reduce) {
                working = false
                error = password.count < 8 ? "Use at least 8 characters." : "Demo only: nothing was sent."
            }
        }
    }
}
