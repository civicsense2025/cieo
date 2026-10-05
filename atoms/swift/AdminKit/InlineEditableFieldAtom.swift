import SwiftUI
import Cieo

public struct InlineEditableFieldAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "inlineedit", category: "Admin kit", name: "Inline editable field",
        summary: "The value and the input are the same box: same padding and type, so nothing shifts. Click and the border and fill morph in while the text swaps to the input and the trailing check and cancel buttons arrive. Enter saves behind a short spinner, then the new value swaps in with a Saved check. Escape swaps the typed text out and the original back in. Invalid input turns the border danger and swaps in the message.")

    private enum Mode { case display, edit, saving, saved }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var value = "Harbor & Pine"
    @State private var draft = ""
    @State private var mode = Mode.display
    @FocusState private var focused: Bool
    public init() {}

    private var invalid: Bool { draft.trimmingCharacters(in: .whitespaces).isEmpty || draft.count > 24 }
    private var editing: Bool { mode == .edit || mode == .saving }

    public var body: some View {
        AtomStage(hint: "Click the name to edit; Enter saves, Esc cancels") {
            VStack(alignment: .leading, spacing: 6) {
                Text("Site name").font(.caption).foregroundStyle(.secondary)
                HStack(spacing: 6) {
                    ZStack(alignment: .leading) {
                        if editing { TextField("Site name", text: $draft).textFieldStyle(.plain).focused($focused).onSubmit(save).motionTransition(.swap()) }
                        else { Text(value).motionTransition(.swap()).onTapGesture { begin() }.accessibilityAddTraits(.isButton).accessibilityHint("Edit") }
                    }
                    .font(.body).padding(.horizontal, 10).frame(height: 34, alignment: .leading).frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 8).fill(editing ? Color.secondary.opacity(0.12) : .clear))
                    .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(editing ? (invalid ? Color.red : Color.accentColor) : Color.clear, lineWidth: 1.5))
                    .onKeyPress(.escape) { cancel(); return .handled }
                    ZStack {
                        if mode == .edit { HStack(spacing: 4) { Button(action: save) { Image(systemName: "checkmark") }.disabled(invalid).accessibilityLabel("Save"); Button(action: cancel) { Image(systemName: "xmark") }.accessibilityLabel("Cancel") }.buttonStyle(.bordered).controlSize(.small).motionTransition(.swap()) }
                        if mode == .saving { ProgressView().controlSize(.small).motionTransition(.swap()) }
                        if mode == .saved { Label("Saved", systemImage: "checkmark").font(.caption).foregroundStyle(.green).motionTransition(.swap()) }
                    }.frame(width: 76, alignment: .leading)
                }
                ZStack(alignment: .leading) { if editing && invalid { Text(draft.count > 24 ? "Use 24 characters or fewer" : "A name is required").font(.caption).foregroundStyle(.red).motionTransition(.swap()) } }.frame(height: 16)
            }
            .frame(width: 340).animation(reduce ? nil : .motion(.base), value: mode).animation(reduce ? nil : .motion(.base), value: invalid)
        }
    }

    private func begin() { draft = value; withMotion(.base, reduceMotion: reduce) { mode = .edit }; focused = true }
    private func cancel() { withMotion(.base, reduceMotion: reduce) { mode = .display } }

    private func save() {
        guard mode == .edit, !invalid else { return }
        withMotion(.base, reduceMotion: reduce) { mode = .saving }
        Task {
            try? await Task.sleep(for: .seconds(0.6)); value = draft
            withMotion(.base, reduceMotion: reduce) { mode = .saved }
            try? await Task.sleep(for: .seconds(1.4)); withMotion(.base, reduceMotion: reduce) { mode = .display }
        }
    }
}
