import SwiftUI
import Cieo

public struct TextFieldAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "field", category: "Interactive", name: "Text field",
        summary: "The label floats on focus. On blur the field settles into one of three states: neutral, valid in the success color with a check, or invalid in the danger color with a message.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @FocusState private var focused: Bool
    @State private var text = ""
    @State private var status = -1          // -1 neutral, 0 valid, 1 invalid
    @State private var float = Track(0, preset: .base)
    @State private var focus = Track(0, preset: .base)
    @State private var ok = Track(0, preset: .base)
    @State private var bad = Track(0, preset: .base)
    public init() {}

    private var isValid: Bool {
        let p = text.split(separator: "@", omittingEmptySubsequences: false)
        return p.count == 2 && !p[0].isEmpty && p[1].contains(".") && !p[1].hasPrefix(".") && !p[1].hasSuffix(".") && !text.contains(" ")
    }

    public var body: some View {
        AtomStage(hint: "Type an address, then press Tab") {
            TimelineView(.motion(float, focus, ok, bad)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let p = max(0, min(1, float.value(at: t))), g = max(0, min(1, ok.value(at: t))), k = max(0, min(1, bad.value(at: t))), q = max(0, min(1, focus.value(at: t)))
                VStack(alignment: .leading, spacing: 0) {
                    ZStack(alignment: .topLeading) {
                        RoundedRectangle(cornerRadius: 10).fill(.background)
                        RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.15 + 0.85 * q)).opacity(0.10)
                        RoundedRectangle(cornerRadius: 10).fill(Color.green.opacity(g)).opacity(0.10)
                        RoundedRectangle(cornerRadius: 10).fill(Color.red.opacity(k)).opacity(0.10)
                        Text("Email address")
                            .foregroundStyle(k > 0.5 ? Color.red : g > 0.5 ? Color.green : Color.secondary)
                            .scaleEffect(1 - 0.2 * p, anchor: .topLeading).offset(x: 13, y: 16 - 9 * p).allowsHitTesting(false)
                        TextField("", text: $text).textFieldStyle(.plain).focused($focused)
                            .autocorrectionDisabled().accessibilityLabel("Email address")
                            .padding(.leading, 12).padding(.trailing, 40).padding(.top, 25)
                        ZStack {
                            if status == 0 { Image(systemName: "checkmark").foregroundStyle(.green).motionTransition(.swap()) }
                            if status == 1 { Image(systemName: "exclamationmark.circle").foregroundStyle(.red).motionTransition(.swap()) }
                        }
                        .frame(width: 18, height: 18).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing).padding(.top, 17).padding(.trailing, 12)
                        .animation(reduce ? nil : .motion(.base), value: status)
                    }
                    .frame(height: 54).contentShape(Rectangle()).onTapGesture { focused = true }
                    Text("Enter an address like name@example.com").font(.caption).foregroundStyle(.red)
                        .padding(.top, 6).opacity(k).offset(y: (1 - k) * -4)
                        .frame(height: 22 * k, alignment: .top).clipped()
                        .accessibilityHidden(status != 1)
                }
                .frame(maxWidth: 320)
            }
        }
        .onChange(of: focused) { _, on in
            DataMotion.retarget(&float, to: on || !text.isEmpty ? 1 : 0, reduce: reduce)
            DataMotion.retarget(&focus, to: on ? 1 : 0, reduce: reduce)
            if !on { set(text.isEmpty ? -1 : isValid ? 0 : 1) }
        }
        .onChange(of: text) { _, _ in
            if status == 1 && isValid { set(0) } else if status == 0 && !isValid { set(-1) }
        }
    }

    private func set(_ s: Int) {
        status = s
        DataMotion.retarget(&ok, to: s == 0 ? 1 : 0, reduce: reduce)
        DataMotion.retarget(&bad, to: s == 1 ? 1 : 0, reduce: reduce)
    }
}
