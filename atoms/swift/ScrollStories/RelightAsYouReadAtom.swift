import SwiftUI
import MotionKit

public struct RelightAsYouReadAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-relight", category: "Scroll stories", name: "Relight as you read",
        summary: "Use when the photo should keep pace with long-form reading: an essay, a case study, a place. As you read, the city relights from noon to golden hour. The warm exposure arrives as a soft band sweeping from the sun’s corner (top right) toward the bottom left, so light visibly travels across the scene; the time tag counts with it and the paragraph being read brightens. Reduced motion replaces the sweep with an even cross-fade.")
    public init() {}
    private let paras = ["Noon: flat light, every roof the same grey.", "Mid-afternoon: shadows lengthen toward the river.", "Evening: the far hills catch it first."]

    public var body: some View {
        PhScrollStory(hint: "As you read, the scene relights from noon to golden hour", length: 3) { p, s in
            let hour = 12 + p * 6.5
            VStack(spacing: 8) {
                ZStack(alignment: .topTrailing) {
                    phPhoto(3, CGSize(width: s.width - 24, height: s.height * 0.6))
                    // the warm exposure arrives as a soft band from the sun's corner (top right) toward the bottom left
                    phPhoto(3, CGSize(width: s.width - 24, height: s.height * 0.6), golden: 1)
                        .mask(phSoftEdge(p, soft: 0.5, start: .topTrailing, end: .bottomLeading))
                    Text(String(format: "%d:%02d", Int(hour), Int((hour - floor(hour)) * 60))).font(.caption.monospacedDigit().weight(.semibold))
                        .padding(.horizontal, 8).padding(.vertical, 3).background(.regularMaterial, in: Capsule()).padding(8)
                }
                .clipShape(RoundedRectangle(cornerRadius: 12))
                VStack(alignment: .leading, spacing: 2) {
                    ForEach(paras.indices, id: \.self) { i in
                        Text(paras[i]).font(.caption).opacity(0.35 + 0.65 * max(0, 1 - abs(p * 2 - Double(i)) ))   // the paragraph being read brightens
                    }
                }.frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14)
            }
        }
    }
}
