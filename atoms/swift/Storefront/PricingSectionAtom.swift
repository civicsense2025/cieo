import SwiftUI
import MotionKit

public struct PricingSectionAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pricingsection", category: "Storefront", name: "Pricing section",
        summary: "The segment indicator stretches to the new side, leading edge first. Then the three cards change in one wave from left to right, 60ms apart: price digits roll and the billing note blur-swaps. The Save 20% pill enters once the wave has passed (it leaves at once on monthly). The Studio card rests lifted with its button filled. Hovering or focusing another card moves the lift and fill to it, and leaving returns them to Studio.")

    private let plans: [(name: String, monthly: Int, yearly: Int)] = [("Starter", 12, 10), ("Studio", 24, 19), ("Team", 49, 39)]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var mode = 0
    @State private var cardMode = [0, 0, 0]
    @State private var pill = false
    @State private var hover: Int?
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var wave: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch billing, then hover a card") {
            VStack(spacing: 14) {
                HStack(spacing: 10) {
                    ZStack(alignment: .topLeading) {
                        if let f = frames[mode] { EdgesIndicator(frame: f, shape: Capsule(), style: Color.secondary.opacity(0.3)) }
                        HStack(spacing: 0) { ForEach(["Monthly", "Yearly"].indices, id: \.self) { i in
                            Button(["Monthly", "Yearly"][i]) { choose(i) }.buttonStyle(.plain).font(.footnote.weight(.medium)).padding(.horizontal, 14).padding(.vertical, 6).reportFrame(i, in: "price-seg")
                        } }
                    }
                    .coordinateSpace(name: "price-seg").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }.background(Capsule().fill(.quaternary.opacity(0.6))).fixedSize()
                    if pill { Text("Save 20%").font(.caption.weight(.semibold)).foregroundStyle(.green).padding(.horizontal, 8).padding(.vertical, 3).background(Capsule().fill(Color.green.opacity(0.18))).motionTransition(.presence) }
                }
                HStack(spacing: 10) { ForEach(plans.indices, id: \.self) { card($0) } }
            }
        }
    }

    private func card(_ i: Int) -> some View {
        let lit = i == (hover ?? 1), p = plans[i]
        return VStack(alignment: .leading, spacing: 6) {
            Text(p.name).font(.footnote.weight(.semibold))
            HStack(alignment: .firstTextBaseline, spacing: 1) { Text("$").font(.footnote); RollingDigits(cardMode[i] == 0 ? p.monthly : p.yearly).font(.title.weight(.semibold)) }
            SwapText(cardMode[i] == 0 ? "per month, billed monthly" : "per month, billed yearly").font(.caption2).foregroundStyle(.secondary).frame(height: 14, alignment: .leading)
            Button("Choose") {}.buttonStyle(.plain).font(.caption.weight(.semibold)).frame(maxWidth: .infinity, minHeight: 28)
                .foregroundStyle(lit ? Color(white: 1, opacity: 0.95) : .primary).background(RoundedRectangle(cornerRadius: 8).fill(lit ? Color.primary : Color.clear))
                .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.quaternary))
        }
        .padding(12).frame(width: 112).background(.background, in: RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(.quaternary))
        .shadow(color: .black.opacity(lit ? 0.15 : 0.04), radius: lit ? 10 : 2, y: lit ? 4 : 1).offset(y: lit ? -4 : 0)
        .onHover { h in withMotion(.base, reduceMotion: reduce) { hover = h ? i : (hover == i ? nil : hover) } }
        .animation(reduce ? nil : .motion(.base), value: hover)
    }

    private func choose(_ m: Int) {
        guard m != mode else { return }
        wave?.cancel(); mode = m
        if m == 0 { withMotion(.snap, reduceMotion: reduce) { pill = false } }
        wave = Task {
            try? await Task.sleep(for: .seconds(Motion.lag + 0.1))
            for i in plans.indices {
                if Task.isCancelled { return }
                withMotion(.base, reduceMotion: reduce) { cardMode[i] = m }
                try? await Task.sleep(for: .seconds(0.06))
            }
            if m == 1 && !Task.isCancelled { withMotion(.base, reduceMotion: reduce) { pill = true } }
        }
    }
}
