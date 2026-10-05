import SwiftUI
import Cieo

public struct ReviewSummaryAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "reviewsummary", category: "Agent activity", name: "Review summary",
        summary: "Findings arrive one at a time, 130ms apart: each row fades up and opens its height while the severity counts roll up digit by digit and the Reviewing chip morphs to Completed. Severity chips are full-border chips and double as filters. Switching a filter closes unmatched rows to nothing while the rest slide up, and the Showing count rolls. Opening a finding eases its height open to the saved screenshot, the steps to reproduce, and expected against observed; opening another closes the first.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Finding: Identifiable { let id: Int; let sev: Int; let title: String; let detail: String }
    @State private var shown: [Finding] = []
    @State private var filter: Int?
    @State private var open: Int?
    @State private var done = false
    @State private var run = 0
    public init() {}

    private let all = [Finding(id: 1, sev: 0, title: "Checkout total overlaps the button", detail: "Expected the total above the button. Observed it covering the label at 375 pt."),
                       Finding(id: 2, sev: 1, title: "Email field has no visible label", detail: "Expected a label above the field. Observed only a placeholder."),
                       Finding(id: 3, sev: 1, title: "Focus ring is clipped on Plan cards", detail: "Expected a full outline. Observed the right edge cut off."),
                       Finding(id: 4, sev: 2, title: "Hero image has no alt text", detail: "Expected a short description.")]
    private let sevNames = ["Blocking", "Should fix", "Suggestions"]
    private let sevTone: [AgTone] = [.danger, .warning, .neutral]

    public var body: some View {
        AtomStage(hint: "Tap a severity to filter; tap a finding to open it") {
            AgCard {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        AgentMark(size: 24)
                        Text("Review").font(.headline)
                        AgChip(text: done ? "Completed" : "Reviewing", tone: done ? .success : .info, icon: done ? "checkmark" : nil)
                        Spacer(); Button("Replay") { run += 1 }.buttonStyle(AgPress())
                    }
                    Text("localhost:3000 · /pricing and /signup · 14 screenshots").font(.caption).foregroundStyle(.secondary)
                    HStack(spacing: 6) {
                        Button { setFilter(nil) } label: { Text("All") }.buttonStyle(AgPress(tone: filter == nil ? .info : nil))
                        ForEach(0..<3, id: \.self) { s in
                            Button { setFilter(s) } label: { HStack(spacing: 3) { Text(sevNames[s]); RollingDigits(shown.filter { $0.sev == s }.count) } }
                                .buttonStyle(AgPress(tone: filter == s ? sevTone[s] : nil))
                        }
                    }.font(.caption)
                    HStack(spacing: 2) { Text("Showing"); RollingDigits(shown.filter { filter == nil || $0.sev == filter }.count); Text("of \(shown.count)") }.font(.caption).foregroundStyle(.secondary)
                    ForEach(shown) { f in
                        AgReveal(open: filter == nil || filter == f.sev) {
                            VStack(alignment: .leading, spacing: 4) {
                                Button { withMotion(.base, reduceMotion: reduce) { open = open == f.id ? nil : f.id } } label: {
                                    HStack { Image(systemName: ["octagon", "triangle", "lightbulb"][f.sev]).foregroundStyle(sevTone[f.sev].color); Text(f.title).multilineTextAlignment(.leading); Spacer() }.font(.callout)
                                }.buttonStyle(.plain)
                                AgReveal(open: open == f.id) { Text(f.detail).font(.caption).foregroundStyle(.secondary).padding(.leading, 22) }
                            }
                        }
                        .transition(reduce ? .identity : .opacity.combined(with: .move(edge: .bottom)))
                    }
                }
            }
            .frame(maxWidth: 420)
            .animation(reduce ? nil : .motion(.base), value: shown.count)
        }
        .task(id: run) {
            withMotion(.base, reduceMotion: reduce) { shown = []; done = false; open = nil }
            for f in all {
                try? await Task.sleep(nanoseconds: 130_000_000 + 250_000_000)
                withMotion(.base, reduceMotion: reduce) { shown.append(f) }
            }
            withMotion(.base, reduceMotion: reduce) { done = true }
        }
    }

    private func setFilter(_ s: Int?) { withMotion(.base, reduceMotion: reduce) { filter = s; open = nil } }
}
