import SwiftUI
import Cieo

public struct PrefPickAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "prefpick", category: "Guidance", name: "Preference picker",
        summary: "Chips fill-toggle on a calm spring while the picked count rolls. The digest preview swaps live between empty, light and full — full holds as the terminal.")

    private let topics = ["Markets", "Design", "Climate", "Courts", "Culture"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var on = [Bool](repeating: false, count: 5)
    public init() {}

    public var body: some View {
        let n = on.filter { $0 }.count
        let picked = topics.indices.filter { on[$0] }.map { topics[$0] }.joined(separator: " · ")
        let band = n == 0 ? 0 : (n < 3 ? 1 : 2)
        return AtomStage(hint: "Chips fill as you tap · preview swaps live") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Morning digest").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                    Text("Pick topics — the preview follows along.").font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
                    FlowChips(topics: topics, on: $on, reduce: reduce).padding(.top, 10)
                    Text("\(n) of \(topics.count) picked").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                        .padding(.top, 10)
                    ZStack(alignment: .leading) {
                        if band == 0 {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Nothing yet").font(.footnote.weight(.semibold))
                                Text("Tap a topic to preview your digest.").font(.caption).foregroundStyle(.secondary).lineSpacing(3)
                            }.id(0).motionTransition(.swap())
                        } else if band == 1 {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Light digest").font(.footnote.weight(.semibold))
                                Text("\(picked) — one short read.").font(.caption).foregroundStyle(.secondary).lineSpacing(3)
                            }.id(1).motionTransition(.swap())
                        } else {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Full digest ✓").font(.footnote.weight(.semibold)).foregroundStyle(.green)
                                Text("\(picked) — the full five-minute mix.").font(.caption).foregroundStyle(.secondary).lineSpacing(3)
                            }.id(2).motionTransition(.swap())
                        }
                    }
                    .frame(maxWidth: .infinity, minHeight: 96, alignment: .leading)
                    .padding(12).background(.background, in: RoundedRectangle(cornerRadius: 10))
                    .padding(.top, 8)
                }
                .padding(.horizontal, 14).padding(.vertical, 14)
                .frame(maxWidth: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                HStack(spacing: 6) {
                    Text("Preset:").font(.caption).foregroundStyle(.secondary)
                    Button("None") { withMotion(.base, reduceMotion: reduce) { on = [Bool](repeating: false, count: topics.count) } }
                        .buttonStyle(.bordered).controlSize(.mini)
                    Button("All") { withMotion(.base, reduceMotion: reduce) { on = [Bool](repeating: true, count: topics.count) } }
                        .buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}

private struct FlowChips: View {
    let topics: [String]
    @Binding var on: [Bool]
    var reduce: Bool

    private func chip(_ i: Int) -> some View {
        let sel = on[i]
        return Button(topics[i]) { withMotion(.base, reduceMotion: reduce) { on[i].toggle() } }
            .font(.footnote.weight(.medium)).frame(minHeight: 32)
            .padding(.horizontal, 14).padding(.vertical, 6)
            .foregroundStyle(sel ? Color.accentColor : Color.primary)
            .background(sel ? Color.accentColor.opacity(0.18) : Color.primary.opacity(0.08), in: Capsule())
            .scaleEffect(sel ? 1.05 : 1)
    }
    var body: some View {
        FlowLayout(spacing: 8) {
            ForEach(topics.indices, id: \.self) { i in chip(i) }
        }
    }
}

private struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        var w: CGFloat = 0, h: CGFloat = 0, rowW: CGFloat = 0, rowH: CGFloat = 0
        for s in subviews {
            let d = s.sizeThatFits(.unspecified)
            if rowW + d.width > (proposal.width ?? 292) { w = max(w, rowW); h += rowH + spacing; rowW = 0; rowH = 0 }
            rowW += d.width + spacing; rowH = max(rowH, d.height)
        }
        return CGSize(width: max(w, rowW), height: h + rowH)
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, rowH: CGFloat = 0
        for s in subviews {
            let d = s.sizeThatFits(.unspecified)
            if x + d.width > bounds.maxX { x = bounds.minX; y += rowH + spacing; rowH = 0 }
            s.place(at: CGPoint(x: x, y: y), proposal: .unspecified)
            x += d.width + spacing; rowH = max(rowH, d.height)
        }
    }
}
