import SwiftUI
import MotionKit

public struct CtaBandFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fz2-ctaband", category: "Footers", name: "Call-to-action band footer",
        summary: "Once 96px of the band is on screen, the eyebrow fades up first, then the headline words rise out of their masks 45ms apart, then the actions and reassurances follow in the same order. The button is one element that morphs on hover: it widens to make room for the arrow, its corners round from 14 to a full pill, its fill turns from light to the accent, and it presses in 3% on the snap spring. Link underlines wipe in from the left.")
    public init() {}
    public var body: some View { FootPage(blocks: 2) { Band() } }
}

private struct Band: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Environment(\.footVisible) private var visible
    @State private var hover = false
    private let words = ["Make", "something", "calm", "today"]
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("READY WHEN YOU ARE").font(.caption2.weight(.semibold)).opacity(visible ? 1 : 0).offset(y: visible ? 0 : 10)
                .animation(reduce ? nil : .motion(.base), value: visible)
            HStack(spacing: 6) {
                ForEach(words.indices, id: \.self) { i in
                    Text(words[i]).font(.title2.weight(.bold)).fixedSize()
                        .offset(y: visible ? 0 : 30).frame(height: 30, alignment: .top).clipped()
                        .animation(reduce ? nil : .motion(.base).delay(visible ? 0.045 * Double(i + 1) : 0), value: visible)
                }
            }
            HStack(spacing: 14) {
                Button {} label: {
                    HStack(spacing: 6) { Text("Start free").font(.callout.weight(.semibold)); if hover { Image(systemName: "arrow.right") } }
                        .padding(.horizontal, 16).padding(.vertical, 10)
                        .foregroundStyle(hover ? Color.white : Color.black)
                        .background(hover ? Color.accentColor : Color.white, in: RoundedRectangle(cornerRadius: hover ? 22 : 14, style: .continuous))
                }
                .buttonStyle(PressStyle()).onHover { hover = $0 }.animation(reduce ? nil : .motion(.snap), value: hover)
                FootLink(title: "Talk to sales")
            }
            .opacity(visible ? 1 : 0).offset(y: visible ? 0 : 10).animation(reduce ? nil : .motion(.base).delay(visible ? 0.27 : 0), value: visible)
            Text("No card needed. Cancel any time.").font(.caption).foregroundStyle(.secondary)
                .opacity(visible ? 1 : 0).animation(reduce ? nil : .motion(.base).delay(visible ? 0.32 : 0), value: visible)
        }
        .foregroundStyle(.background)
        .padding(18).frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.primary, in: RoundedRectangle(cornerRadius: 12))
    }
}

private struct PressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.scaleEffect(configuration.isPressed ? 0.97 : 1).motion(.snap, value: configuration.isPressed)
    }
}
