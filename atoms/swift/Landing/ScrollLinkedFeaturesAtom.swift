import SwiftUI
import MotionKit

public struct ScrollLinkedFeaturesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "scrollfeatures", category: "Landing", name: "Scroll-linked features",
        summary: "Whichever feature crosses the panel’s middle brightens and the rest dim. The sticky visual retargets from the scroll position: its shape, size, radius and color morph to the new feature on a soft spring while the inner content swaps out then in. The step indicator’s leading edge moves first and the trailing edge follows 60ms later.")

    private struct Feature { let title: String; let body: String; let icon: String; let color: Color; let size: CGSize; let radius: CGFloat }
    private let features = [
        Feature(title: "Compose", body: "Drag blocks into place and edit the words where they sit.", icon: "square.grid.2x2", color: .blue, size: CGSize(width: 130, height: 130), radius: 30),
        Feature(title: "Preview", body: "See the page on every device before anyone else does.", icon: "iphone", color: .orange, size: CGSize(width: 90, height: 150), radius: 22),
        Feature(title: "Publish", body: "One click sends every changed page live at once.", icon: "paperplane", color: .green, size: CGSize(width: 150, height: 90), radius: 45),
        Feature(title: "Measure", body: "Know which pages bring readers back.", icon: "chart.line.uptrend.xyaxis", color: .pink, size: CGSize(width: 120, height: 120), radius: 60)]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var active: Int? = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}

    private var cur: Int { active ?? 0 }

    public var body: some View {
        AtomStage(hint: "Scroll the feature list") {
            VStack(spacing: 10) {
                ZStack(alignment: .topLeading) {
                    if let f = frames[cur] { EdgesIndicator(frame: f.insetBy(dx: -4, dy: -2), shape: Capsule(), style: Color.accentColor.opacity(0.2)) }
                    HStack(spacing: 0) { ForEach(features.indices, id: \.self) { i in Text(features[i].title).font(.caption.weight(.medium)).padding(.horizontal, 10).padding(.vertical, 4).reportFrame(i, in: "steps") } }
                }.coordinateSpace(name: "steps").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                HStack(spacing: 0) {
                    ScrollView {
                        VStack(spacing: 0) { ForEach(features.indices, id: \.self) { i in
                            VStack(alignment: .leading, spacing: 4) { Text(features[i].title).font(.headline); Text(features[i].body).font(.footnote).foregroundStyle(.secondary) }
                                .frame(maxWidth: .infinity, minHeight: 200, alignment: .leading).padding(.horizontal, 16)
                                .opacity(cur == i ? 1 : 0.35).animation(reduce ? nil : .motion(.base), value: cur).id(i)
                        } }.scrollTargetLayout()
                    }
                    .scrollPosition(id: $active).scrollTargetBehavior(.viewAligned).frame(width: 190)
                    ZStack {
                        RoundedRectangle(cornerRadius: features[cur].radius).fill(features[cur].color.opacity(0.25)).frame(width: features[cur].size.width, height: features[cur].size.height)
                        ZStack { Image(systemName: features[cur].icon).font(.largeTitle).foregroundStyle(features[cur].color).id(cur).motionTransition(.swap()) }
                    }.frame(maxWidth: .infinity, maxHeight: .infinity).animation(reduce ? nil : .motion(.soft), value: cur).accessibilityHidden(true)
                }.frame(width: 360, height: 200).background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
    }
}
