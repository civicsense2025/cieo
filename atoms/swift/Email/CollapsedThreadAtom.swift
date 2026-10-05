import SwiftUI
import MotionKit

public struct CollapsedThreadAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "threadstack", category: "Email", name: "Collapsed thread",
        summary: "Earlier messages wait as a short stack of card edges. Opening the thread unfolds each message to full height, 50ms apart from the top, and the stack edges fold away.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let messages = [("Maya", "Draft attached for the spring launch."), ("Theo", "Pricing table needs the new tiers."),
                            ("Maya", "Updated. Can you check the yearly toggle?"), ("Theo", "Looks great. Ship it Thursday.")]
    private let cardH = 52.0
    @State private var heights = [Track(0), Track(0), Track(0)]
    @State private var edges = Track(1, preset: .snap)
    @State private var open = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open the earlier messages") {
            TimelineView(.animation) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let s = max(0, min(1, edges.value(at: t)))
                VStack(spacing: 6) {
                    Button { toggle() } label: {
                        ZStack(alignment: .top) {
                            RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(height: 10).padding(.horizontal, 12)
                            RoundedRectangle(cornerRadius: 8).fill(.quaternary.opacity(0.6)).frame(height: 10).padding(.horizontal, 6).offset(y: 6)
                            Text("3 earlier messages").font(.caption).foregroundStyle(.secondary).frame(maxWidth: .infinity)
                                .padding(2).background(.background, in: RoundedRectangle(cornerRadius: 10)).shadow(color: .black.opacity(0.1), radius: 2, y: 1).offset(y: 12)
                        }
                        .frame(height: 28)
                    }
                    .buttonStyle(.plain).frame(height: 28 * s).opacity(s).allowsHitTesting(s > 0.5).clipped()
                    .accessibilityLabel("3 earlier messages").accessibilityValue(open ? "expanded" : "collapsed")
                    ForEach(messages.indices, id: \.self) { i in
                        let h = i == 3 ? 1.0 : max(0, min(1, heights[i].value(at: t)))
                        card(i).opacity(h).frame(height: cardH * h, alignment: .top).clipped().padding(.bottom, -6 * (1 - h))
                    }
                    Button("Collapse earlier") { toggle() }.buttonStyle(.bordered).opacity(1 - s).allowsHitTesting(s < 0.5)
                }
                .frame(maxWidth: 340)
            }
        }
    }

    private func card(_ i: Int) -> some View {
        VStack(alignment: .leading, spacing: 2) { Text(messages[i].0).font(.caption.weight(.semibold)); Text(messages[i].1).font(.caption) }
            .padding(.horizontal, 12).padding(.vertical, 10).frame(maxWidth: .infinity, minHeight: cardH, alignment: .topLeading)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
    }

    private func toggle() {
        open.toggle()
        for i in 0..<3 { DataMotion.retarget(&heights[i], to: open ? 1 : 0, delay: open ? Double(i) * 0.05 : Double(2 - i) * 0.03, reduce: reduce) }
        DataMotion.retarget(&edges, to: open ? 0 : 1, reduce: reduce)
    }
}
