import SwiftUI
import Cieo

public struct StickyRevealFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "footer-reveal", category: "Footers", name: "Sticky reveal footer",
        summary: "The page is one layer sitting above a footer that is pinned to the bottom of the viewport. Scrolling is the only input: once the page’s bottom edge reaches the viewport bottom, reveal progress is (scroll + view − page) ÷ footer height. The page’s bottom corners round in over the first tenth, and the footer content drifts down 40px and brightens as it is uncovered. Until it shows, the footer is inert.")
    @State private var bottom: CGFloat = .infinity
    private let footerHeight: CGFloat = 130
    public init() {}
    public var body: some View {
        AtomStage(hint: "Scroll to the end of the page") {
            GeometryReader { geo in
                let p = min(1, max(0, (geo.size.height - bottom) / footerHeight))
                let r = 24 * min(1, p * 10)
                ZStack(alignment: .bottom) {
                    VStack(spacing: 8) {
                        Text("Let’s build something calm").font(.title3.weight(.semibold))
                        Button("Get in touch") {}.buttonStyle(.borderedProminent)
                    }
                    .foregroundStyle(.background)
                    .frame(maxWidth: .infinity).frame(height: footerHeight)
                    .background(Color.primary)
                    .offset(y: 40 * (1 - p)).opacity(0.3 + 0.7 * p)
                    .allowsHitTesting(p > 0.95)
                    .accessibilityHidden(p < 0.95)
                    ScrollView {
                        VStack(spacing: 0) {
                            VStack(spacing: 10) { ForEach(0..<6, id: \.self) { _ in RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(height: 80) } }
                                .padding(12).frame(maxWidth: .infinity)
                                .background(Rectangle().fill(.background))
                                .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: r, bottomTrailingRadius: r))
                                .background(GeometryReader { g in Color.clear.preference(key: FootTopKey.self, value: g.frame(in: .named("reveal")).maxY) })
                            Color.clear.frame(height: footerHeight)
                        }
                    }
                    .coordinateSpace(name: "reveal")
                    .onPreferenceChange(FootTopKey.self) { bottom = $0 }
                }
            }
            .frame(minHeight: 240).clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }
}
