import SwiftUI
import Cieo

public struct AgentSuggestedEditAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "suggestededit", category: "Agent activity", name: "Suggested edit",
        summary: "The agent frames the element and a suggestion card pops in beside it. Its words reveal in order: removed words get a danger tint and a strike that draws left to right, added words a success tint. Accept and Reject are one row that morphs: the chosen button grows to fill it and turns to a one-line outcome with Undo while the other collapses. On the page, accepting makes removed words close up and added words open out, and a style edit eases the button’s fill to the new value. Undo runs the same morph backwards.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Outcome { case proposed, accepted, rejected }
    @State private var outcome = Outcome.proposed
    @State private var shown = false
    @State private var strike: CGFloat = 0
    @State private var run = 0
    public init() {}

    private var label: String { outcome == .accepted ? "Create free workspace" : "Create workspace" }

    public var body: some View {
        AtomStage(hint: "Accept or reject; Undo reverses the morph") {
            HStack(alignment: .top, spacing: 14) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Demo Shop").font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
                    Text("Start your review").font(.headline)
                    SwapText(label).font(.caption.weight(.semibold)).foregroundStyle(.white)
                        .padding(.horizontal, 10).padding(.vertical, 6)
                        .background(outcome == .accepted ? Color.green : Color.accentColor, in: RoundedRectangle(cornerRadius: 6))
                        .animation(reduce ? nil : .motion(.base), value: outcome)
                        .overlay(shown && outcome == .proposed ? RoundedRectangle(cornerRadius: 8).strokeBorder(Color.accentColor, lineWidth: 2).padding(-4) : nil)
                }
                .frame(width: 150, alignment: .leading).padding(12)
                .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 10))
                if shown { card.motionTransition(.presence) }
            }
            .animation(reduce ? nil : .motion(.base), value: shown)
        }
        .task(id: run) {
            withMotion(.base, reduceMotion: reduce) { shown = false; outcome = .proposed; strike = 0 }
            try? await Task.sleep(nanoseconds: 500_000_000)
            withMotion(.base, reduceMotion: reduce) { shown = true }
            try? await Task.sleep(nanoseconds: 350_000_000)
            withMotion(.soft, reduceMotion: reduce) { strike = 1 }
        }
    }

    private var card: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 4) { AgentMark(size: 16); Text("Assistant suggests").font(.caption.weight(.semibold)) }
            HStack(spacing: 4) {
                Text("Create").font(.caption)
                Text("workspace").font(.caption).padding(.horizontal, 3).background(Color.red.opacity(0.15), in: RoundedRectangle(cornerRadius: 3))
                    .overlay(Rectangle().fill(Color.red).frame(height: 1.5).scaleEffect(x: strike, anchor: .leading))
                Text("free workspace").font(.caption).padding(.horizontal, 3).background(Color.green.opacity(0.18), in: RoundedRectangle(cornerRadius: 3)).opacity(strike)
            }
            HStack(spacing: 6) {
                if outcome == .proposed {
                    Button("Accept") { set(.accepted) }.buttonStyle(AgPress(tone: .success))
                    Button("Reject") { set(.rejected) }.buttonStyle(AgPress())
                } else {
                    Text(outcome == .accepted ? "Accepted" : "Rejected").font(.caption.weight(.semibold)).frame(maxWidth: .infinity, alignment: .leading)
                        .padding(8).background((outcome == .accepted ? Color.green : Color.secondary).opacity(0.15), in: RoundedRectangle(cornerRadius: 8))
                    Button("Undo") { set(.proposed) }.buttonStyle(AgPress())
                }
            }
        }
        .padding(10).frame(width: 190, alignment: .leading)
        .background(.background, in: RoundedRectangle(cornerRadius: 10)).background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.05))).shadow(radius: 4, y: 2)
    }

    private func set(_ o: Outcome) { withMotion(.base, reduceMotion: reduce) { outcome = o } }
}
