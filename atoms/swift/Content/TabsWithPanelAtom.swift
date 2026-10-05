import SwiftUI
import Cieo

public struct TabsWithPanelAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tabs", category: "Content", name: "Tabs with panel",
        summary: "Indicator edges lag each other. The panel text swaps with blur while the panel height morphs to fit.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var sel = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var heights: [Int: CGFloat] = [:]
    private let titles = ["Overview", "Activity", "Billing"]
    private let texts = [
        "Three pages published this week. Traffic is up 18% on the pricing page since the new hero shipped.",
        "Maya edited “Spring launch”. Theo commented on the pricing table. Two new subscribers joined.",
        "Studio plan, $24 per month. Next invoice on October 12. Visa ending 4242.",
    ]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap a tab") {
            VStack(spacing: 12) {
                ZStack(alignment: .topLeading) {
                    if let f = frames[sel] {
                        EdgesIndicator(frame: f.insetBy(dx: 0, dy: 3), shape: Capsule(), style: Color.primary.opacity(0.14))
                    }
                    HStack(spacing: 0) {
                        ForEach(titles.indices, id: \.self) { i in
                            Button { withMotion(.base, reduceMotion: reduce) { sel = i } } label: {
                                Text(titles[i]).font(.callout.weight(.medium))
                                    .frame(maxWidth: .infinity).padding(.vertical, 9)
                                    .contentShape(Rectangle())
                                    .reportFrame(i, in: "tabs")
                            }
                            .buttonStyle(.plain)
                            .accessibilityAddTraits(sel == i ? .isSelected : [])
                        }
                    }
                }
                .coordinateSpace(name: "tabs")
                .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .background(Capsule().fill(Color.primary.opacity(0.06)))

                panel
            }
            .frame(maxWidth: 380)
        }
    }

    private var panel: some View {
        ZStack(alignment: .topLeading) {
            Text(texts[sel]).id(sel)
                .transition(reduce ? .identity : .basicsSwap())
        }
        .font(.callout)
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .frame(height: heights[sel], alignment: .topLeading)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
        .background {
            ZStack {
                ForEach(texts.indices, id: \.self) { i in
                    Text(texts[i]).font(.callout).padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .fixedSize(horizontal: false, vertical: true)
                        .basicsReportHeight(i)
                }
            }
            .hidden()
            .accessibilityHidden(true)
        }
        .onPreferenceChange(BasicsHeightKey.self) { heights = $0 }
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
