import SwiftUI
import MotionKit

public struct HeaderSplitAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-split", category: "Headers", name: "Header: logo centered, links split",
        summary: "The logo stays optically centered while the links split around it. Hover grows a short underline from each link’s center; click widens it to a full underline on the same spring. The alignment option slides each half toward the logo or toward the edges, using whatever room is left after the account zone morphs. Narrow: burger on the left, logo centered, and the menu opens as a dropdown whose height morphs.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var sel: Int?
    @State private var hover: Int?
    @State private var toEdges = false
    public init() {}
    public var body: some View {
        AtomStage(hint: "Hover and click links; change the alignment") {
            VStack(spacing: 10) {
                HStack(spacing: 0) {
                    half(0..<2).frame(maxWidth: .infinity, alignment: toEdges ? .leading : .trailing).padding(.trailing, 14)
                    HdrLogo()
                    half(2..<4).frame(maxWidth: .infinity, alignment: toEdges ? .trailing : .leading).padding(.leading, 14)
                }
                .motion(.base, value: toEdges)
                .padding(10)
                .background(.background, in: RoundedRectangle(cornerRadius: 10)).overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(.quaternary))
                Picker("Alignment", selection: $toEdges) { Text("Toward logo").tag(false); Text("Toward edges").tag(true) }
                    .pickerStyle(.segmented).frame(maxWidth: 260)
                HdrBlocks()
            }
        }
    }

    private func half(_ r: Range<Int>) -> some View {
        HStack(spacing: 14) {
            ForEach(r, id: \.self) { i in
                Button { withMotion(.base, reduceMotion: reduce) { sel = i } } label: { Text(hdrLinks[i]).font(.caption).padding(.vertical, 6) }
                    .buttonStyle(.plain)
                    .overlay(alignment: .bottom) {
                        Rectangle().fill(Color.accentColor).frame(height: 2)
                            .scaleEffect(x: sel == i ? 1 : (hover == i ? 0.3 : 0), anchor: .center)
                    }
                    .onHover { hover = $0 ? i : nil }
                    .motion(.base, value: hover)
                    .accessibilityAddTraits(sel == i ? .isSelected : [])
            }
        }
    }
}
