import SwiftUI
import Cieo

public struct SiteCoverageAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sitecoverage", category: "Agent activity", name: "Site coverage",
        summary: "The agent crawls one page at a time. The current row lights and spins; on arrival its links are discovered, so new rows open under it and join the queue 120ms apart. When the visit ends the dot morphs to a check, findings roll into the counters and the bar fills. Blocked pages (sign-in, downloads) end in a skipped state with the reason. Click a queued page to move it to the front.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum St { case queued, visiting, done, skipped }
    private struct Page: Identifiable { let id: String; var st: St = .queued; var rank = 0; var findings = 0 }
    @State private var pages = [Page(id: "/")]
    @State private var token = 0
    @State private var rank = 0
    public init() {}

    private let links: [String: [String]] = ["/": ["/pricing", "/docs", "/login"], "/pricing": ["/pricing/team"], "/docs": ["/docs/api", "/download"]]
    private let blocked: [String: String] = ["/login": "Sign-in is blocked", "/download": "File download skipped"]
    private var visited: Int { pages.filter { $0.st == .done }.count }
    private var skipped: Int { pages.filter { $0.st == .skipped }.count }
    private var finds: Int { pages.reduce(0) { $0 + $1.findings } }
    private var resolved: Int { visited + skipped }

    public var body: some View {
        AtomStage(hint: "Tap a queued page to move it to the front") {
            AgCard {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Sitemap").font(.headline); Spacer()
                        Button("Replay") { token += 1 }.buttonStyle(AgPress())
                    }
                    HStack(spacing: 14) {
                        stat("Visited", visited); stat("Findings", finds); stat("Skipped", skipped)
                        Spacer()
                        Text("\(Int(Double(resolved) / Double(max(1, pages.count)) * 100))% explored").font(.caption).monospacedDigit().foregroundStyle(.secondary)
                    }
                    GeometryReader { g in
                        ZStack(alignment: .leading) {
                            Capsule().fill(.quaternary)
                            Capsule().fill(Color.accentColor).frame(width: g.size.width * Double(resolved) / Double(max(1, pages.count)))
                        }
                    }.frame(height: 4).animation(reduce ? nil : .motion(.soft), value: resolved)
                    ForEach(pages) { p in
                        Button { prioritise(p.id) } label: {
                            HStack(spacing: 8) {
                                Group {
                                    switch p.st {
                                    case .visiting: AgSpinner(size: 12)
                                    case .done: Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                                    case .skipped: Image(systemName: "minus.circle").foregroundStyle(.orange)
                                    case .queued: Image(systemName: "circle").foregroundStyle(.secondary)
                                    }
                                }.frame(width: 16)
                                Text(p.id).font(.callout.monospaced())
                                Spacer()
                                if p.st == .skipped { Text(blocked[p.id] ?? "Skipped").font(.caption).foregroundStyle(.orange) }
                                else if p.st == .done { Text("\(p.findings) findings").font(.caption).foregroundStyle(.secondary) }
                                else if p.st == .queued { Text("queued").font(.caption).foregroundStyle(.secondary) }
                            }
                            .padding(.vertical, 3).padding(.horizontal, 6)
                            .background(p.st == .visiting ? Color.accentColor.opacity(0.14) : .clear, in: RoundedRectangle(cornerRadius: 6))
                        }
                        .buttonStyle(.plain).disabled(p.st != .queued)
                        .transition(reduce ? .identity : .opacity.combined(with: .move(edge: .top)))
                    }
                }
            }
            .frame(maxWidth: 420)
            .animation(reduce ? nil : .motion(.base), value: pages.map(\.id))
            .animation(reduce ? nil : .motion(.snap), value: pages.map { $0.st == .done })
        }
        .task(id: token) { await crawl() }
    }

    private func stat(_ l: String, _ n: Int) -> some View {
        VStack(alignment: .leading, spacing: 0) { Text(l).font(.caption2).foregroundStyle(.secondary); RollingDigits(n).font(.callout.weight(.semibold)) }
    }

    private func prioritise(_ id: String) { rank -= 1; if let i = pages.firstIndex(where: { $0.id == id }) { pages[i].rank = rank } }

    private func crawl() async {
        rank = 0
        withMotion(.base, reduceMotion: reduce) { pages = [Page(id: "/")] }
        while !Task.isCancelled {
            guard let next = pages.filter({ $0.st == .queued }).min(by: { $0.rank < $1.rank }) else { return }
            let id = next.id
            if blocked[id] != nil { setSt(id, .skipped); try? await Task.sleep(nanoseconds: 300_000_000); continue }
            setSt(id, .visiting)
            try? await Task.sleep(nanoseconds: 900_000_000)
            for child in links[id] ?? [] where !pages.contains(where: { $0.id == child }) {
                withMotion(.base, reduceMotion: reduce) { pages.append(Page(id: child)) }
                try? await Task.sleep(nanoseconds: 120_000_000)
            }
            withMotion(.base, reduceMotion: reduce) { if let i = pages.firstIndex(where: { $0.id == id }) { pages[i].st = .done; pages[i].findings = id.count % 4 } }
        }
    }
    private func setSt(_ id: String, _ s: St) { withMotion(.snap, reduceMotion: reduce) { if let i = pages.firstIndex(where: { $0.id == id }) { pages[i].st = s } } }
}
