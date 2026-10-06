import SwiftUI
import Cieo

public struct FormFlowAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "formflow", category: "Layout", name: "Multi-column flow",
        summary: "Fields reflow between two columns and one without jumping. An error swaps in and pushes the rows below it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var oneCol = false
    @State private var liveError = true
    @State private var email = ""
    @State private var showError = false
    @State private var saved = false
    @FocusState private var emailFocused: Bool
    public init() {}

    public var body: some View {
        AtomStage(hint: "Toggle columns, then save with an empty email") {
            VStack(spacing: 8) {
                Text("Multi-column flow").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text(saved ? "Saved" : showError ? "Missing email" : "Draft")
                    .font(.caption).foregroundStyle(.secondary)
                    .transition(.motionSwap()).id("\(saved)-\(showError)")
                grid
                    .padding(14)
                    .frame(maxWidth: 440)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay {
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(saved ? Color.green : Color.clear, lineWidth: 2)
                            .animation(reduce ? nil : .motion(.base), value: saved)
                    }
                HStack(spacing: 8) {
                    Button(saved ? "Saved" : "Save") { save() }
                        .buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                        .disabled(saved)
                    Button("2-col / 1-col") { oneCol.toggle() }
                        .buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    Toggle("Live error", isOn: $liveError).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
            .frame(maxWidth: 560)
        }
    }

    private var grid: some View {
        let cols = [GridItem(.flexible()), GridItem(.flexible())]
        let single = [GridItem(.flexible())]
        return LazyVGrid(columns: oneCol ? single : cols, spacing: 8) {
            field("Name", text: .constant("Ada"))
            VStack(alignment: .leading, spacing: 4) {
                Text("Email").font(.footnote)
                TextField("you@site.com", text: $email)
                    .textFieldStyle(.roundedBorder).controlSize(.small)
                    .focused($emailFocused)
                    .onChange(of: email) { _, v in
                        if liveError && !v.trimmingCharacters(in: .whitespaces).isEmpty && showError {
                            showError = false
                        }
                    }
                if showError {
                    Text("Email is needed before you can save.")
                        .font(.caption).foregroundStyle(.red).lineSpacing(3)
                        .transition(.motionSwap())
                }
            }
            field("City", text: .constant("Lagos"))
            field("Zip", text: .constant("10001"))
        }
        .animation(reduce ? nil : .motion(.base), value: oneCol)
        .animation(reduce ? nil : .motion(.base), value: showError)
    }

    private func field(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.footnote)
            TextField(label, text: text).textFieldStyle(.roundedBorder).controlSize(.small)
        }
    }

    private func save() {
        if email.trimmingCharacters(in: .whitespaces).isEmpty {
            showError = true; saved = false; emailFocused = true
        } else {
            showError = false; saved = true
        }
    }
}
