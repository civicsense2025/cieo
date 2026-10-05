import SwiftUI
import Cieo

public struct SegmentedControlAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "seg", category: "Admin kit", name: "Segmented control",
        summary: "A measured two-edge indicator, same rules as the edge indicator hook: the active button’s box becomes left and right-inset variables, and data-ind-dir records which way it moved. The leading edge goes now, the trailing edge follows 60ms later, so it stretches then settles. Label colour morphs, arrow keys, Home and End move the selection, and there are two sizes.")

    public init() {}

    public var body: some View {
        AtomStage(hint: "Click, or use arrow keys, Home and End") {
            VStack(spacing: 18) {
                Edges(items: ["Day", "Week", "Month", "Year"], small: false)
                Edges(items: ["List", "Board", "Table"], small: true)
            }
        }
    }
}

private struct Edges: View {
    let items: [String]
    let small: Bool
    @State private var sel = 1
    @State private var frames: [AnyHashable: CGRect] = [:]
    @FocusState private var focused: Bool

    var body: some View {
        ZStack(alignment: .topLeading) {
            if let f = frames[sel] { EdgesIndicator(frame: f, shape: RoundedRectangle(cornerRadius: small ? 6 : 8), style: Color(.sRGB, white: 0.5, opacity: 0.3)) }
            HStack(spacing: 0) { ForEach(items.indices, id: \.self) { i in
                Button(items[i]) { sel = i }.buttonStyle(.plain).font((small ? Font.caption : .footnote).weight(.medium))
                    .padding(.horizontal, small ? 10 : 14).padding(.vertical, small ? 4 : 7).foregroundStyle(sel == i ? Color.primary : .secondary)
                    .motion(.snap, value: sel).reportFrame(i, in: "seg").accessibilityAddTraits(sel == i ? .isSelected : [])
            } }
        }
        .coordinateSpace(name: "seg").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
        .background(RoundedRectangle(cornerRadius: small ? 8 : 10).fill(.quaternary.opacity(0.6))).fixedSize()
        .focusable().focused($focused)
        .onKeyPress(.leftArrow) { sel = max(0, sel - 1); return .handled }
        .onKeyPress(.rightArrow) { sel = min(items.count - 1, sel + 1); return .handled }
        .onKeyPress(.home) { sel = 0; return .handled }
        .onKeyPress(.end) { sel = items.count - 1; return .handled }
    }
}
