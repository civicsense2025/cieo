import SwiftUI
import Cieo

public struct AttendeeFieldsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "attendees", category: "Scheduling", name: "Attendee fields",
        summary: "Fields validate as you type. A bad value rings red with its message; a good one earns a success check. A clean invite holds.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var name = ""
    @State private var email = ""
    @State private var sent = false
    @State private var errName = Track(0)
    @State private var errMail = Track(0)
    @State private var okName = Track(0)
    @State private var okMail = Track(0)
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }
    private var nameGood: Bool { name.trimmingCharacters(in: .whitespaces).count >= 2 }
    private var mailGood: Bool { email.contains("@") && email.contains(".") && !email.contains(" ") && email.count > 5 }

    public var body: some View {
        AtomStage(hint: "Invalid rings red · valid earns a check") {
            TimelineView(.motion(errName, errMail, okName, okMail)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                VStack(spacing: 10) {
                    field("Name", text: $name, err: errName.value(at: t), ok: okName.value(at: t),
                        msg: "Enter a name (2+ letters)", show: errName.target > 0.5)
                    field("Email", text: $email, err: errMail.value(at: t), ok: okMail.value(at: t),
                        msg: "Enter a valid email", show: errMail.target > 0.5)
                    Button(sent ? "Invite sent" : "Send invite") { send() }
                        .font(.system(size: 14, weight: .semibold))
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .background(sent ? .green : .primary, in: RoundedRectangle(cornerRadius: 10))
                        .foregroundStyle(.white)
                }
                .frame(maxWidth: 300)
            }
        }
    }

    private func field(_ title: String, text: Binding<String>, err: Double, ok: Double, msg: String, show: Bool) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.system(size: 13))
            TextField(title, text: text)
                .font(.system(size: 13)).frame(minHeight: 36)
                .padding(.horizontal, 10).padding(.trailing, 22)
                .background(.background, in: RoundedRectangle(cornerRadius: 8))
                .overlay(RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(err > 0.02 ? .red : ok > 0.5 ? .green : .secondary.opacity(0.3)))
                .overlay(alignment: .trailing) {
                    Image(systemName: "checkmark").font(.system(size: 13, weight: .semibold)).foregroundStyle(.green)
                        .frame(width: 16 * ok).opacity(ok).padding(.trailing, 8).offset(y: -1)
                }
                .onChange(of: text.wrappedValue) { _, _ in validate(live: true) }
            Text(show ? msg : " ").font(.system(size: 12)).foregroundStyle(.red).frame(height: 18)
        }
    }

    private func set(_ t: inout Track, _ v: Double) {
        if reduce { t.jump(v) } else { t.set(v, at: now()) }
    }

    private func validate(live: Bool) {
        if live && name.isEmpty && errName.target == 0 { set(&okName, 0) }
        else { set(&errName, !nameGood && (!name.isEmpty || !live) ? 1 : 0); set(&okName, nameGood ? 1 : 0) }
        if live && email.isEmpty && errMail.target == 0 { set(&okMail, 0) }
        else { set(&errMail, !mailGood && (!email.isEmpty || !live) ? 1 : 0); set(&okMail, mailGood ? 1 : 0) }
    }

    private func send() {
        validate(live: false)
        if nameGood && mailGood { sent = true }
    }
}
