import SwiftUI
import Cieo

public struct MultiStepFormAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "multistep", category: "Interactive", name: "Multi-step form",
        summary: "Panels slide sideways in the direction of travel with the blur swap. An empty required field rings in the danger color with a message; the final step confirms in the success color.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let fields = [("Your name", "Ada Lovelace"), ("Work email", "ada@studio.co")]
    @State private var step = 0
    @State private var values = ["", ""]
    @State private var errors = [false, false]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Leave a field empty, then continue") {
            VStack(spacing: 12) {
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        Capsule().fill(.quaternary)
                        Capsule().fill(.primary).frame(width: g.size.width * Double(step) / 2)
                            .animation(reduce ? nil : .motion(.base), value: step)
                    }
                }
                .frame(height: 4)
                ZStack(alignment: .topLeading) { ForEach(0..<3, id: \.self) { panel($0) } }
                    .frame(height: 96).clipped()
                HStack {
                    Button("Back") { go(step - 1) }.buttonStyle(.bordered).opacity(step == 1 ? 1 : 0).disabled(step != 1)
                    Spacer()
                    Button(step == 1 ? "Send" : step == 2 ? "Start over" : "Continue", action: next).buttonStyle(.borderedProminent)
                        .keyboardShortcut(.defaultAction)
                }
            }
            .padding(16).frame(maxWidth: 320)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    /// Panels sit left or right of the current one, so travel direction falls out of their order.
    private func panel(_ k: Int) -> some View {
        let current = k == step
        return Group {
            if k < 2 {
                VStack(alignment: .leading, spacing: 6) {
                    Text(fields[k].0).font(.caption.weight(.medium))
                    TextField(fields[k].1, text: $values[k]).textFieldStyle(.plain).padding(.horizontal, 11).padding(.vertical, 9)
                        .overlay(RoundedRectangle(cornerRadius: 9).stroke(errors[k] ? Color.red : Color.primary.opacity(0.15), lineWidth: 1.5))
                        .accessibilityLabel(fields[k].0)
                        .onChange(of: values[k]) { _, v in if !v.trimmingCharacters(in: .whitespaces).isEmpty { errors[k] = false } }
                    Text("This field is required").font(.caption).foregroundStyle(.red).opacity(errors[k] ? 1 : 0).offset(y: errors[k] ? 0 : -3)
                }
                .animation(reduce ? nil : .motion(.base), value: errors[k])
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    Label("Request sent", systemImage: "checkmark.circle").fontWeight(.semibold).foregroundStyle(.green)
                    Text("We’ll reply within one business day.").font(.caption).foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .opacity(current ? 1 : 0).blur(radius: current ? 0 : 4).offset(x: current ? 0 : (k < step ? -16 : 16))
        .allowsHitTesting(current).accessibilityHidden(!current)
        .animation(reduce ? nil : (current ? .motion(.base).delay(Motion.exit) : .motionExit), value: step)
    }

    private func go(_ n: Int) { withMotion(.base, reduceMotion: reduce) { step = max(0, min(2, n)) } }

    private func next() {
        if step == 2 { values = ["", ""]; go(0); return }
        if values[step].trimmingCharacters(in: .whitespaces).isEmpty { withMotion(.base, reduceMotion: reduce) { errors[step] = true }; return }
        errors[step] = false
        go(step + 1)
    }
}
