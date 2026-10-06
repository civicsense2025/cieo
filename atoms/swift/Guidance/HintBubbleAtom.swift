import SwiftUI
import Cieo

public struct HintBubbleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "hintbubble", category: "Guidance", name: "Hint bubble",
        summary: "The bubble rises beside the focused field and glides field to field on a trailing spring; only its text swaps. Typing snaps it shut — the quiet form is the terminal.")

    private let tips = ["First and last — it prints on the invoice.", "Work email — receipts land here, never spam."]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @FocusState private var field: Int?
    @State private var name = ""
    @State private var email = ""
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap a field · typing dismisses") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Billing details").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                    Text("The bubble follows your focus.").font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
                    ZStack(alignment: .topLeading) {
                        VStack(spacing: 0) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Name").font(.caption).foregroundStyle(.secondary)
                                TextField("Ada Lovelace", text: $name).font(.system(size: 14)).focused($field, equals: 0)
                            }.padding(.vertical, 10)
                            .overlay(alignment: .bottom) { Divider() }
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Email").font(.caption).foregroundStyle(.secondary)
                                TextField("ada@analytical.engine", text: $email).font(.system(size: 14)).focused($field, equals: 1)
                            }.padding(.vertical, 10)
                        }
                        if let f = field, (f == 0 ? name.isEmpty : email.isEmpty) {
                            Text(tips[f]).font(.system(size: 12.5)).lineSpacing(4).foregroundStyle(.background)
                                .padding(10).frame(width: 190, alignment: .leading)
                                .background(Color.primary, in: RoundedRectangle(cornerRadius: 10))
                                .offset(x: 90, y: f == 0 ? -64 : 22)
                                .id(f).motionTransition(.swap())
                                .animation(reduce ? nil : .motion(.base).delay(0.06), value: field)
                        }
                    }
                }
                .padding(.horizontal, 14).padding(.vertical, 14)
                .frame(width: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                HStack(spacing: 6) {
                    Text("Field:").font(.caption).foregroundStyle(.secondary)
                    Button("Name") { field = 0 }.buttonStyle(.bordered).controlSize(.mini)
                    Button("Email") { field = 1 }.buttonStyle(.bordered).controlSize(.mini)
                    Button("Hide") { field = nil }.buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
