import SwiftUI
import Cieo

public struct SearchResultPreviewAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "serp", category: "SEO", name: "Search result preview",
        summary: "The preview truncates exactly where a search engine would, as you type. Under each field a length bar fills on a spring and shifts from success to warning to danger as you near and pass the limit.")

    @State private var title = "Spring launch: new member tiers and yearly pricing"
    @State private var detail = "Members get first-day access to every drop, and yearly plans now save 20% over monthly billing."
    public init() {}

    public var body: some View {
        AtomStage(hint: "Edit the title or description") {
            VStack(alignment: .leading, spacing: 8) {
                field("Title", text: $title, limit: 60)
                field("Description", text: $detail, limit: 155)
                VStack(alignment: .leading, spacing: 2) {
                    Text("fieldnotes.example › spring-launch").font(.caption2).foregroundStyle(.secondary)
                    Text(cut(title, 60)).font(.subheadline.weight(.medium)).foregroundStyle(Color.accentColor)
                    Text(cut(detail, 155)).font(.caption).foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading).padding(10)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 10))
            }
            .frame(maxWidth: 340)
        }
    }

    private func cut(_ s: String, _ limit: Int) -> String {
        guard s.count > limit else { return s }
        var out = String(s.prefix(limit - 1))
        if let r = out.range(of: #"\s+\S*$"#, options: .regularExpression) { out.removeSubrange(r) }
        return out + " …"
    }

    private func field(_ name: String, text: Binding<String>, limit: Int) -> some View {
        let r = Double(text.wrappedValue.count) / Double(limit)
        return VStack(alignment: .leading, spacing: 4) {
            Text(name).font(.caption.weight(.medium))
            TextField(name, text: text, axis: .vertical).lineLimit(1...3).softFieldSurface()
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(.quaternary)
                    Capsule().fill(r > 1 ? Color.red : r > 0.7 ? Color.orange : Color.green)
                        .frame(width: g.size.width * min(1, r))
                }
            }
            .frame(height: 4).motion(.base, value: r)
            .accessibilityElement().accessibilityLabel("\(name) length").accessibilityValue("\(text.wrappedValue.count) of \(limit)")
        }
    }
}
