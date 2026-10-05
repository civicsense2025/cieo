import SwiftUI
import MotionKit

public struct NavHoverAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "navhover", category: "Chrome", name: "Nav hover",
        summary: "A hover plate follows the pointer with lagging edges and fades out on leave. The underline marks the current page with the same edge rule.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let links = ["Work", "Writing", "About", "Contact"]
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var hovered: Int?
    @State private var plate = 0          // bumps when the plate re-appears, so it starts in place instead of sliding in
    @State private var plateFrame = CGRect.zero
    @State private var current = 0
    public init() {}

    private func underline(_ i: Int) -> CGRect {
        guard let f = frames[i] else { return .zero }
        return CGRect(x: f.minX + 12, y: f.maxY - 2, width: f.width - 24, height: 2)
    }

    public var body: some View {
        AtomStage(hint: "Hover the links, click one to mark it") {
            ZStack(alignment: .topLeading) {
                if frames.count == links.count {
                    EdgesIndicator(frame: plateFrame, shape: RoundedRectangle(cornerRadius: 8), style: .quaternary)
                        .id(plate)
                        .opacity(hovered == nil ? 0 : 1)
                        .animation(reduce ? nil : .motion(hovered == nil ? .snap : .base), value: hovered == nil)
                    EdgesIndicator(frame: underline(current), shape: Capsule(), style: .primary)
                }
                HStack(spacing: 4) {
                    ForEach(links.indices, id: \.self) { i in
                        Button { current = i } label: {
                            Text(links[i]).font(.subheadline.weight(.medium)).padding(.horizontal, 12).padding(.vertical, 7)
                        }
                        .buttonStyle(.plain)
                        .reportFrame(i, in: "nav")
                        .onHover { inside in
                            if inside {
                                if hovered == nil { plate += 1; plateFrame = frames[i] ?? .zero } else { plateFrame = frames[i] ?? .zero }
                                hovered = i
                            } else if hovered == i { hovered = nil }
                        }
                        .accessibilityAddTraits(i == current ? .isSelected : [])
                    }
                }
            }
            .padding(6)
            .coordinateSpace(name: "nav")
            .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
            .shadow(color: .black.opacity(0.12), radius: 6, y: 2)
        }
    }
}
