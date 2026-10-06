import SwiftUI
import Cieo

public struct ShelfAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "shelf", category: "Storefront", name: "Shelf carousel",
        summary: "The shelf follows a drag 1:1 and rubber-bands past the edges, then settles to the nearest card. Dots roll with the shelf and peek cards trail in.")
    private let items = [("Field tee", 42), ("Canvas tote", 32), ("Stone mug", 28), ("Linen set", 64)]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var index = 0
    @State private var offset: CGFloat = 0
    @State private var held: CGFloat? = nil
    public init() {}
    public var body: some View {
        AtomStage(hint: "Drag the shelf, or tap a dot") {
            VStack(alignment: .leading, spacing: 8) {
                Text("New arrivals").font(.callout.weight(.semibold))
                HStack(spacing: 12) {
                    ForEach(items.indices, id: \.self) { i in
                        VStack(alignment: .leading, spacing: 4) {
                            RoundedRectangle(cornerRadius: 12).fill(.quaternary).frame(width: 120, height: 90)
                                .overlay(Image(systemName: "bag").foregroundStyle(.secondary))
                            Text(items[i].0).font(.footnote.weight(.medium)).lineLimit(1)
                            Text("$\(items[i].1)").font(.footnote.weight(.semibold)).monospacedDigit()
                        }
                        .frame(width: 132)
                        .scaleEffect(index == i ? 1 : 0.94).opacity(index == i ? 1 : 0.75)
                        .motion(.base, value: index)
                    }
                }
                .offset(x: held ?? -CGFloat(index) * 144)
                .gesture(DragGesture().onChanged { v in held = -CGFloat(index) * 144 + v.translation.width }
                    .onEnded { v in
                        let w: CGFloat = 144
                        let raw = (-(held ?? 0) + max(-300, min(300, -v.predictedEndTranslation.width * 0.2))) / w
                        held = nil
                        withMotion(.soft, reduceMotion: reduce) { index = min(items.count - 1, max(0, Int(round(raw)))) }
                    })
                HStack(spacing: 6) { ForEach(items.indices, id: \.self) { i in
                    Button { withMotion(.base, reduceMotion: reduce) { index = i } } label: {
                        Circle().fill(index == i ? Color.primary : Color.secondary.opacity(0.4))
                            .frame(width: index == i ? 8 : 6, height: index == i ? 8 : 6)
                    }.buttonStyle(.plain).accessibilityLabel("Go to item \(i + 1)")
                } }.frame(maxWidth: .infinity)
                Toggle("Peek next card", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }.frame(width: 340)
        }
    }
}
