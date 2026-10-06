import SwiftUI
import Cieo

public struct DialogFormAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "dialogform", category: "Overlays", name: "Dialog form steps",
        summary: "Header and footer stay pinned while only the body swaps on base. Invalid fields turn danger with a message, valid ones show a success check.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var step = 0
    @State private var email = "maya@studio.co"
    @State private var role = "Editor"
    @State private var error = ""
    @FocusState private var field: Int?
    public init() {}
    public var body: some View {
        AtomStage(hint: "Step 1 of 2 · invalid shows danger") {
            ZStack {
                VStack(spacing: 8) {
                    Toggle("Focus first invalid", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary).controlSize(.small)
                    Button("Invite member") { step = 0; error = ""; withMotion(.base, reduceMotion: reduce) { open = true }; field = 0 }
                        .buttonStyle(.borderedProminent)
                }
                if open {
                    Color.black.opacity(0.35).ignoresSafeArea().onTapGesture { open = false }
                        .transition(.opacity.animation(reduce ? nil : .motion(.base)))
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Invite to Common Room").font(.headline)
                        ZStack { if step == 0 { fieldView("Email", text: $email, tag: 0) } else { fieldView("Role", text: $role, tag: 1) } }
                            .frame(minHeight: 74).padding(.vertical, 10)
                            .transition(reduce ? .identity : .opacity)
                            .animation(reduce ? nil : .motion(.base), value: step)
                        if !error.isEmpty { Text(error).font(.caption).foregroundStyle(.red).transition(reduce ? .identity : .opacity) }
                        HStack { Spacer(); Button("Cancel") { open = false }.buttonStyle(.bordered)
                            Button("Continue", action: next).buttonStyle(.borderedProminent) }
                            .padding(.top, 12)
                    }
                    .padding(18).frame(width: 270).basicsPanel(radius: 15)
                    .transition(reduce ? .identity : .opacity.combined(with: .scale(scale: 0.96)).combined(with: .offset(y: 8)).animation(.motion(.base)))
                    .accessibilityAddTraits(.isModal)
                }
            }
            .onKeyPress(.escape) { open = false; return .handled }
        }
    }
    private func fieldView(_ label: String, text: Binding<String>, tag: Int) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.footnote)
            HStack(spacing: 8) {
                TextField(label, text: text).focused($field, equals: tag)
                    .textFieldStyle(.roundedBorder).font(.callout).frame(height: 36)
                Image(systemName: "checkmark.circle.fill").foregroundStyle(.green).opacity(valid(tag) ? 1 : 0)
            }
        }
    }
    private func valid(_ tag: Int) -> Bool { tag == 0 ? email.contains("@") && email.contains(".") : role.count >= 2 }
    private func next() {
        guard valid(step) else { error = step == 0 ? "Enter an email like maya@studio.co." : "Give a role with at least 2 letters."; field = step; return }
        error = ""
        if step == 0 { withMotion(.base, reduceMotion: reduce) { step = 1 }; field = 1 }
        else { withMotion(.snap, reduceMotion: reduce) { open = false } }
    }
}
