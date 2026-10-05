import SwiftUI
import MotionKit

public struct FilterableMasonryAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-masonry-filter", category: "Galleries", name: "Filterable masonry that reflows",
        summary: "Choosing a subject runs three beats in order. Photos that no longer match shrink to their own centre in 100ms, staggered 20ms apart. Then the photos that stay travel to their new slots on a soft spring, one every 30ms in reading order so the reflow sweeps rather than jumps. Last, photos that now match grow in from their own centre, 200ms in. The pill behind the active filter is a two-edge indicator (leading edge first, trailing edge 60ms behind) and the count rolls its digits. Use when a gallery filters in place and people should keep track of what moved where.")
    @State private var filter = 0
    @State private var old: [Int: CGRect] = [:]
    @State private var new: [Int: CGRect] = [:]
    @State private var start = Date()
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var width: CGFloat = 300
    public init() {}
    private let kinds = ["All", "Sky", "Ridge", "Water"]
    private let tagged = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1]       // photo -> kind (1...3)

    private func layout(_ f: Int, _ w: CGFloat) -> [Int: CGRect] {
        let ids = (0..<tagged.count).filter { f == 0 || tagged[$0] == f }
        let cw = (w - 16) / 3
        return Dictionary(uniqueKeysWithValues: ids.enumerated().map { k, id in
            (id, CGRect(x: CGFloat(k % 3) * (cw + 8), y: CGFloat(k / 3) * (cw * 0.8 + 8), width: cw, height: cw * 0.8))
        })
    }

    public var body: some View {
        AtomStage(hint: "Pick a subject: leave, travel, then arrive") {
            VStack(spacing: 12) {
                ZStack(alignment: .topLeading) {
                    EdgesIndicator(frame: frames[filter] ?? .zero, shape: Capsule(), style: Color.accentColor.opacity(0.18))
                    HStack(spacing: 4) {
                        ForEach(kinds.indices, id: \.self) { i in
                            Button(kinds[i]) { pick(i) }.buttonStyle(.plain).padding(.horizontal, 12).padding(.vertical, 6)
                                .reportFrame(i, in: "chips").accessibilityAddTraits(i == filter ? .isSelected : [])
                        }
                        Spacer()
                        RollingDigits(new.count).font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                    }
                }
                .coordinateSpace(name: "chips").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                GeometryReader { g in
                    PhMorphGrid(old: old, new: new, start: start)
                        .onAppear { width = g.size.width; if new.isEmpty { new = layout(0, g.size.width); old = new } }
                }.frame(height: 200)
            }
        }
    }

    private func pick(_ i: Int) {
        guard i != filter else { return }
        filter = i; old = new; new = layout(i, width); start = Date()
    }
}
