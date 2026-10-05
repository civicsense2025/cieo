import SwiftUI
import MotionKit

public struct ApiKeyRevealAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "apikeyreveal", category: "MCP and agents", name: "API key reveal and rotate",
        summary: "Create key grows the form open and swaps its own label to Cancel. Creating collapses the form, grows the one-time reveal panel in its place and drops the new row in from zero height with a New tag. Copy swaps to Copied with a green fill and falls back after 1.8s. Done closes the panel and fades the tag. Rotate and Revoke open an inline confirmation under the row; Rotate swaps the masked prefix and reopens the reveal, Revoke dims the row, swaps its line to Revoked, then collapses it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var form = false
    @State private var name = ""
    @State private var reveal = false
    @State private var hasKey = false
    @State private var isNew = false
    @State private var copied = false
    @State private var confirm: String?
    @State private var prefix = "mk_live_7f3a"
    @State private var revoked = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Create, copy, rotate or revoke") {
            AgCard {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("API keys").font(.headline)
                        Spacer()
                        Button { withMotion(.base, reduceMotion: reduce) { form.toggle() } } label: { SwapText(form ? "Cancel" : "Create key") }.buttonStyle(AgPress(tone: form ? nil : .info))
                    }
                    AgReveal(open: form) {
                        HStack { TextField("Key name", text: $name).textFieldStyle(.roundedBorder); Button("Create") { create() }.buttonStyle(AgPress(tone: .info)) }
                    }
                    AgReveal(open: reveal) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Copy it now. For security this is the only time it is shown.").font(.caption).foregroundStyle(.orange)
                            HStack {
                                Text(prefix + "…c91d").font(.callout.monospaced()); Spacer()
                                Button { copy() } label: { HStack(spacing: 4) { if copied { Image(systemName: "checkmark") }; SwapText(copied ? "Copied" : "Copy") } }.buttonStyle(AgPress(tone: copied ? .success : nil))
                            }
                            Button("I have stored it") { withMotion(.base, reduceMotion: reduce) { reveal = false; isNew = false } }.buttonStyle(AgPress())
                        }
                        .padding(8).background(Color.orange.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
                    }
                    AgReveal(open: hasKey && !revoked) {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Image(systemName: "key").foregroundStyle(.secondary)
                                SwapText(prefix + "…").font(.callout.monospaced())
                                if isNew { AgChip(text: "New", tone: .info) }
                                Spacer()
                                Button("Rotate") { ask("rotate") }.buttonStyle(AgPress())
                                Button("Revoke") { ask("revoke") }.buttonStyle(AgPress())
                            }
                            AgReveal(open: confirm != nil) {
                                HStack {
                                    Text(confirm == "rotate" ? "Rotate this key?" : "Revoke this key?").font(.caption); Spacer()
                                    Button("Confirm") { doConfirm() }.buttonStyle(AgPress(tone: confirm == "revoke" ? .danger : .warning))
                                    Button("Keep") { withMotion(.base, reduceMotion: reduce) { confirm = nil } }.buttonStyle(AgPress())
                                }
                            }
                        }
                    }
                    if revoked { Label("Revoked", systemImage: "nosign").font(.caption).foregroundStyle(.secondary).transition(.opacity) }
                }
            }
            .frame(maxWidth: 420)
        }
    }

    private func create() {
        withMotion(.base, reduceMotion: reduce) { form = false; reveal = true; hasKey = true; isNew = true; revoked = false; name = "" }
    }
    private func copy() {
        withMotion(.base, reduceMotion: reduce) { copied = true }
        Task { @MainActor in try? await Task.sleep(nanoseconds: 1_800_000_000); withMotion(.base, reduceMotion: reduce) { copied = false } }
    }
    private func ask(_ k: String) { withMotion(.base, reduceMotion: reduce) { confirm = confirm == k ? nil : k } }
    private func doConfirm() {
        if confirm == "rotate" {
            withMotion(.base, reduceMotion: reduce) { prefix = "mk_live_" + String(Int.random(in: 1000...9999)); confirm = nil; reveal = true; isNew = true }
        } else {
            withMotion(.base, reduceMotion: reduce) { confirm = nil; revoked = true }
        }
    }
}
