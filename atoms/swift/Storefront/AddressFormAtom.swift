import SwiftUI
import Cieo

public struct AddressFormAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "addressform", category: "Storefront", name: "Address form",
        summary: "Switching country cross-fades the field set while the wrapper height springs to fit. Typing a known postcode swaps the city in with blur.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var country = 0
    @State private var zip = ""
    @Namespace private var seg
    public init() {}
    private var city: String {
        if zip == "94110" { return "San Francisco, CA" }
        return zip.count >= 5 ? "Unknown ZIP — keep typing" : "Enter ZIP to look up the city"
    }
    public var body: some View {
        AtomStage(hint: "Flip country, then type 94110") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Shipping address").font(.callout.weight(.semibold))
                HStack(spacing: 4) { ForEach(["United States", "United Kingdom"], id: \.self) { c in
                    let i = c == "United States" ? 0 : 1
                    Button(c) { withMotion(.base, reduceMotion: reduce) { country = i } }
                    .buttonStyle(.plain).font(.footnote.weight(.medium)).frame(height: 32).padding(.horizontal, 12)
                    .foregroundStyle(country == i ? .white : .primary)
                    .background { if country == i { RoundedRectangle(cornerRadius: 8).fill(Color.primary).matchedGeometryEffect(id: "seg", in: seg) } }
                } }.animation(reduce ? nil : .motion(.base), value: country)
                ZStack(alignment: .topLeading) {
                    if country == 0 {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(spacing: 8) {
                                TextField("ZIP code", text: $zip).softFieldSurface().font(.footnote)
                                TextField("State", text: .constant("")).softFieldSurface().font(.footnote)
                            }
                            SwapText(city).font(.caption).foregroundStyle(.secondary)
                        }.motionTransition(.swap()).id(country)
                    } else {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(spacing: 8) {
                                TextField("Postcode", text: .constant("")).softFieldSurface().font(.footnote)
                                TextField("County", text: .constant("")).softFieldSurface().font(.footnote)
                            }
                            Text("Try SW1A 1AA.").font(.caption).foregroundStyle(.secondary)
                        }.motionTransition(.swap()).id(country)
                    }
                }.frame(height: 76, alignment: .top)
                Toggle("Look up city", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }.frame(maxWidth: 320)
        }
    }
}
