import SwiftUI
import Cieo

public struct CorkboardAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "corkboard", category: "Writing", name: "Corkboard cards",
        summary: "Scene cards follow the pointer one to one while held, spring home with a stagger on release, and the synopsis swaps to the held card.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var selected = 0
    @State private var dragging = -1
    @State private var drag = CGSize.zero
    @State private var tweak = true
    private let cards = ["Cold open", "Turn", "Button"]
    private let synopses = ["A door sings in an empty house.", "Dust rises; something answers upstairs.", "Mara decides to stay the night."]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag a card, release to snap back") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    ForEach(cards.indices, id: \.self) { i in
                        Text(cards[i]).font(.system(size: 14)).padding(14)
                            .background(RoundedRectangle(cornerRadius: 10)
                                .fill(i == selected ? Color.accentColor.opacity(0.25) : Color.gray.opacity(0.15)))
                            .offset(i == dragging ? drag : .zero)
                            .zIndex(i == dragging ? 1 : 0)
                            .animation(dragging == i ? nil : (reduce ? nil : .motion(.base).delay(0.04 * Double(i))), value: drag)
                            .gesture(DragGesture()
                                .onChanged { d in dragging = i; selected = i; drag = d.translation }
                                .onEnded { _ in dragging = -1; drag = .zero })
                    }
                }
                if tweak {
                    Text(synopses[selected]).font(.system(size: 12.5))
                        .transition(.opacity)
                }
                Toggle("Show synopsis", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .animation(reduce ? nil : .motion(.base), value: selected)
            .animation(reduce ? nil : .motion(.base), value: tweak)
        }
    }
}
