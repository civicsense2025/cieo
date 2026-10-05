import SwiftUI
import Cieo

public struct BrandTintToColourAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-duo", category: "Photo effects", name: "Brand tint to colour",
        summary: "Every photo is gradient-mapped through three tokens (darkest neutral, a tint, lightest neutral), so mixed sources read as one set in both themes. The story under the pointer or keyboard focus cross-fades back to full colour on a soft spring; switching the tint dissolves old map into new. Use when: a grid mixes photos from many sources and needs one calm brand look, with colour reserved for the item you are on.")
    @State private var tint = Color.accentColor
    @State private var focus: Int?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover or focus a photo to bring its colour back") {
            VStack(spacing: 12) {
                HStack(spacing: 8) {
                    ForEach(0..<6, id: \.self) { i in
                        // every photo is mapped through the same tint, so mixed sources read as one set
                        let on = focus == i
                        phPhoto(i, CGSize(width: 90, height: 110))
                            .grayscale(1).contrast(1.1).colorMultiply(tint)
                            .overlay(phPhoto(i, CGSize(width: 90, height: 110)).opacity(on ? 1 : 0))
                            .frame(width: 90, height: 110).clipShape(RoundedRectangle(cornerRadius: 8))
                            .scaleEffect(on ? 1.03 : 1)
                            .animation(.motion(.soft), value: on)
                            .onContinuousHover { phase in if case .active = phase { focus = i } else if focus == i { focus = nil } }
                            .onTapGesture { focus = focus == i ? nil : i }
                            .accessibilityLabel("Photo \(i + 1)").accessibilityAddTraits(.isButton)
                    }
                }
                .frame(maxWidth: .infinity).clipped()
                .animation(.motion(.soft), value: tint)
                HStack {
                    ForEach([Color.accentColor, .orange, .green, .pink], id: \.self) { c in
                        Button { tint = c } label: { Circle().fill(c).frame(width: 22, height: 22) }.buttonStyle(.plain)
                            .overlay(Circle().stroke(.primary, lineWidth: tint == c ? 2 : 0).padding(-3))
                            .accessibilityLabel("Tint")
                    }
                }
            }
        }
    }
}
