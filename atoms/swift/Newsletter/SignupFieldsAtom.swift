import SwiftUI
import Cieo

public struct SignupFieldsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "signupfields", category: "Newsletter", name: "Signup fields",
        summary: "Labels float on focus. A complete field snaps a success check; an incomplete one rings danger with a message.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var name = ""
    @State private var email = ""
    @State private var nameFocus = false
    @State private var mailFocus = false
    @State private var tried = false
    @State private var done = false
    public init() {}

    private var mailOk: Bool { email.range(of: #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#, options: .regularExpression) != nil }
    private var nameOk: Bool { name.trimmingCharacters(in: .whitespaces).count > 1 }
    private var mailBad: Bool { tried && !email.isEmpty && !mailOk }

    public var body: some View {
        AtomStage(hint: "Leave email wrong once, then fix it") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Join the letter").font(.callout.weight(.semibold))
                Text("Name first, then a valid email.").font(.caption).foregroundStyle(.secondary)
                field(title: "First name", text: $name, focused: $nameFocus, ok: tried && nameOk, bad: tried && !nameOk)
                field(title: "Email address", text: $email, focused: $mailFocus, ok: mailOk, bad: mailBad)
                ZStack {
                    if mailBad {
                        Text("Enter an address like name@example.com")
                            .font(.caption).foregroundStyle(.red).motionTransition(.presence)
                    }
                }.frame(height: 16, alignment: .leading)
                Button(done ? "You're subscribed" : "Subscribe") { submit() }
                    .buttonStyle(.borderedProminent).controlSize(.regular)
                    .frame(maxWidth: .infinity)
                    .tint(done ? .green : .accentColor)
            }
            .padding(16).frame(width: 340)
            .background(.background, in: RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
        }
    }

    private func field(title: String, text: Binding<String>, focused: Binding<Bool>, ok: Bool, bad: Bool) -> some View {
        ZStack(alignment: .leading) {
            Text(title)
                .font((focused.wrappedValue || !text.wrappedValue.isEmpty) ? .caption2 : .footnote)
                .foregroundStyle(bad ? .red : ok ? .green : .secondary)
                .offset(y: (focused.wrappedValue || !text.wrappedValue.isEmpty) ? -14 : 0)
                .animation(reduce ? nil : .motion(.base), value: focused.wrappedValue)
                .animation(reduce ? nil : .motion(.base), value: text.wrappedValue)
            TextField("", text: text, onEditingChanged: { focused.wrappedValue = $0 })
                .textFieldStyle(.plain).font(.callout)
                .padding(.top, 14)
                .frame(height: 54)
            HStack {
                Spacer()
                if ok {
                    Image(systemName: "checkmark").fontWeight(.bold).foregroundStyle(.green)
                        .motionTransition(.swap())
                }
            }
        }
        .padding(.horizontal, 13)
        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(bad ? .red : ok ? .green : .secondary.opacity(0.4), lineWidth: 1.5))
        .animation(reduce ? nil : .motion(.snap), value: ok)
    }

    private func submit() {
        withMotion(.snap, reduceMotion: reduce) { tried = true }
        guard nameOk && mailOk else { return }
        withMotion(.snap, reduceMotion: reduce) { done = true }
    }
}
