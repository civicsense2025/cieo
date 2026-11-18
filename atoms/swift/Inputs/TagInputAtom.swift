import SwiftUI
import Cieo
import CieoUI

public struct TagInputAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "taginput", category: "Inputs", name: "Tag input",
        summary: "A new chip opens its own width before its text fades in. Removing reverses it: text out first, then the gap closes, so neighbors slide over instead of jumping.")
    private struct Tag: Identifiable {
        let id = UUID()
        let text: String
        var instant = false
        var removing = false
    }
    @State private var tags = ["design", "motion", "docs"].map { Tag(text: $0, instant: true) }
    @State private var draft = ""
    public init() {}

    public var body: some View {
        AtomStage(hint: "Return or comma adds · Delete removes the last") {
            BasicsLeadingFlow {
                ForEach(tags) { tag in
                    Chip(tag: tag) { remove(tag.id) }
                }
                TextField("Add a tag", text: $draft).textFieldStyle(.plain).font(.callout)
                    .frame(minWidth: 80).padding(4)
                    .onSubmit(commit)
                    .onKeyPress(.delete) {
                        guard draft.isEmpty, let last = tags.last(where: { !$0.removing }) else { return .ignored }
                        remove(last.id)
                        return .handled
                    }
                    .onChange(of: draft) { _, new in
                        if new.hasSuffix(",") { draft = String(new.dropLast()); commit() }
                    }
            }
            .padding(8).frame(maxWidth: 320).frame(minHeight: 46)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
        }
    }

    private func commit() {
        let text = draft.trimmingCharacters(in: .whitespaces).lowercased()
        draft = ""
        guard !text.isEmpty, !tags.contains(where: { $0.text == text && !$0.removing }) else { return }
        tags.append(Tag(text: text))
    }

    private func remove(_ id: UUID) {
        guard let i = tags.firstIndex(where: { $0.id == id }), !tags[i].removing else { return }
        tags[i].removing = true
        Task {
            try? await Task.sleep(for: .seconds(0.7))
            tags.removeAll { $0.id == id }
        }
    }

    private struct Chip: View {
        @Environment(\.accessibilityReduceMotion) private var reduce
        let tag: Tag
        let remove: () -> Void
        @State private var w: CGFloat
        @State private var o: Double
        @State private var natural: CGFloat?

        init(tag: Tag, remove: @escaping () -> Void) {
            self.tag = tag
            self.remove = remove
            _w = State(initialValue: tag.instant ? 1 : 0)
            _o = State(initialValue: tag.instant ? 1 : 0)
        }

        var body: some View {
            HStack(spacing: 4) {
                Text(tag.text)
                Button(action: remove) { Image(systemName: "xmark").font(.caption2.weight(.bold)).foregroundStyle(.secondary).padding(2) }
                    .buttonStyle(.plain).accessibilityLabel("Remove \(tag.text)")
            }
            .font(.footnote.weight(.medium)).padding(.leading, 10).padding(.trailing, 6)
            .opacity(o).fixedSize()
            .background(GeometryReader { g in Color.clear.onAppear { natural = g.size.width } })
            .frame(width: natural.map { $0 * w }, alignment: .leading).clipped()
            .frame(height: 28)
            .background(Capsule().fill(Color.primary.opacity(0.1)))
            .padding(.trailing, -6 * (1 - w))
            .onAppear {
                guard !tag.instant else { return }
                if reduce { w = 1; o = 1; return }
                withAnimation(.motion(.base)) { w = 1 }
                withAnimation(.motion(.base).delay(Motion.lag)) { o = 1 }
            }
            .onChange(of: tag.removing) { _, gone in
                guard gone else { return }
                withAnimation(reduce ? nil : .motion(.snap)) { o = 0 }
                withAnimation(reduce ? nil : .motion(.base).delay(Motion.exit)) { w = 0 }
            }
        }
    }
}

/// Left-aligned wrapping rows with 6 pt gaps delegating to `CieoUI.FlowStack`.
struct BasicsLeadingFlow<Content: View>: View {
    let content: Content
    init(@ViewBuilder content: () -> Content) { self.content = content() }
    var body: some View { FlowStack(spacing: 6) { content } }
}
