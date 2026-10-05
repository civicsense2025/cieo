import SwiftUI
import Cieo

public struct ChapterRailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-chapterrail", category: "Scroll stories", name: "Chapter rail with gentle snap",
        summary: "Use when readers of a long guide or documentation page jump between sections. The rail shows every chapter with a bar that fills as you read it (one bar per chapter, sized to its length); clicking a chapter glides there on a soft spring. Snap is off by default; when on, it waits until you have stopped scrolling for 180ms and only pulls if a chapter start is within 22% of the view, so it settles rather than grabs, and any wheel, touch or key cancels it. Narrow, the rail becomes a segmented bar across the top. Reduced motion jumps.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var frames: [Int: CGRect] = [:]
    @State private var viewH: CGFloat = 220
    @State private var snap = false
    @State private var lastY: CGFloat = 0
    @State private var settleTask: Task<Void, Never>?
    public init() {}
    private let titles = ["Intro", "Setup", "Usage", "Limits"]
    private let lengths: [CGFloat] = [120, 220, 300, 160]

    public var body: some View {
        AtomStage(hint: "Click a chapter to glide; turn Snap on to settle near a start") {
            VStack(spacing: 8) {
                ScrollViewReader { proxy in
                    HStack(alignment: .top, spacing: 10) {
                        rail(proxy)
                        ScrollView(showsIndicators: false) {
                            VStack(spacing: 0) {
                                ForEach(titles.indices, id: \.self) { i in
                                    ZStack(alignment: .topLeading) {
                                        phPhoto(i, CGSize(width: 220, height: lengths[i] - 8)).clipShape(RoundedRectangle(cornerRadius: 8)).opacity(0.5)
                                        Text(titles[i]).font(.headline).padding(10)
                                    }
                                    .frame(height: lengths[i]).id(i)
                                    .background(GeometryReader { g in Color.clear.preference(key: ChapterFrames.self, value: [i: g.frame(in: .named("chapters"))]) })
                                }
                            }
                        }
                        .coordinateSpace(name: "chapters")
                        .background(GeometryReader { g in Color.clear.onAppear { viewH = g.size.height }.onChange(of: g.size.height) { _, h in viewH = h } })
                        .onPreferenceChange(ChapterFrames.self) { f in frames = f; scrolled(f, proxy) }
                    }
                }
                .frame(height: 220)
                Toggle("Gentle snap", isOn: $snap).font(.caption).toggleStyle(.switch).controlSize(.small)
            }
        }
    }

    private func rail(_ proxy: ScrollViewProxy) -> some View {
        VStack(spacing: 4) {
            ForEach(titles.indices, id: \.self) { i in
                let f = frames[i]
                // the bar fills as that chapter is read, and is sized to the chapter's length
                let read = f.map { phClamp(Double((viewH * 0.5 - $0.minY) / $0.height)) } ?? 0
                Button {
                    withMotion(.soft, reduceMotion: reduce) { proxy.scrollTo(i, anchor: .top) }
                } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(titles[i]).font(.caption2)
                        ZStack(alignment: .top) {
                            Capsule().fill(.quaternary)
                            Capsule().fill(Color.accentColor).frame(height: max(3, lengths[i] / 14 * read)).frame(maxHeight: .infinity, alignment: .top)
                        }.frame(width: 4, height: lengths[i] / 14)
                    }
                }.buttonStyle(.plain)
            }
        }
        .frame(width: 56, alignment: .leading)
    }

    /// Waits until scrolling has stopped for 180 ms, and only pulls if a chapter start is within 22% of the view.
    private func scrolled(_ f: [Int: CGRect], _ proxy: ScrollViewProxy) {
        guard snap, !reduce, let y = f[0]?.minY, y != lastY else { return }
        lastY = y
        settleTask?.cancel()
        settleTask = Task {
            try? await Task.sleep(nanoseconds: 180_000_000)
            guard !Task.isCancelled else { return }
            if let near = f.min(by: { abs($0.value.minY) < abs($1.value.minY) }), abs(near.value.minY) < viewH * 0.22, abs(near.value.minY) > 1 {
                withMotion(.soft, reduceMotion: reduce) { proxy.scrollTo(near.key, anchor: .top) }
            }
        }
    }
}

private struct ChapterFrames: PreferenceKey {
    static let defaultValue: [Int: CGRect] = [:]
    static func reduce(value: inout [Int: CGRect], nextValue: () -> [Int: CGRect]) { value.merge(nextValue()) { $1 } }
}
