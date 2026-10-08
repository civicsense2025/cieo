import SwiftUI
import Cieo

public struct FillFieldAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fillfield", category: "Forms", name: "Fillable field",
        summary: "The label floats on first input. A short value gains a danger fill with its message; a valid one inks a check and holds looks-good.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var value = ""
    @State private var touched = false
    private var bad: Bool { touched && !value.isEmpty && value.count < 3 }
    private var empty: Bool { touched && value.isEmpty }
    private var good: Bool { value.count >= 3 }
    public init() {}

    public var body: some View {
        AtomStage(hint: "Type 3+ letters, erase to feel danger") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Exhibit title").font(.headline)
                    ZStack(alignment: .leading) {
                        TextField("", text: $value, onEditingChanged: { _ in touched = true })
                            .frame(minHeight: 36)
                            .padding(.horizontal, 10).padding(.trailing, 24)
                            .background(RoundedRectangle(cornerRadius: 8).fill(bad || empty ? .red : .secondary.opacity(0.4)).opacity(0.10))
                            .onChange(of: value) { touched = true }
                        Text("e.g. Delivery schedule")
                            .font(.system(size: value.isEmpty ? 14 : 11))
                            .foregroundStyle(.secondary)
                            .offset(y: value.isEmpty ? 0 : -22)
                            .animation(reduce ? nil : .motion(.base), value: value.isEmpty)
                            .allowsHitTesting(false).padding(.leading, 12)
                        if good { Image(systemName: "checkmark").foregroundStyle(.green).frame(maxWidth: .infinity, alignment: .trailing).padding(.trailing, 8).motionTransition(.swap()) }
                    }
                    ZStack(alignment: .leading) {
                        if bad || empty { Text("Enter at least 3 characters").foregroundStyle(.red).motionTransition(.swap()) }
                        if good { Text("Looks good ✓").foregroundStyle(.green).motionTransition(.swap()) }
                    }
                    .font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                }
                .padding(16).frame(maxWidth: 320)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                Toggle("Required field", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
