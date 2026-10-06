import SwiftUI
import Cieo

public struct SigGuideAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sigguide", category: "Documents", name: "Signature ceremony",
        summary: "A pulse travels to the next open field. Skipping rings danger; signing inks a success check and holds a signed terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var name = ""
    @State private var email = ""
    @State private var signed = false
    @State private var danger = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Next through empty fields to feel the rings") {
            VStack(spacing: 8) {
                HStack(alignment: .top, spacing: 12) {
                    Circle().fill(Color.accentColor).frame(width: 14, height: 14).padding(.top, 14 + CGFloat(step) * 62)
                        .animation(reduce ? nil : .motion(.base), value: step)
                    VStack(spacing: 0) {
                        field(label: "FIELD 1 OF 3", text: "Full name", value: $name, index: 0)
                        Divider()
                        field(label: "FIELD 2 OF 3", text: "Email", value: $email, index: 1)
                        Divider()
                        VStack(alignment: .leading, spacing: 6) {
                            Text("FIELD 3 OF 3").font(.system(size: 11)).foregroundStyle(.secondary)
                            HStack(spacing: 8) {
                                Button("Sign here") { next() }.frame(minHeight: 32)
                                if signed { Image(systemName: "checkmark").foregroundStyle(.green).motionTransition(.swap()) }
                            }
                        }.padding(.vertical, 8).opacity(signed || step >= 2 ? 1 : 0.45)
                        ZStack(alignment: .leading) {
                            if signed { Text("Document signed — thank you ✓").foregroundStyle(.green).motionTransition(.swap()) }
                        }
                        .font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                    }
                }
                HStack(spacing: 8) {
                    Button("Next field", action: next).frame(minHeight: 32)
                    Button("Reset") { withMotion(.base, reduceMotion: reduce) { step = 0; signed = false; name = ""; email = "" } }.frame(minHeight: 32)
                }.buttonStyle(.bordered)
            }
            .padding(16).frame(maxWidth: 340)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func field(label: String, text: String, value: Binding<String>, index: Int) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.system(size: 11)).foregroundStyle(.secondary)
            TextField(text, text: value).textFieldStyle(.roundedBorder).frame(minHeight: 32)
        }
        .padding(.vertical, 8).opacity(signed || index <= step ? 1 : 0.45)
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(danger && index == step ? .red : .clear, lineWidth: 2))
    }

    private func next() {
        if signed { return }
        if step < 2 && (step == 0 ? name.isEmpty : email.isEmpty) {
            withMotion(.snap, reduceMotion: reduce) { danger = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) {
                withMotion(.base, reduceMotion: reduce) { danger = false }
            }
            return
        }
        if step >= 2 {
            withMotion(.base, reduceMotion: reduce) { signed = true }
            return
        }
        withMotion(.base, reduceMotion: reduce) { step += 1 }
    }
}
