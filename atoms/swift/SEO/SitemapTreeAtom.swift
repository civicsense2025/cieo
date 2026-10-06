import SwiftUI
import Cieo

public struct SitemapTreeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sitemap", category: "SEO", name: "Sitemap tree",
        summary: "Folders open with height and chevron riding the same base spring, so they never disagree. Orphaned pages carry a warning tint, and the selection trails the tapped row.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var journalOpen = false
    @State private var selected = "/"
    @State private var flagOrphans = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open a folder, then pick a page") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Sitemap · 8 pages").font(.headline)
                VStack(spacing: 0) {
                    folderRow("/", open: .constant(true), locked: true)
                    pageRow("/pricing")
                    pageRow("/journal")
                    folderRow("/journal", open: $journalOpen, locked: false)
                    if journalOpen {
                        pageRow("/journal/spring-launch", indent: 34)
                        pageRow("/journal/yearly-guide", indent: 34)
                    }
                    pageRow("/changelog", orphan: true)
                }
                .padding(8).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                .motion(.base, value: journalOpen)
                Toggle("Flag orphans", isOn: $flagOrphans).font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.checkbox)
            }
            .frame(width: 340)
        }
    }

    private func folderRow(_ name: String, open: Binding<Bool>, locked: Bool) -> some View {
        Button {
            if !locked { withMotion(.base, reduceMotion: reduce) { open.wrappedValue.toggle() } }
            withMotion(.base, reduceMotion: reduce) { selected = name }
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "chevron.down").font(.caption2).foregroundStyle(.secondary)
                    .rotationEffect(.degrees(open.wrappedValue ? 0 : -90))
                    .motion(.base, value: open.wrappedValue)
                Text(name).font(.subheadline.weight(.semibold))
                Spacer()
            }
            .frame(minHeight: 36).padding(.horizontal, 10)
            .background(selected == name ? Color.accentColor.opacity(0.12) : Color.clear, in: RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
        .motion(.base, value: selected)
    }

    private func pageRow(_ name: String, indent: CGFloat = 34, orphan: Bool = false) -> some View {
        Button {
            withMotion(.base, reduceMotion: reduce) { selected = name }
        } label: {
            HStack(spacing: 8) {
                Text(name).font(.footnote)
                Spacer()
                if orphan && flagOrphans {
                    Text("orphan").font(.caption2.weight(.semibold)).foregroundStyle(.orange)
                }
            }
            .frame(minHeight: 32).padding(.horizontal, 10).padding(.leading, indent - 10)
            .background {
                if orphan && flagOrphans { RoundedRectangle(cornerRadius: 8).fill(Color.orange.opacity(0.10)) }
                if selected == name { RoundedRectangle(cornerRadius: 8).fill(Color.accentColor.opacity(0.12)) }
            }
        }
        .buttonStyle(.plain)
        .motion(.base, value: selected)
        .motionTransition(.presence)
    }
}
