import SwiftUI
import Cieo

public struct AddressFieldsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "addressfields", category: "Maps", name: "Address fields",
        summary: "The verified plate glides with a trailing edge. Typing swaps the suggestion. A bad ZIP shakes and the error holds.")

    @State private var street = "1 Ferry Bldg"
    @State private var city = "San Francisco"
    @State private var zip = "94111"
    @State private var error: String?
    @State private var shake = 0
    @State private var suggest = true
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}
    private var valid: Bool { zip.range(of: #"^\d{5}$"#, options: .regularExpression) != nil }

    public var body: some View {
        AtomStage(hint: "Clear the ZIP, then Verify") {
            VStack(alignment: .leading, spacing: 6) {
                Text("Delivery address").font(.callout.weight(.semibold)).lineSpacing(4)
                HStack(spacing: 0) {
                    Capsule().fill(.green).frame(width: 4)
                        .scaleEffect(y: valid ? 1 : 0.2, anchor: .top)
                        .opacity(valid ? 1 : 0.3)
                        .animation(reduce ? nil : .motion(.base).delay(valid ? 0.06 : 0), value: valid)
                    VStack(alignment: .leading, spacing: 6) {
                        labeled("Street") { TextField("Street", text: $street).softFieldSurface().font(.subheadline) }
                        if suggest {
                            Button(street.count > 12 ? "1 Ferry Plaza, SF" : "1 Ferry Building, SF") {
                                street = street.count > 12 ? "1 Ferry Plaza" : "1 Ferry Building"
                            }
                            .font(.subheadline).padding(8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(RoundedRectangle(cornerRadius: 8).fill(.secondary.opacity(0.12)))
                            .motionTransition(.swap())
                        }
                        HStack(spacing: 8) {
                            labeled("City") { TextField("City", text: $city).softFieldSurface().font(.subheadline) }
                            labeled("ZIP") { TextField("ZIP", text: $zip).softFieldSurface().font(.subheadline).monospacedDigit().frame(width: 110) }
                        }
                        if let error {
                            Text(error).font(.caption).foregroundStyle(.red).lineSpacing(4).motionTransition(.swap())
                        }
                        Button("Verify address") {
                            if valid { withMotion(.base, reduceMotion: reduce) { error = nil } }
                            else {
                                error = "Enter the 5-digit ZIP so the courier finds the door."
                                if !reduce { withAnimation(.motion(.snap)) { shake += 1 } }
                            }
                        }
                        .buttonStyle(.borderedProminent).controlSize(.small).frame(maxWidth: .infinity)
                    }.padding(.leading, 8)
                }
                .offset(x: 0)
                .modifier(ShakeModifier(shake: shake, reduce: reduce))
                HStack { Text("Verified plate glides behind").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Suggest", isOn: $suggest).labelsHidden().controlSize(.mini) }
                    .padding(.top, 8)
            }
            .padding(14).frame(maxWidth: 380)
            .background(RoundedRectangle(cornerRadius: 14).fill(.background).shadow(radius: 4, y: 1))
        }
    }

    private func labeled(_ t: String, _ f: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 4) { Text(t).font(.caption).foregroundStyle(.secondary).lineSpacing(4); f() }
    }
}

private struct ShakeModifier: ViewModifier {
    let shake: Int
    let reduce: Bool
    @State private var x = 0.0
    func body(content: Content) -> some View {
        content.offset(x: x)
            .onChange(of: shake) {
                guard !reduce else { return }
                x = -8
                withAnimation(.motion(.snap)) { x = 0 }
            }
    }
}
