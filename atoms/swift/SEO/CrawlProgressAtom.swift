import SwiftUI
import Cieo

public struct CrawlProgressAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "crawlprog", category: "SEO", name: "Crawl progress",
        summary: "The counter rides the lazy spring toward 90%, creeps there, then snaps to 100% with a success tint. Each log line swaps in as its batch lands.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var crawled = 0
    @State private var landed = 0
    @State private var verbose = true
    @State private var task: Task<Void, Never>?
    public init() {}

    private let total = 1248
    private let lines = ["/ — 200 in 320 ms", "/pricing — 200 in 610 ms", "/journal/* — 14 pages, 1 slow", "/changelog — orphan, flagged"]
    private var done: Bool { crawled >= total }

    public var body: some View {
        AtomStage(hint: "Start a new crawl") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Crawling 1,248 pages").font(.headline)
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    RollingDigits(String(crawled)).font(.system(size: 30, weight: .semibold)).monospacedDigit()
                    Text("pages crawled").font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    SwapText(done ? "Complete ✓" : landed == 0 ? "Idle" : "Batch \(landed) of 4")
                        .font(.footnote.weight(.medium)).foregroundStyle(done ? Color.green : Color.secondary)
                }
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        Capsule().fill(.quaternary)
                        Capsule().fill(done ? Color.green : Color.accentColor)
                            .frame(width: g.size.width * Double(crawled) / Double(total))
                    }
                }
                .frame(height: 8).motion(.lazy, value: crawled)
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(Array(lines.enumerated()), id: \.offset) { i, line in
                        if i < landed && (verbose || i < 2) {
                            Text("✓ \(line)").font(.footnote).foregroundStyle(.secondary)
                                .motionTransition(.swap())
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading).frame(minHeight: 88)
                .padding(12).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                Toggle("Verbose log", isOn: $verbose).font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.checkbox)
                Button("Start crawl", action: run).buttonStyle(.bordered).controlSize(.small)
            }
            .frame(width: 340)
        }
        .onAppear(perform: run)
    }

    private func run() {
        task?.cancel()
        withMotion(.lazy, reduceMotion: reduce) { crawled = 0; landed = 0 }
        if reduce { crawled = total; landed = 4; return }
        let steps = [(312, 1), (804, 2), (1123, 3)]
        task = Task {
            for (pages, batch) in steps {
                try? await Task.sleep(for: .milliseconds(450))
                if Task.isCancelled { return }
                withMotion(.lazy, reduceMotion: reduce) { crawled = pages; landed = batch }
            }
            try? await Task.sleep(for: .milliseconds(650))
            if Task.isCancelled { return }
            withMotion(.snap, reduceMotion: reduce) { crawled = total; landed = 4 }
        }
    }
}
