import SwiftUI
import Cieo

public struct ComposeFieldsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "composefields", category: "Email", name: "Compose fields",
        summary: "Recipient chips open width-first and the text fades in after. Bad addresses flag danger with a message; good ones settle into a success check terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var chips: [(String, Bool)] = []
    @State private var input = ""
    @State private var copySelf = false
    @FocusState private var focused: Bool
    public init() {}
    private var hasBad: Bool { chips.contains { !$0.1 } }
    private var allGood: Bool { !chips.isEmpty && chips.allSatisfy { $0.1 } }
    private var message: String {
        if chips.isEmpty { return "" }
        if allGood { return "Ready to send" }
        return "Add a valid email — “maya” needs @studio.co"
    }
    private var edge: Color {
        if allGood { return Color.green }
        if hasBad { return Color.red }
        return Color.secondary.opacity(0.4)
    }

    public var body: some View {
        AtomStage(hint: "Type an email, hit Enter") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("New message").font(.callout.weight(.semibold))
                    HStack(spacing: 6) {
                        TextField("To…", text: $input)
                            .softFieldSurface().font(.caption)
                            .focused($focused)
                            .onSubmit { add() }
                        Button("Add") { add() }.buttonStyle(.bordered).controlSize(.small)
                        Button("Cc") {
                            withMotion(.base, reduceMotion: reduce) { focused = true }
                        }.buttonStyle(.bordered).controlSize(.small)
                    }
                    if !chips.isEmpty {
                        FlowChips(chips: chips, remove: remove)
                            .motionTransition(.presence)
                    }
                    SwapText(message).font(.caption)
                        .foregroundStyle(allGood ? Color.green : Color.red)
                        .frame(height: 18, alignment: .leading)
                    Button("Send") {
                        withMotion(.base, reduceMotion: reduce) { focused = false }
                    }.buttonStyle(.borderedProminent).controlSize(.small)
                }
                .padding(14).frame(width: 320)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                .overlay(RoundedRectangle(cornerRadius: 14).fill(edge).opacity(0.10).allowsHitTesting(false))
                .animation(reduce ? nil : .motion(.base), value: chips.count)
                Toggle("Send copy to self", isOn: $copySelf)
                    .font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.switch).controlSize(.small)
            }
        }
    }

    private func add() {
        let v = input.trimmingCharacters(in: .whitespaces).replacingOccurrences(of: ",", with: "")
        if v.isEmpty { return }
        let good = v.contains("@") && v.contains(".")
        withMotion(.base, reduceMotion: reduce) { chips.append((v, good)); input = "" }
    }

    private func remove(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) { chips.remove(at: i) }
    }
}

private struct FlowChips: View {
    let chips: [(String, Bool)]
    let remove: (Int) -> Void

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 120), spacing: 6)], alignment: .leading, spacing: 6) {
            ForEach(chips.indices, id: \.self) { i in
                HStack(spacing: 6) {
                    Circle().fill(Color.accentColor.opacity(0.15))
                        .frame(width: 22, height: 22)
                        .overlay(Text(chips[i].0.prefix(1).uppercased()).font(.caption2.weight(.bold)))
                    Text(chips[i].0).font(.caption).lineLimit(1)
                    Button("×") { remove(i) }
                        .buttonStyle(.plain).font(.caption)
                        .foregroundStyle(Color.secondary)
                        .accessibilityLabel("Remove \(chips[i].0)")
                }
                .padding(.horizontal, 8).padding(.vertical, 5)
                .background(Capsule().fill(Color.primary.opacity(0.08)))
                .overlay(Capsule().fill(chips[i].1 ? Color.secondary.opacity(0.4) : Color.red).opacity(0.10).allowsHitTesting(false))
            }
        }
    }
}
