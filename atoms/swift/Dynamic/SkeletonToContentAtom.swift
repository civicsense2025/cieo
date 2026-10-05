import SwiftUI
import MotionKit

public struct SkeletonToContentAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "skeleton", category: "Dynamic", name: "Skeleton to content",
        summary: "Placeholders pulse on a 1.2-second clock while loading. When data lands, each row swaps from skeleton to content 50ms after the one above.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let posts = [("Notes from the river path", "Sep 28 · 4 min read"), ("What we learned shipping members", "Sep 21 · 7 min read"), ("A smaller homepage", "Sep 14 · 3 min read")]
    @State private var loaded = [false, false, false]
    @State private var load: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Reload to see the placeholders land") {
            VStack(spacing: 16) {
                TimelineView(.animation(paused: reduce || loaded.allSatisfy { $0 })) { ctx in
                    let pulse = reduce ? 0.7 : 0.55 + 0.25 * cos(2 * .pi * ctx.date.timeIntervalSinceReferenceDate / 1.2)
                    VStack(spacing: 10) {
                        ForEach(posts.indices, id: \.self) { i in
                            ZStack {
                                if loaded[i] { content(i).transition(reduce ? .identity : .motionSwap()) }
                                else { placeholder.opacity(pulse / 0.8).transition(reduce ? .identity : .motionSwap()) }
                            }
                            .frame(height: 64).frame(maxWidth: .infinity)
                            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                            .animation(reduce ? nil : .motion(.base), value: loaded[i])
                            .accessibilityElement(children: .combine)
                            .accessibilityLabel(loaded[i] ? posts[i].0 : "Loading")
                        }
                    }
                }
                .frame(maxWidth: 340)
                Button("Reload", action: reload).buttonStyle(.bordered)
            }
        }
        .onAppear(perform: reload)
        .onDisappear { load?.cancel() }
    }

    private var placeholder: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(width: 36, height: 36)
            GeometryReader { g in
                VStack(alignment: .leading, spacing: 7) {
                    Capsule().fill(.quaternary).frame(width: g.size.width * 0.78, height: 10)
                    Capsule().fill(.quaternary).frame(width: g.size.width * 0.42, height: 8)
                }
                .frame(maxHeight: .infinity)
            }
        }
        .padding(.horizontal, 14)
    }

    private func content(_ i: Int) -> some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8).fill(.primary).frame(width: 36, height: 36)
            VStack(alignment: .leading, spacing: 1) {
                Text(posts[i].0).font(.caption.weight(.semibold)).lineLimit(1)
                Text(posts[i].1).font(.caption).foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 14)
    }

    private func reload() {
        load?.cancel()
        withMotion(.base, reduceMotion: reduce) { loaded = [false, false, false] }
        load = Task {
            try? await Task.sleep(for: .milliseconds(1400))
            for i in posts.indices {
                if Task.isCancelled { return }
                withMotion(.base, reduceMotion: reduce) { loaded[i] = true }
                try? await Task.sleep(for: .milliseconds(50))
            }
        }
    }
}
