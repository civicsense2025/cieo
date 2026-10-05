import SwiftUI
import Cieo

public struct NpsScaleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "nps", category: "Forms", name: "NPS scale",
        summary: "The selection plate slides across the scale with lagging edges and changes color by band: danger for 0–6, warning for 7–8, success for 9–10. The caption swaps to match.")
    @State private var sel: Int?
    @State private var frames: [AnyHashable: CGRect] = [:]
    private let bands = ["Detractor", "Passive", "Promoter"]
    public init() {}

    private func band(_ i: Int) -> Int { i <= 6 ? 0 : i <= 8 ? 1 : 2 }
    private var tint: Color { sel.map { [Color.red, .orange, .green][band($0)] } ?? .clear }

    public var body: some View {
        AtomStage {
            VStack(alignment: .leading, spacing: 10) {
                Text("How likely are you to recommend us to a friend?").font(.footnote.weight(.semibold))
                ZStack(alignment: .topLeading) {
                    if let s = sel, let f = frames[s] {
                        EdgesIndicator(frame: f, shape: RoundedRectangle(cornerRadius: 8), style: tint)
                            .motion(.base, value: band(s))
                    }
                    HStack(spacing: 4) {
                        ForEach(0..<11, id: \.self) { i in
                            Button { sel = i } label: {
                                Text("\(i)").font(.callout.weight(.semibold).monospacedDigit())
                                    .foregroundStyle(sel == i ? Color.white : Color.primary)
                                    .frame(maxWidth: .infinity).frame(height: 40)
                                    .background(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.primary.opacity(sel == i ? 0 : 0.2)))
                                    .motion(.base, value: sel)
                                    .contentShape(Rectangle()).reportFrame(i, in: "scale")
                            }
                            .buttonStyle(.plain).accessibilityAddTraits(sel == i ? .isSelected : [])
                        }
                    }
                }
                .coordinateSpace(name: "scale")
                .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                HStack {
                    Text("Not likely")
                    Spacer()
                    SwapText(sel.map { bands[band($0)] } ?? "").foregroundStyle(.primary).fontWeight(.medium)
                    Spacer()
                    Text("Very likely")
                }
                .font(.footnote).foregroundStyle(.secondary)
            }
            .frame(maxWidth: 560)
        }
    }
}
