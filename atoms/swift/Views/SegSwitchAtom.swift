import SwiftUI
import Cieo

public struct SegSwitchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "segswitch", category: "Views", name: "Segmented view switch",
        summary: "The plate stretches from its leading edge and the trailing edge catches up 60ms later. The old heading leaves before the new heading and rows arrive 50ms apart. The shell height springs to fit, and the count rolls.")

    private let views = [
        (name: "Stories", count: 12, head: "Stories from the county line", rows: ["Water board votes 4–3 on rates", "Bus route 12 quietly disappears"]),
        (name: "Saved", count: 3, head: "Saved for the weekend", rows: ["Reading a city budget in ten minutes", "What a consent calendar hides"]),
        (name: "Search", count: 8, head: "Search the archive", rows: ["48,211 clips, fully searchable", "Filter by date, desk, reporter"])]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch segments") {
            VStack(spacing: 8) {
                ZStack(alignment: .topLeading) {
                    EdgesIndicator(frame: CGRect(x: (frames[cur]?.minX ?? 2) + 2, y: 2, width: max(0, (frames[cur]?.width ?? 0) - 4), height: 32), shape: RoundedRectangle(cornerRadius: 8), style: .regularMaterial)
                        .shadow(color: .black.opacity(0.12), radius: 2, y: 1)
                    HStack(spacing: 0) {
                        ForEach(views.indices, id: \.self) { i in
                            Button { withMotion(.base, reduceMotion: reduce) { cur = i } } label: {
                                Text(views[i].name).font(.footnote.weight(cur == i ? .semibold : .regular))
                                    .frame(maxWidth: .infinity, minHeight: 32)
                                    .foregroundStyle(cur == i ? .primary : .secondary)
                            }.buttonStyle(.plain).reportFrame(i, in: "seg").accessibilityAddTraits(cur == i ? .isSelected : [])
                        }
                    }
                }
                .coordinateSpace(name: "seg").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 10))
                VStack(alignment: .leading, spacing: 0) {
                    HStack(alignment: .firstTextBaseline) {
                        SwapText(views[cur].head, drift: 4).font(.headline)
                        Spacer()
                        RollingDigits(views[cur].count).font(.caption).foregroundStyle(.secondary)
                        Text("items").font(.caption).foregroundStyle(.secondary)
                    }
                    ForEach(Array(views[cur].rows.enumerated()), id: \.offset) { k, r in
                        Text(r).font(.footnote).padding(.vertical, 8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .id("\(cur)-\(k)")
                            .motionTransition(.swap(drift: 6))
                            .animation(reduce ? nil : .motion(.base).delay(Motion.exit + Double(k) * 0.05), value: cur)
                        if k == 0 { Divider() }
                    }
                }
                .padding(.horizontal, 14).padding(.vertical, 12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12))
                .animation(reduce ? nil : .motion(.base), value: cur)
            }
            .frame(maxWidth: 340)
        }
    }
}
