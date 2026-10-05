import SwiftUI
import Cieo

public struct QuickCreateAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "quickcreate", category: "Editor", name: "Quick create",
        summary: "The New button is one surface. Clicking grows it into a menu of kinds, whose rows rise in 35ms apart. Choosing a kind morphs the same surface into a one-line form that stretches across the header and fades the title out. Submitting turns it into a green Created pill, and only then does the new row open at the top of the list while the others slide down.")

    private enum Stage { case button, menu, form, done }
    private struct Row: Identifiable { let id = UUID(); let title: String; var shown = true }
    private let kinds = [("Page", "doc"), ("Post", "text.alignleft"), ("Collection", "square.stack")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var stage = Stage.button
    @State private var kind = "Page"
    @State private var title = ""
    @State private var rows = ["Home", "About", "Pricing"].map { Row(title: $0) }
    public init() {}

    private var size: CGSize {
        switch stage { case .button: CGSize(width: 90, height: 36); case .menu: CGSize(width: 170, height: 124); case .form: CGSize(width: 330, height: 36); case .done: CGSize(width: 104, height: 36) }
    }

    public var body: some View {
        AtomStage(hint: "Create something new") {
            VStack(alignment: .leading, spacing: 10) {
                ZStack(alignment: .topLeading) {
                    HStack { Text("Content").font(.headline).opacity(stage == .form ? 0 : 1); Spacer() }.frame(height: 36)
                    surface
                }.frame(width: 340, height: 130, alignment: .topLeading).zIndex(1)
                VStack(spacing: 0) { ForEach(rows) { r in
                    EditorHeightReveal(progress: r.shown ? 1 : 0) { Text(r.title).font(.footnote).frame(maxWidth: .infinity, minHeight: 40, alignment: .leading).padding(.horizontal, 12).overlay(alignment: .bottom) { Divider() } }.clipped()
                } }.frame(width: 340).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 10))
            }
        }
    }

    private var surface: some View {
        ZStack(alignment: .topLeading) {
            Group {
                switch stage {
                case .button: Button { go(.menu) } label: { Label("New", systemImage: "plus").font(.footnote.weight(.semibold)).frame(maxWidth: .infinity, maxHeight: .infinity) }.buttonStyle(.plain)
                case .menu:
                    VStack(spacing: 0) { ForEach(Array(kinds.enumerated()), id: \.offset) { i, k in
                        Button { kind = k.0; go(.form) } label: { Label(k.0, systemImage: k.1).font(.footnote).frame(maxWidth: .infinity, minHeight: 38, alignment: .leading).padding(.horizontal, 12) }.buttonStyle(.plain)
                            .transition(reduce ? .identity : .opacity.combined(with: .offset(y: 8)).animation(.motion(.base).delay(0.08 + Double(i) * 0.035)))
                    } }
                case .form:
                    HStack(spacing: 8) {
                        Text(kind).font(.caption.weight(.semibold)).padding(.leading, 12)
                        TextField("Title", text: $title).textFieldStyle(.plain).font(.footnote).onSubmit(submit)
                        Button("Create", action: submit).buttonStyle(.borderedProminent).controlSize(.small).padding(.trailing, 4)
                    }.frame(maxHeight: .infinity)
                case .done: Label("Created", systemImage: "checkmark").font(.footnote.weight(.semibold)).foregroundStyle(.green).frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }.transition(reduce ? .identity : .opacity)
        }
        .frame(width: size.width, height: size.height, alignment: .topLeading)
        .background(RoundedRectangle(cornerRadius: stage == .menu ? 12 : 18).fill(stage == .done ? Color.green.opacity(0.18) : Color(white: 0.5).opacity(0.14)))
        .clipShape(RoundedRectangle(cornerRadius: stage == .menu ? 12 : 18)).shadow(color: .black.opacity(stage == .menu ? 0.15 : 0), radius: 8, y: 3)
        .animation(reduce ? nil : .motion(.base), value: stage)
    }

    private func go(_ s: Stage) { withMotion(.base, reduceMotion: reduce) { stage = s } }

    private func submit() {
        let name = title.trimmingCharacters(in: .whitespaces).isEmpty ? "Untitled \(kind.lowercased())" : title
        go(.done); title = ""
        Task {
            try? await Task.sleep(for: .seconds(0.16))
            var row = Row(title: name); row.shown = false
            withMotion(.base, reduceMotion: reduce) { rows.insert(row, at: 0) }
            DispatchQueue.main.async { withMotion(.base, reduceMotion: reduce) { rows[0].shown = true } }
            try? await Task.sleep(for: .seconds(1.5))
            go(.button)
        }
    }
}
