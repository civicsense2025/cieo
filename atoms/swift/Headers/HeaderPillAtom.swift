import SwiftUI
import Cieo

public struct HeaderPillAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-pill", category: "Headers", name: "Header: floating pill with plate",
        summary: "One plate slides between links with lagging edges: it follows the pointer or keyboard focus, then returns to the current page when you leave. Scrolling lifts the pill’s shadow, tucks it 6px closer to the top, and folds the wordmark away so the pill narrows. The Pill option morphs the width between fit-to-content and full. Narrow: the same pill is a bar; the burger morphs it taller in place, its corners easing from pill to card.")
    @State private var offset: CGFloat = 0
    @State private var current = 0
    @State private var hover: Int?
    @State private var full = false
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}
    public var body: some View {
        let scrolled = offset > 8
        AtomStage(hint: "Hover links, scroll, toggle width") {
            VStack(spacing: 6) {
                Toggle("Full width", isOn: $full.animation(.motion(.soft))).font(.caption).toggleStyle(.switch).fixedSize()
                ZStack(alignment: .top) {
                    HdrScroll(offset: $offset, top: 58)
                    HStack(spacing: 2) {
                        if !scrolled { Text("Studio").font(.callout.weight(.bold)).padding(.horizontal, 8).transition(.opacity) }
                        ForEach(hdrLinks.indices, id: \.self) { i in
                            Text(hdrLinks[i]).font(.caption).padding(.horizontal, 10).padding(.vertical, 7).contentShape(Capsule())
                                .reportFrame(i, in: "pill").onHover { hover = $0 ? i : nil }
                                .onTapGesture { current = i }.accessibilityAddTraits(.isButton)
                        }
                    }
                    .background { MegaPlate(frame: frames[AnyHashable(hover ?? current)], radius: 14) }
                    .coordinateSpace(name: "pill")
                    .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                    .padding(5)
                    .frame(maxWidth: full ? .infinity : nil)
                    .background(.background, in: Capsule())
                    .overlay(Capsule().strokeBorder(.quaternary))
                    .shadow(color: .black.opacity(scrolled ? 0.18 : 0.04), radius: scrolled ? 10 : 3, y: 3)
                    .padding(.horizontal, 8).padding(.top, scrolled ? 4 : 10)
                    .motion(.soft, value: scrolled)
                }
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
    }
}
