import SwiftUI
import MotionKit

public struct FloatingBlockToolbarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "blocktoolbar", category: "Editor", name: "Floating block toolbar",
        summary: "Selecting a block raises one toolbar at its top edge. Choosing another block glides the same toolbar over: whichever edge leads the move goes first, the other lags 60ms. The block-type actions swap by the blur rule (text, image, button) while the toolbar widens or narrows, and move, duplicate and delete stay put at the end.")

    private struct Kind { let name: String; let actions: [String]; let width: CGFloat }
    private let kinds = [Kind(name: "Text", actions: ["bold", "italic", "link"], width: 112), Kind(name: "Image", actions: ["photo.on.rectangle", "crop"], width: 80), Kind(name: "Button", actions: ["paintbrush", "link"], width: 80)]
    private let blockY: [CGFloat] = [50, 112, 174]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var selected: Int?
    @State private var minX: CGFloat = 0
    @State private var maxX: CGFloat = 0
    @State private var y: CGFloat = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Select different blocks") {
            ZStack(alignment: .topLeading) {
                ForEach(kinds.indices, id: \.self) { i in
                    RoundedRectangle(cornerRadius: 8).fill(.quaternary.opacity(0.6)).frame(width: 300, height: 48)
                        .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.accentColor, lineWidth: selected == i ? 2 : 0))
                        .overlay(Text(kinds[i].name).font(.footnote))
                        .offset(x: 20, y: blockY[i]).onTapGesture { select(i) }
                        .accessibilityLabel("\(kinds[i].name) block").accessibilityAddTraits(.isButton)
                }
                if selected != nil {
                    toolbar.frame(width: max(0, maxX - minX), height: 30).offset(x: minX, y: y).transition(reduce ? .identity : .motionPresence)
                }
            }
            .frame(width: 340, height: 250, alignment: .topLeading).animation(reduce ? nil : .motion(.base), value: selected == nil)
        }
    }

    private var toolbar: some View {
        let k = kinds[selected ?? 0]
        return HStack(spacing: 0) {
            ZStack(alignment: .trailing) {
                HStack(spacing: 10) { ForEach(k.actions, id: \.self) { Image(systemName: $0).font(.footnote) } }.id(selected).transition(reduce ? .identity : .motionSwap())
            }.frame(maxWidth: .infinity, alignment: .trailing).padding(.horizontal, 8).animation(reduce ? nil : .motion(.base), value: selected)
            Divider().frame(height: 14)
            HStack(spacing: 10) { Image(systemName: "arrow.up.arrow.down"); Image(systemName: "plus.square.on.square"); Image(systemName: "trash") }.font(.footnote).padding(.horizontal, 8)
        }
        .foregroundStyle(.primary).background(.background, in: RoundedRectangle(cornerRadius: 8)).shadow(color: .black.opacity(0.15), radius: 6, y: 2).clipped()
    }

    private func select(_ i: Int) {
        let right: CGFloat = 20 + 300, left = right - kinds[i].width - 90, ty = blockY[i] - 36
        guard selected != nil else { minX = left; maxX = right; y = ty; withMotion(.base, reduceMotion: reduce) { selected = i }; return }
        let movingRight = right >= maxX
        withAnimation(reduce ? nil : .motion(.base).delay(movingRight ? Motion.lag : 0)) { minX = left }
        withAnimation(reduce ? nil : .motion(.base).delay(movingRight ? 0 : Motion.lag)) { maxX = right }
        withMotion(.base, reduceMotion: reduce) { y = ty; selected = i }
    }
}
