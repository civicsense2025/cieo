import SwiftUI
import Cieo

public struct StoryProgressAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stories", category: "Social", name: "Story progress",
        summary: "The current segment fills from the clock over 3 seconds; earlier ones stay full and later ones empty. Tapping a side skips with a blur swap, and holding pauses the clock for this story only. The last story settles into an end card; replay swaps back to the start.")

    private let stories = [("6:12", "Fog on the river"), ("6:40", "First heron"), ("7:05", "The mill bridge"), ("7:30", "Bakery stop")]
    private let tints: [Color] = [.green, .orange, .blue, .pink]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur = 0
    @State private var t0 = Date.timeIntervalSinceReferenceDate
    @State private var pausedAt: Double?
    @State private var done = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap left or right · hold to pause") {
            VStack(spacing: 8) {
                TimelineView(.animation(paused: reduce)) { tl in
                    let now = tl.date.timeIntervalSinceReferenceDate
                    let el = (pausedAt ?? now) - t0
                    let _ = advanceIfNeeded(el)
                    ZStack(alignment: .top) {
                        ZStack {
                            if done {
                                endPane.id("end").transition(reduce ? .identity : .modifier(active: Blur(r: 8, o: 0), identity: Blur(r: 0, o: 1)))
                            } else {
                                pane(cur).id(cur).transition(reduce ? .identity : .modifier(active: Blur(r: 8, o: 0), identity: Blur(r: 0, o: 1)))
                            }
                        }
                        HStack(spacing: 4) {
                            ForEach(stories.indices, id: \.self) { i in
                                Capsule().fill(.white.opacity(0.3)).frame(height: 3)
                                    .overlay(alignment: .leading) {
                                        GeometryReader { g in
                                            Capsule().fill(.white).frame(width: g.size.width * (done || i < cur ? 1 : i > cur ? 0 : min(1, max(0, el / 3))))
                                        }
                                    }
                            }
                        }.padding(8)
                    }
                    .frame(width: 200, height: 300).background(Color.black)
                    .clipShape(RoundedRectangle(cornerRadius: 14)).contentShape(Rectangle())
                    .gesture(DragGesture(minimumDistance: 0)
                        .onChanged { _ in if pausedAt == nil { pausedAt = Date.timeIntervalSinceReferenceDate; downAt = pausedAt! } }
                        .onEnded { v in release(at: v.location.x) })
                    .accessibilityElement().accessibilityLabel(done ? "End of stories" : "Story \(cur + 1) of \(stories.count): \(stories[cur].1)")
                }
                HStack(spacing: 8) {
                    Button("Replay", action: replay).buttonStyle(.bordered).controlSize(.small)
                    Text("End card on finish").font(.caption).foregroundStyle(.secondary)
                }
            }
        }
    }

    @State private var downAt = 0.0

    private func pane(_ i: Int) -> some View {
        ZStack(alignment: .bottomLeading) {
            tints[i].opacity(0.45)
            VStack(alignment: .leading) {
                Text(stories[i].0).font(.caption).opacity(0.7)
                Text(stories[i].1).font(.headline)
            }.foregroundStyle(.white).padding(16)
        }
    }

    private var endPane: some View {
        ZStack {
            Color(white: 0.12)
            VStack(spacing: 6) {
                Text("All caught up").font(.caption).opacity(0.7)
                Text("End of stories").font(.headline)
                Text("Tap to replay").font(.caption2).opacity(0.7)
            }.foregroundStyle(.white)
        }
    }

    private func advanceIfNeeded(_ el: Double) {
        guard pausedAt == nil, !done, el >= 3 else { return }
        let from = cur
        DispatchQueue.main.async { if cur == from { go(from + 1) } }
    }

    private func go(_ i: Int) {
        if i >= stories.count {
            withMotion(.base, reduceMotion: reduce) { done = true }
            t0 = Date.timeIntervalSinceReferenceDate
            return
        }
        withMotion(.base, reduceMotion: reduce) { cur = (i + stories.count) % stories.count; done = false }
        t0 = Date.timeIntervalSinceReferenceDate
    }

    private func replay() { go(0) }

    private func release(at x: CGFloat) {
        let now = Date.timeIntervalSinceReferenceDate, held = now - downAt
        pausedAt = nil
        if held < 0.25 {
            if done { go(x > 200.0 / 3 ? 0 : stories.count - 1) }
            else { go(cur + (x > 200.0 / 3 ? 1 : -1)) }
        } else if done { t0 = now } else { t0 += held }
    }
}

private struct Blur: ViewModifier {
    let r: CGFloat, o: Double
    func body(content: Content) -> some View { content.blur(radius: r).opacity(o) }
}
