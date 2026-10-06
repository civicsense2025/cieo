import SwiftUI
import Cieo

public struct StickyCTAAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stickycta", category: "Landing", name: "Sticky CTA reveal",
        summary: "Scrolling past the hero drops the bar in on a spring; nearing the footer sends it back up. The bar label swaps with the plan picker, so the call to action always names the chosen plan.")

    private let plans = ["Starter", "Studio"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var plan = 1
    @State private var shown = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Bar drops after the hero, hides near the footer") {
            VStack(spacing: 10) {
                Text("Scroll the preview").font(.headline)
                ZStack(alignment: .top) {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 0) {
                            VStack(spacing: 8) {
                                Text("Ship the page").font(.title.weight(.semibold))
                                Text("Scroll past this hero to call in the bar.").font(.caption).foregroundStyle(.secondary)
                                Button("Start free") {}.buttonStyle(.borderedProminent).controlSize(.small)
                            }.frame(maxWidth: .infinity).padding(.vertical, 36)
                            .background(GeometryReader { g in Color.clear.preference(key: HeroBottomKey.self, value: g.frame(in: .named("preview")).maxY) })
                            VStack(alignment: .leading, spacing: 8) {
                                Divider(); Text("Compose in blocks, preview everywhere, publish in one click.").font(.footnote)
                                Divider(); Text("Forms, paywalls and newsletters included.").font(.footnote)
                                Divider()
                                Text("Footer — the bar hides near here.").font(.caption).foregroundStyle(.secondary).padding(.vertical, 28)
                            }.padding(.horizontal, 20)
                        }
                    }
                    .coordinateSpace(name: "preview")
                    .onPreferenceChange(HeroBottomKey.self) { shown = $0 < 240 }
                    if shown {
                        HStack {
                            Text("Start \(plans[plan]) free").font(.subheadline.weight(.semibold)).id(plan).motionTransition(.swap())
                            Spacer()
                            Button("Start free") {}.buttonStyle(.bordered).controlSize(.small).tint(.white)
                        }.padding(.leading, 12).padding(6)
                        .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 10))
                        .foregroundStyle(.white).padding(.horizontal, 8).padding(.top, 8)
                        .id(shown).motionTransition(.swap())
                    }
                }.frame(width: 340, height: 300).background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 10)).clipShape(RoundedRectangle(cornerRadius: 10))
                Picker("Plan", selection: $plan) { ForEach(plans.indices, id: \.self) { Text(plans[$0]).tag($0) } }
                    .pickerStyle(.segmented).labelsHidden().frame(width: 200).opacity(0.8)
            }
        }
    }
}

private struct HeroBottomKey: PreferenceKey {
    static var defaultValue: CGFloat = 400
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}
