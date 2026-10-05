import SwiftUI
import Cieo

public struct PageTransitionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pagetransition", category: "Views", name: "Page transitions",
        summary: "The header never moves. The underline slides to the new link with lagging edges. The outgoing page exits on the Swap rule, 100ms ease-in with a small blur, and only then do the incoming heading, paragraph and image enter 50ms apart. Cross-fade only fades. Slide also travels 28px, toward the side the link sits on in the nav.")

    private let pages = [("Stories", "Stories from the county line", "Eleven reporters cover one county. This week: the water board vote and a school bus route that quietly disappeared."),
                         ("Method", "How we check a claim", "Every number links to its source and every quote is recorded. Corrections go above the story."),
                         ("About", "Eleven people, one county", "We are paid for by 4,200 members and no ads. The newsroom sits above the hardware store on Main Street.")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var page = 0
    @State private var slide = false
    @State private var dir: CGFloat = 1
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch pages and transition style") {
            VStack(spacing: 10) {
                Picker("Style", selection: $slide) { Text("Cross-fade").tag(false); Text("Slide").tag(true) }.pickerStyle(.segmented).frame(width: 200).labelsHidden()
                VStack(spacing: 0) {
                    ZStack(alignment: .topLeading) {
                        EdgesIndicator(frame: CGRect(x: (frames[page]?.minX ?? 0) + 10, y: (frames[page]?.maxY ?? 32) - 2, width: max(0, (frames[page]?.width ?? 0) - 20), height: 2), shape: Rectangle(), style: Color.primary)
                        HStack(spacing: 0) {
                            ForEach(pages.indices, id: \.self) { i in
                                Button(pages[i].0) { go(i) }.buttonStyle(.plain).font(.footnote.weight(.medium)).padding(.horizontal, 10).padding(.vertical, 9)
                                    .foregroundStyle(page == i ? Color.primary : .secondary).reportFrame(i, in: "pt").accessibilityAddTraits(page == i ? .isSelected : [])
                            }
                        }
                    }
                    .coordinateSpace(name: "pt").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 10).frame(height: 36)
                    Divider()
                    VStack(alignment: .leading, spacing: 8) {
                        part(0) { Text(pages[page].1).font(.title3.weight(.semibold)).frame(maxWidth: .infinity, alignment: .leading) }
                        part(1) { Text(pages[page].2).font(.footnote).foregroundStyle(.secondary).frame(maxWidth: .infinity, alignment: .leading) }
                        part(2) { AtomPhoto(seed: page + 4, goldenHour: Double(page) / 2).clipShape(RoundedRectangle(cornerRadius: 10)).frame(height: 80) }
                    }.padding(14)
                    Spacer(minLength: 0)
                }
                .frame(width: 360, height: 270)
                .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
    }

    /// One slot per part, so the layout never doubles while the old part leaves and the new one arrives.
    private func part<V: View>(_ k: Int, @ViewBuilder _ content: () -> V) -> some View {
        let x = slide ? 28 * dir : 0
        return ZStack { content().id(page).transition(reduce ? .identity : .asymmetric(
            insertion: .modifier(active: Part(o: 0, blur: 0, x: x, y: slide ? 0 : 6), identity: Part(o: 1, blur: 0, x: 0, y: 0)).animation(.motion(.base).delay(Motion.exit + Double(k) * 0.05)),
            removal: .modifier(active: Part(o: 0, blur: 3, x: -x, y: 0), identity: Part(o: 1, blur: 0, x: 0, y: 0)).animation(.motionExit))) }
        .animation(reduce ? nil : .motion(.base), value: page)
    }

    private func go(_ i: Int) {
        guard i != page else { return }
        dir = i > page ? 1 : -1
        page = i
    }
}

private struct Part: ViewModifier {
    let o: Double, blur: CGFloat, x: CGFloat, y: CGFloat
    func body(content: Content) -> some View { content.opacity(o).blur(radius: blur).offset(x: x, y: y) }
}
