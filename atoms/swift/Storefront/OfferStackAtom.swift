import SwiftUI
import Cieo

public struct OfferStackAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "offerstack", category: "Storefront", name: "Offer banner stack",
        summary: "Promos rest pushed back in depth. The top card follows a drag and flings away on velocity, else springs home. Dismissing all holds a done terminal with undo.")
    private let offers = [("20% off outerwear", "Ends Sunday"), ("Free shipping over $100", "Members only"), ("Extra 10% in cart", "Auto-applied")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var gone: Set<Int> = []
    @State private var dragX: CGFloat = 0
    public init() {}
    private var live: [Int] { offers.indices.filter { !gone.contains($0) } }
    public var body: some View {
        AtomStage(hint: "Drag the top card away, or tap dismiss") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Offers for you").font(.callout.weight(.semibold))
                ZStack {
                    if live.isEmpty {
                        HStack { Text("You are all caught up").font(.footnote.weight(.semibold)); Spacer()
                            Button("Undo") { withMotion(.base, reduceMotion: reduce) { gone = [] } }.buttonStyle(.bordered).controlSize(.small) }
                        .padding(14).background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12))
                        .motionTransition(.swap())
                    }
                    ForEach(live.reversed(), id: \.self) { i in
                        let depth = live.firstIndex(of: i) ?? 0
                        HStack(spacing: 10) {
                            Image(systemName: "gift").font(.callout).foregroundStyle(.white).frame(width: 32, height: 32).background(Color.accentColor, in: RoundedRectangle(cornerRadius: 10))
                            VStack(alignment: .leading, spacing: 0) { Text(offers[i].0).font(.footnote.weight(.semibold)); Text(offers[i].1).font(.caption2).foregroundStyle(.secondary) }
                            Spacer()
                            Button { withMotion(.base, reduceMotion: reduce) { _ = gone.insert(i) } } label: { Image(systemName: "xmark").font(.caption) }.buttonStyle(.plain).accessibilityLabel("Dismiss \(offers[i].0)")
                        }
                        .padding(12).background { RoundedRectangle(cornerRadius: 12).fill(.background) }.shadow(radius: 3)
                        .scaleEffect(1 - CGFloat(depth) * 0.04).offset(y: CGFloat(depth) * 10)
                        .offset(x: depth == 0 ? dragX : 0)
                        .gesture(depth == 0 ? DragGesture().onChanged { dragX = $0.translation.width }
                            .onEnded { v in
                                if abs(v.translation.width) > 90 || abs(v.predictedEndTranslation.width) > 260 { withMotion(.base, reduceMotion: reduce) { gone.insert(i); dragX = 0 } }
                                else { withMotion(.base, reduceMotion: reduce) { dragX = 0 } } } : nil)
                        .motion(.base, value: live).motion(.base, value: dragX)
                    }
                }.frame(height: 130)
                Toggle("Depth effect", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }.frame(width: 320)
        }
    }
}
