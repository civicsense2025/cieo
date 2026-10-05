import SwiftUI
import Cieo

public struct PullToRefreshAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pullrefresh", category: "Files and browsing", name: "Pull to refresh",
        summary: "The list follows the pull with growing resistance while the arrow turns to say “release”. Past the threshold it holds open on a spinner, a new item arrives, and the list springs shut.")

    private struct Row: Identifiable { let id = UUID(); let title: String; var fresh = false }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var rows = ["Harbor at 6am", "On member pricing", "Three CSS habits", "A smaller homepage", "Fog bank"].map { Row(title: $0) }
    @State private var y = Track(0)
    @State private var held = false
    @State private var pull = 0.0
    @State private var loading = false
    @State private var count = 0
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Drag the list down and let go") {
            TimelineView(.motion(y)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                let v = held ? pull : y.value(at: t), k = min(1, max(0, v / 52))
                ZStack(alignment: .top) {
                    ZStack {
                        if loading { Image(systemName: "arrow.2.circlepath").rotationEffect(.degrees(reduce ? 0 : t * 420)) }
                        else { Image(systemName: "arrow.down").rotationEffect(.degrees(k * 180)).opacity(k) }
                    }.frame(height: 56).foregroundStyle(.secondary).accessibilityHidden(true)
                    VStack(spacing: 0) {
                        ForEach(rows) { r in
                            VStack(alignment: .leading, spacing: 2) {
                                Text(r.title).font(.subheadline.weight(.semibold))
                                Text(r.fresh ? "just now" : "earlier").font(.footnote).foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14).padding(.vertical, 12)
                            .background(r.fresh ? Color.accentColor.opacity(0.12) : Color.clear)
                            .overlay(alignment: .bottom) { Divider() }
                        }
                        Spacer(minLength: 0)
                    }
                    .background(.background).offset(y: v)
                }
                .frame(width: 260, height: 290, alignment: .top).background(.quaternary.opacity(0.5))
                .clipShape(RoundedRectangle(cornerRadius: 14)).contentShape(Rectangle())
                .gesture(DragGesture()
                    .onChanged { g in
                        guard !loading else { return }
                        let h = Double(max(0, g.translation.height))
                        held = true; pull = 80 * (1 - exp(-h / 80))
                    }
                    .onEnded { g in
                        guard held else { return }
                        held = false
                        if reduce { y.jump(pull > 52 ? 56 : 0) }
                        else { y.release(from: pull, velocity: g.velocity.height, to: pull > 52 ? 56 : 0, at: now()) }
                        if pull > 52 { refresh() }
                    })
                .accessibilityAction(named: "Refresh") { refresh() }
            }
        }
    }

    private func refresh() {
        guard !loading else { return }
        loading = true
        if y.target != 56 { y.set(56, at: now()) }
        Task {
            try? await Task.sleep(for: .seconds(1.2))
            count += 1
            withMotion(.base, reduceMotion: reduce) { rows.insert(Row(title: "New post \(count)", fresh: true), at: 0); loading = false }
            if reduce { y.jump(0) } else { y.set(0, at: now()) }
        }
    }
}
