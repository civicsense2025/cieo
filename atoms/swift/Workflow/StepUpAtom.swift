import SwiftUI
import MotionKit

public struct StepUpAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stepup", category: "Workflow", name: "Step-up re-authentication",
        summary: "Delete site is blocked until you prove it is you. A scrim fades in while the dialog rises 8px from 97% scale, with focus in the code row and the ring sliding box to box. A wrong code turns the boxes danger, says why, then clears itself. A right code turns the boxes and button success, the dialog leaves, and only then does the blocked action resume: the button reads Deleting…, the row fades out and its space collapses, and a status line swaps in.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Phase { case entry, bad, ok }
    @State private var asking = false
    @State private var phase = Phase.entry
    @State private var code = ""
    @State private var deleting = false
    @State private var gone = false
    @FocusState private var focused: Bool
    public init() {}

    private var tone: AgTone { phase == .bad ? .danger : phase == .ok ? .success : .neutral }

    public var body: some View {
        AtomStage(hint: "Tap Delete site. Demo code: 482913") {
            ZStack {
                AgCard {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Danger zone").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                        AgReveal(open: !gone) {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("Delete this site").font(.callout.weight(.medium))
                                    Text("Removes its pages and media.").font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                                Button { show() } label: { SwapText(deleting ? "Deleting…" : "Delete site") }
                                    .buttonStyle(AgPress(tone: .danger)).disabled(deleting)
                            }
                        }
                        HStack(spacing: 6) {
                            if gone { Image(systemName: "checkmark.circle.fill").foregroundStyle(.green) }
                            Text(gone ? "Site deleted. Restore it from Trash for 30 days." : "Owner access").font(.caption)
                        }
                        .id(gone).transition(reduce ? .identity : .motionSwap())
                    }
                }
                if asking { dialog }
            }
            .animation(reduce ? nil : .motion(.base), value: asking)
        }
    }

    private var dialog: some View {
        ZStack {
            Color.black.opacity(0.25).transition(.opacity).onTapGesture { dismiss() }
            VStack(alignment: .leading, spacing: 10) {
                Text("Confirm it's you").font(.headline)
                Text("Deleting a site needs a fresh check. Enter the 6-digit code from your authenticator app.")
                    .font(.caption).foregroundStyle(.secondary)
                ZStack {
                    TextField("Code", text: $code).focused($focused).opacity(0.01)
                        .onChange(of: code) { _, v in
                            code = String(v.filter(\.isNumber).prefix(6))
                            if code.count == 6 { verify() }
                        }
                        .accessibilityLabel("Six digit code")
                    HStack(spacing: 6) {
                        ForEach(0..<6, id: \.self) { i in
                            let chars = Array(code)
                            RoundedRectangle(cornerRadius: 8)
                                .strokeBorder(phase == .entry ? (i == min(code.count, 5) ? Color.accentColor : Color.secondary.opacity(0.4)) : tone.color, lineWidth: i == min(code.count, 5) && phase == .entry ? 2 : 1)
                                .background(tone.color.opacity(phase == .entry ? 0 : 0.1), in: RoundedRectangle(cornerRadius: 8))
                                .frame(height: 40)
                                .overlay(Text(i < chars.count ? String(chars[i]) : "").font(.title3.monospacedDigit()))
                        }
                    }
                    .allowsHitTesting(false).accessibilityHidden(true)
                    .animation(reduce ? nil : .motion(.snap), value: code.count)
                    .animation(reduce ? nil : .motion(.base), value: phase)
                }
                Group {
                    switch phase {
                    case .entry: Text("Demo code: 482913").foregroundStyle(.secondary)
                    case .bad: Text("That code didn't match. Try again.").foregroundStyle(.red)
                    case .ok: Text("Verified. Resuming your request…").foregroundStyle(.green)
                    }
                }.font(.caption).id(phase).transition(reduce ? .identity : .motionSwap())
                HStack { Spacer(); Button("Cancel") { dismiss() }.buttonStyle(AgPress()) }
            }
            .padding(16).frame(maxWidth: 320)
            .background(.background, in: RoundedRectangle(cornerRadius: 14))
            .shadow(radius: 12, y: 4)
            .transition(reduce ? .identity : .motionPresence)
        }
        .animation(reduce ? nil : .motion(.base), value: phase)
    }

    private func show() {
        code = ""; phase = .entry
        withMotion(.base, reduceMotion: reduce) { asking = true }
        focused = true
    }
    private func dismiss() { withMotion(.snap, reduceMotion: reduce) { asking = false } }
    private func verify() {
        if code == "482913" {
            withMotion(.base, reduceMotion: reduce) { phase = .ok }
            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 700_000_000)
                dismiss()
                try? await Task.sleep(nanoseconds: 300_000_000)
                withMotion(.base, reduceMotion: reduce) { deleting = true }
                try? await Task.sleep(nanoseconds: 900_000_000)
                withMotion(.base, reduceMotion: reduce) { gone = true }
            }
        } else {
            withMotion(.base, reduceMotion: reduce) { phase = .bad }
            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 900_000_000)
                withMotion(.base, reduceMotion: reduce) { code = ""; phase = .entry }
            }
        }
    }
}
