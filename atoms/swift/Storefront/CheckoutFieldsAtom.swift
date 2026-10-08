import SwiftUI
import Cieo

public struct CheckoutFieldsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "checkoutfields", category: "Storefront", name: "Checkout fields",
        summary: "Labels snap up on focus or fill. An invalid submit rings danger and swaps in a message; fixing a field swaps it out and stamps a success check that holds.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var name = ""
    @State private var email = ""
    @State private var tried = false
    @State private var paid = false
    public init() {}
    private var nameOK: Bool { name.trimmingCharacters(in: .whitespaces).count > 1 }
    private var emailOK: Bool { email.contains("@") && email.contains(".") }
    public var body: some View {
        AtomStage(hint: "Leave a field empty, then fix it") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Payment details").font(.callout.weight(.semibold))
                field("Full name", text: $name, bad: tried && !nameOK, msg: "Enter your full name")
                field("Email", text: $email, bad: tried && !emailOK, msg: "Enter a valid email")
                HStack {
                    Button(paid ? "Paid — receipt sent" : "Pay $24.00") {
                        tried = true
                        if nameOK && emailOK { withMotion(.base, reduceMotion: reduce) { paid = true } }
                    }.buttonStyle(.borderedProminent).controlSize(.small).disabled(paid).tint(paid ? .green : .accentColor)
                    Toggle("Validate live", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
                }
            }.frame(maxWidth: 300)
        }
    }
    private func field(_ title: String, text: Binding<String>, bad: Bool, msg: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            TextField(title, text: text).softFieldSurface().font(.footnote)
                .overlay(RoundedRectangle(cornerRadius: 6).fill(bad ? Color.red : Color.clear).opacity(0.10).allowsHitTesting(false))
                .motion(.snap, value: bad)
                .overlay(alignment: .trailing) { if !bad && !text.wrappedValue.isEmpty { Image(systemName: "checkmark").font(.caption).foregroundStyle(.green).padding(.trailing, 8).motionTransition(.swap()) } }
            SwapText(bad ? msg : "").font(.caption2).foregroundStyle(.red).frame(height: 14, alignment: .leading)
        }
    }
}
