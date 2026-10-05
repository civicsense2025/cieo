import SwiftUI
import MotionKit

public struct HeaderMinimalAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-minimal", category: "Headers", name: "Header: minimal with fullscreen menu",
        summary: "The page header is only a wordmark, the account zone and a Menu button, at every width. Opening swaps the label Menu to Close, folds the two lines into a cross, and expands a dark layer as a circle growing out from the button until it covers the page. The header recolors to light ink at the same moment, then each link enters 60ms after the last, and hovering one dims the others. Escape closes it and focus returns to the button.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var hover: Int?
    public init() {}
    public var body: some View {
        AtomStage(hint: "Open the menu, hover a link") {
            GeometryReader { geo in
                let w = geo.size.width, h = geo.size.height, d = 2 * hypot(w, h)
                ZStack(alignment: .top) {
                    VStack { Spacer().frame(height: 52); HdrBlocks().padding(12); Spacer() }
                    Circle().fill(Color.primary).frame(width: d, height: d)
                        .position(x: w - 36, y: 26)
                        .scaleEffect(open ? 1 : 0.001, anchor: UnitPoint(x: (w - 36) / w, y: 26 / h))
                        .allowsHitTesting(false).accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: 10) {
                        Spacer().frame(height: 60)
                        if open {
                            ForEach(Array(["Work", "Studio", "Journal", "Contact"].enumerated()), id: \.offset) { i, t in
                                Text(t).font(.title2.weight(.semibold)).foregroundStyle(.background)
                                    .opacity(hover == nil || hover == i ? 1 : 0.4).motion(.snap, value: hover)
                                    .onHover { hover = $0 ? i : nil }
                                    .megaRise(i, of: 4, lead: 0.1 + Double(i) * 0.06 - Motion.stagger(i, of: 4, gap: 0.03))
                            }
                        }
                        Spacer()
                    }
                    .padding(.horizontal, 16).frame(maxWidth: .infinity, alignment: .leading)
                    HStack {
                        Text("Studio").font(.callout.weight(.bold))
                        Spacer()
                        Image(systemName: "person.crop.circle")
                        Button { withMotion(.soft, reduceMotion: reduce) { open.toggle() } } label: {
                            HStack(spacing: 6) {
                                SwapText(open ? "Close" : "Menu").font(.callout)
                                ZStack {
                                    Rectangle().frame(width: 16, height: 1.5).offset(y: open ? 0 : -3).rotationEffect(.degrees(open ? 45 : 0))
                                    Rectangle().frame(width: 16, height: 1.5).offset(y: open ? 0 : 3).rotationEffect(.degrees(open ? -45 : 0))
                                }
                            }
                        }
                        .buttonStyle(.plain).keyboardShortcut(.escape, modifiers: []).accessibilityValue(open ? "open" : "closed")
                    }
                    .foregroundStyle(open ? AnyShapeStyle(.background) : AnyShapeStyle(.primary))
                    .animation(reduce ? nil : .motion(.base), value: open)
                    .padding(.horizontal, 16).frame(height: 52)
                }
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            .frame(minHeight: 230)
        }
    }
}
