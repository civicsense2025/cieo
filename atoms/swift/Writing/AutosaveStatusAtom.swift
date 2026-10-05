import SwiftUI
import Cieo

public struct AutosaveStatusAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "autosave", category: "Writing", name: "Autosave status",
        summary: "The status moves through Editing, Saving with a spinner, and Saved with a success check, then relaxes to a quiet “Saved just now”. Each change is a blur swap timed from your last keystroke.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Phase { case idle, editing, saving, saved }
    @State private var text = "We launch the spring collection on Thursday."
    @State private var phase = Phase.idle
    @State private var timer: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Type, then pause") {
            VStack(spacing: 8) {
                HStack {
                    Text("Draft · Spring launch").font(.caption.weight(.semibold))
                    Spacer()
                    ZStack(alignment: .trailing) { status.id(phase).motionTransition(.swap()) }
                        .font(.caption).frame(width: 130, height: 20, alignment: .trailing)
                        .animation(reduce ? nil : .motion(.base), value: phase)
                        .accessibilityElement(children: .combine)
                }
                TextEditor(text: $text).scrollContentBackground(.hidden).font(.callout).padding(6).frame(height: 96)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(.quaternary)).accessibilityLabel("Draft")
            }
            .frame(maxWidth: 320)
        }
        .onChange(of: text) { _, _ in edited() }
        .onDisappear { timer?.cancel() }
    }

    @ViewBuilder private var status: some View {
        switch phase {
        case .idle: Text("Saved just now").foregroundStyle(.secondary)
        case .editing: Text("Editing…").foregroundStyle(.secondary)
        case .saving:
            HStack(spacing: 6) {
                TimelineView(.animation(paused: reduce)) { ctx in
                    Image(systemName: "arrow.2.circlepath").font(.caption2).rotationEffect(.degrees(reduce ? 0 : (ctx.date.timeIntervalSinceReferenceDate * 420).truncatingRemainder(dividingBy: 360)))
                }
                Text("Saving…")
            }
            .foregroundStyle(.secondary)
        case .saved: Label("Saved", systemImage: "checkmark").fontWeight(.medium).foregroundStyle(.green)
        }
    }

    /// Editing on the keystroke, then Saving after 0.8 s idle, Saved 0.6 s later, and quiet again 2 s after that.
    private func edited() {
        timer?.cancel()
        withMotion(.base, reduceMotion: reduce) { phase = .editing }
        timer = Task {
            for (wait, next) in [(800, Phase.saving), (600, .saved), (2000, .idle)] {
                try? await Task.sleep(for: .milliseconds(wait))
                if Task.isCancelled { return }
                withMotion(.base, reduceMotion: reduce) { phase = next }
            }
        }
    }
}
