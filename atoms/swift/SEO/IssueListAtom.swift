import SwiftUI
import Cieo

public struct IssueListAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "issuelist", category: "SEO", name: "Issue severity list",
        summary: "Rows arrive staggered 60ms apart on base. Tapping a row expands its measured fix-it panel; resolving fades the card and springs its height shut while the open count rolls down.")

    private struct Item: Identifiable {
        let id = UUID()
        let title: String
        let fix: String
        let severe: Bool
        var open = false
        var done = false
    }

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var items = [
        Item(title: "Missing meta descriptions", fix: "Add a unique description under 155 characters to each of the 14 pages listed.", severe: true),
        Item(title: "Slow LCP on /pricing", fix: "Compress the hero image under 200 KB and preload it. Target LCP under 2.5 s.", severe: false),
        Item(title: "Orphaned /changelog page", fix: "Link /changelog from the footer sitemap so crawlers can reach it within 3 hops.", severe: false)
    ]
    @State private var dividers = true
    public init() {}

    private var openCount: Int { items.filter { !$0.done }.count }

    public var body: some View {
        AtomStage(hint: "Tap a row to expand its fix") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 4) {
                    Text("Top issues ·").font(.headline)
                    RollingDigits(openCount).font(.headline)
                    Text("open").font(.headline)
                }
                VStack(spacing: 8) {
                    ForEach($items) { $item in
                        if !item.done {
                            VStack(alignment: .leading, spacing: 0) {
                                Button {
                                    withMotion(.base, reduceMotion: reduce) { item.open.toggle() }
                                } label: {
                                    HStack(spacing: 10) {
                                        Circle().fill(item.severe ? Color.red : Color.orange).frame(width: 10, height: 10)
                                        Text(item.title).font(.subheadline.weight(.semibold))
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                        Text("fix ▾").font(.caption).foregroundStyle(.secondary)
                                    }
                                    .frame(minHeight: 32)
                                }
                                .buttonStyle(.plain)
                                if item.open {
                                    Text(item.fix).font(.footnote).foregroundStyle(.secondary)
                                        .lineSpacing(4).padding(.vertical, 8)
                                    Button("Mark resolved") {
                                        withMotion(.snap, reduceMotion: reduce) { item.done = true }
                                    }
                                    .buttonStyle(.bordered).controlSize(.small)
                                    .padding(.bottom, 4)
                                }
                            }
                            .padding(.horizontal, 14).padding(.vertical, 10)
                            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                            .motionTransition(.presence)
                            if dividers && item.id != items.filter({ !$0.done }).last?.id {
                                Divider()
                            }
                        }
                    }
                }
                .motion(.base, value: openCount)
                if openCount == 0 {
                    Text("All clear ✓").font(.subheadline.weight(.semibold)).foregroundStyle(.green)
                        .motionTransition(.swap()).animation(reduce ? nil : .motion(.base), value: openCount)
                } else {
                    Text("Keep fixing — issues remain").font(.footnote).foregroundStyle(.secondary)
                        .motionTransition(.swap()).animation(reduce ? nil : .motion(.base), value: openCount)
                }
                Toggle("Dividers", isOn: $dividers).font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.checkbox)
                Button("Reset") {
                    withMotion(.base, reduceMotion: reduce) {
                        for i in items.indices { items[i].done = false; items[i].open = false }
                    }
                }
                .buttonStyle(.bordered).controlSize(.small)
            }
            .frame(width: 340)
        }
    }
}
