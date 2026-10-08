import SwiftUI
import Cieo

public struct SnippetEditorAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "snippeted", category: "SEO", name: "Snippet preview editor",
        summary: "Desktop and mobile tabs morph the preview height on base while the title and description swap with blur as you type. The rich-result row fades in and out.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var tab = 0
    @State private var title = "Spring launch: new member tiers and yearly pricing"
    @State private var detail = "Members get first-day access to every drop, and yearly plans save 20% over monthly billing."
    @State private var rich = true
    public init() {}

    private func cut(_ s: String, _ limit: Int) -> String {
        guard s.count > limit else { return s }
        var out = String(s.prefix(limit - 1))
        if let r = out.range(of: "\\s+\\S*$", options: .regularExpression) { out.removeSubrange(r) }
        return out + " …"
    }

    public var body: some View {
        AtomStage(hint: "Edit the fields or switch tabs") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Snippet preview").font(.headline)
                Picker("Viewport", selection: $tab) {
                    Text("Desktop").tag(0); Text("Mobile").tag(1)
                }
                .pickerStyle(.segmented).frame(width: 200)
                .motion(.base, value: tab)
                TextField("Title", text: $title).softFieldSurface().font(.subheadline)
                TextField("Description", text: $detail, axis: .vertical).lineLimit(2).softFieldSurface().font(.footnote)
                VStack(alignment: .leading, spacing: 2) {
                    Text("fieldnotes.example › spring-launch").font(.caption2).foregroundStyle(.secondary)
                    SwapText(cut(title, tab == 0 ? 60 : 45)).font(.subheadline.weight(.medium)).foregroundStyle(Color.accentColor)
                    SwapText(cut(detail, tab == 0 ? 155 : 120)).font(.caption).foregroundStyle(.secondary)
                    if rich {
                        Text("★ 4.8 · 212 reviews · Updated Mar 2026").font(.caption2).foregroundStyle(.secondary)
                            .motionTransition(.presence)
                    }
                }
                .frame(maxWidth: tab == 0 ? .infinity : 280, alignment: .leading)
                .padding(14).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                .motion(.base, value: tab)
                Toggle("Rich result extras", isOn: $rich).font(.caption).foregroundStyle(.secondary)
                    .nativeToggleStyle()
            }
            .frame(width: 340)
        }
    }
}
