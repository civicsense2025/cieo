import SwiftUI
import Cieo

public struct SwatchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "swatch", category: "Storefront", name: "Variant swatch morph",
        summary: "The selection ring glides with its trailing edge behind. The sold-out swatch fades and a slash draws across it. The name blur-swaps.")
    private let colors: [(String, Color, Int, Bool)] = [("Ink", .primary, 142, false), ("Moss", .green, 128, false), ("Stone", .gray, 128, true), ("Clay", .orange, 136, false)]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pick = 0
    @Namespace private var ring
    public init() {}
    public var body: some View {
        AtomStage(hint: "Pick a color; ring glides, sold-out draws a slash") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Everyday overshirt").font(.callout.weight(.semibold))
                HStack { SwapText(colors[pick].0).font(.footnote.weight(.medium)); Text("$\(colors[pick].2)").font(.footnote.weight(.semibold)).monospacedDigit() }
                HStack(spacing: 12) { ForEach(colors.indices, id: \.self) { i in
                    Button { if !colors[i].3 { withMotion(.base, reduceMotion: reduce) { pick = i } } } label: {
                        ZStack {
                            Circle().fill(colors[i].1).frame(width: 26, height: 26).opacity(colors[i].3 ? 0.45 : 1)
                            if pick == i { Circle().strokeBorder(Color.primary, lineWidth: 2).frame(width: 34, height: 34).matchedGeometryEffect(id: "ring", in: ring) }
                            if colors[i].3 { Image(systemName: "slash.circle").foregroundStyle(.red).font(.caption) }
                        }.frame(width: 36, height: 36)
                    }.buttonStyle(.plain).disabled(colors[i].3).accessibilityLabel(colors[i].0)
                } }.animation(reduce ? nil : .motion(.base), value: pick)
                Toggle("Show sold-out variant", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }.frame(width: 300)
        }
    }
}
