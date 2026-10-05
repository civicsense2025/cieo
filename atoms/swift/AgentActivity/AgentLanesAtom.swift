import SwiftUI
import Cieo

public struct AgentLanesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentlanes", category: "Agent activity", name: "Multi-agent lanes",
        summary: "Bars grow on the run clock, so a running task is a bar whose right edge is the playhead. When a task finishes, a handoff arrow draws from its end to the start of the next agent’s task, and that bar starts growing as the arrow lands. When two agents touch /signup at once, a warning band opens across both lanes with a marker; Queue Reviewer after slides the Reviewer’s bars later on a spring until the band closes. Clicking a lane grows it and swaps the detail panel to that agent.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Bar { let lane: Int; var start: Double; let len: Double; let label: String }
    @State private var bars = [Bar(lane: 0, start: 0, len: 4, label: "Crawl"), Bar(lane: 1, start: 4, len: 4, label: "Review /pricing"), Bar(lane: 1, start: 8.5, len: 3, label: "Review /signup"), Bar(lane: 2, start: 5, len: 5, label: "Fix /signup")]
    @State private var selected = 1
    @State private var clockStart = Date()
    @State private var paused = false
    @State private var pausedAt = 0.0
    @State private var queued = false
    public init() {}

    private let lanes = ["Crawler", "Reviewer", "Fixer"]
    private let total = 14.0

    private func now() -> Double { paused ? pausedAt : min(total, Date().timeIntervalSince(clockStart)) }

    public var body: some View {
        AtomStage(hint: "Tap a lane; Queue Reviewer after clears the conflict") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Run lanes · 3 agents").font(.callout.weight(.semibold)); Spacer()
                    Button(paused ? "Resume" : "Pause") { toggle() }.buttonStyle(AgPress())
                    Button("Replay") { clockStart = Date(); paused = false; queued = false; withMotion(.base, reduceMotion: reduce) { bars[2].start = 8.5 } }.buttonStyle(AgPress())
                }
                TimelineView(.animation(paused: paused)) { _ in
                    let t = now()
                    GeometryReader { g in
                        let w = g.size.width - 70, px = { (s: Double) in 70 + w * s / total }
                        ZStack(alignment: .topLeading) {
                            if conflict && !queued { Rectangle().fill(Color.orange.opacity(0.18)).frame(width: w * 3 / total, height: 96).offset(x: px(8.5), y: 0).transition(.opacity) }
                            ForEach(0..<3, id: \.self) { l in
                                HStack(spacing: 0) { Text(lanes[l]).font(.caption.weight(selected == l ? .bold : .regular)).frame(width: 66, alignment: .leading); Spacer() }.offset(y: CGFloat(l) * 32 + 6)
                            }
                            ForEach(bars.indices, id: \.self) { i in
                                let b = bars[i], end = min(t, b.start + b.len), len = max(0, end - b.start)
                                RoundedRectangle(cornerRadius: 5).fill(Color.accentColor.opacity(b.lane == selected ? 0.8 : 0.45)).frame(width: w * len / total, height: 22)
                                    .overlay(Text(b.label).font(.system(size: 9)).foregroundStyle(.white).lineLimit(1).padding(.horizontal, 3), alignment: .leading)
                                    .offset(x: px(b.start), y: CGFloat(b.lane) * 32).animation(reduce ? nil : .motion(.base), value: b.start)
                            }
                            Rectangle().fill(Color.primary).frame(width: 1.5, height: 96).offset(x: px(t))
                            if t > 4 { Image(systemName: "arrow.turn.down.right").font(.caption2).offset(x: px(4) - 6, y: 18).foregroundStyle(.secondary) }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture { loc in withMotion(.base, reduceMotion: reduce) { selected = max(0, min(2, Int(loc.y / 32))) } }
                    }.frame(height: 96)
                }
                if conflict && !queued {
                    HStack { Label("Reviewer and Fixer both touch /signup", systemImage: "exclamationmark.triangle").font(.caption).foregroundStyle(.orange); Spacer()
                        Button("Queue Reviewer after") { withMotion(.base, reduceMotion: reduce) { queued = true; bars[2].start = 11.5 } }.buttonStyle(AgPress(tone: .warning)) }
                }
                AgCard { VStack(alignment: .leading, spacing: 2) { SwapText(lanes[selected]).font(.callout.weight(.semibold)); SwapText(["Visited 6 pages", "Found 4 issues", "Edited 2 components"][selected]).font(.caption).foregroundStyle(.secondary) }.frame(maxWidth: .infinity, alignment: .leading) }
            }
            .frame(maxWidth: 420)
            .animation(reduce ? nil : .motion(.base), value: queued)
        }
    }

    private var conflict: Bool { bars[2].start < 11 }
    private func toggle() { if paused { clockStart = Date().addingTimeInterval(-pausedAt); paused = false } else { pausedAt = now(); paused = true } }
}
