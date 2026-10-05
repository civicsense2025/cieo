import SwiftUI
import Cieo

public struct TableOfContentsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "toc", category: "Content", name: "Table of contents",
        summary: "The active marker tracks the section you are reading, with lagging edges so it stretches between short and long entries. Clicking an entry scrolls there on a spring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var active = 0
    @State private var links: [AnyHashable: CGRect] = [:]
    @State private var sections: [AnyHashable: CGRect] = [:]
    private let items: [(String, String)] = [
        ("Setup", "Install the CLI, sign in, and pick a starter. The starter sets your fonts, colors and first three pages."),
        ("Pages", "Pages are made of blocks. Drag a block from the panel, then edit its text in place."),
        ("Domains", "Point a CNAME at your site. Certificates are issued within a few minutes."),
        ("Members", "Turn on member areas to gate posts. Readers sign in with a link sent to their email."),
        ("Publishing", "Publish sends every changed page live at once. You can roll back from history."),
    ]
    public init() {}

    public var body: some View {
        AtomStage {
            ScrollViewReader { proxy in
                HStack(spacing: 0) {
                    nav(proxy)
                    Divider()
                    article
                }
                .frame(maxWidth: 400).frame(height: 280)
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    private func nav(_ proxy: ScrollViewProxy) -> some View {
        ZStack(alignment: .topLeading) {
            if let f = links[active] {
                BasicsVerticalEdges(frame: CGRect(x: 12, y: f.minY + 3, width: 2, height: max(0, f.height - 6)),
                                    shape: Capsule(), style: Color.primary)
            }
            VStack(alignment: .leading, spacing: 0) {
                ForEach(items.indices, id: \.self) { i in
                    Button {
                        withAnimation(reduce ? nil : .motion(.soft)) { proxy.scrollTo(i, anchor: .top) }
                    } label: {
                        Text(items[i].0).font(.footnote)
                            .foregroundStyle(active == i ? Color.primary : Color.secondary)
                            .padding(.vertical, 4).padding(.leading, 12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .contentShape(Rectangle())
                            .reportFrame(i, in: "toc")
                    }
                    .buttonStyle(.plain)
                    .motion(.snap, value: active)
                    .accessibilityAddTraits(active == i ? .isSelected : [])
                }
            }
        }
        .coordinateSpace(name: "toc")
        .onPreferenceChange(FramePreferenceKey.self) { links = $0 }
        .padding(.vertical, 12).padding(.leading, 12)
        .frame(width: 130, alignment: .topLeading).frame(maxHeight: .infinity, alignment: .top)
    }

    private var article: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(items.indices, id: \.self) { i in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(items[i].0).font(.subheadline.weight(.semibold))
                        Text(items[i].1)
                        Text(items[i].1).foregroundStyle(.secondary)
                    }
                    .font(.footnote)
                    .padding(.top, 14).padding(.bottom, 6)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .id(i)
                    .reportFrame(i, in: "article")
                }
                Color.clear.frame(height: 160)
            }
            .padding(.horizontal, 14)
        }
        .coordinateSpace(name: "article")
        .onPreferenceChange(FramePreferenceKey.self) { sections = $0 }
        .onChange(of: sections) { _, s in
            let i = items.indices.last { (s[$0]?.minY ?? .infinity) <= 14 } ?? 0
            if i != active { active = i }
        }
    }
}
