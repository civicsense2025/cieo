import SwiftUI
import Cieo

public struct CaretTipAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "carettip", category: "Overlays", name: "Caret tooltip",
        summary: "The tip anchors to the caret with a snap, then glides word to word on base as you type. Text swaps per word and focus never leaves the field.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var text = "type here to glide the tip"
    @FocusState private var editing: Bool
    private let words = ["word", "rivers", "routes", "mornings"]
    public init() {}
    public var body: some View {
        AtomStage(hint: "Tip glides word to word · never steals focus") {
            VStack(spacing: 10) {
                Toggle("Glide caret", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary).controlSize(.small)
                TextField("Type to move the tip", text: $text).focused($editing)
                    .softFieldSurface().font(.callout).frame(width: 270)
                tip.transition(reduce ? .identity : .opacity.combined(with: .offset(y: 4)).animation(.motion(.base)))
            }
            .frame(maxHeight: .infinity, alignment: .top).padding(.top, 40)
        }
    }
    private var tip: some View {
        let n = max(0, text.split(separator: " ").count % words.count)
        return SwapText("“\(words[n])” · \(words[n].count) letters")
            .font(.caption).padding(.horizontal, 10).padding(.vertical, 6)
            .background(Capsule().fill(Color.primary.opacity(0.08)))
            .accessibilityHidden(true)
    }
}
