import SwiftUI
import Cieo

public struct LayerSwitchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "layerswitch", category: "Maps", name: "Layer switcher",
        summary: "Chips morph a plate with a trailing edge. Old tiles cross-fade while the new layer blooms in. Pins ride above it all.")

    @State private var cur = 0
    @State private var labels = true
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let names = ["Map", "Satellite", "Transit"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch Map, Satellite, Transit") {
            VStack(spacing: 6) {
                ZStack(alignment: .bottomLeading) {
                    Rectangle().fill(.quaternary.opacity(0.4))
                    Rectangle().fill(.black.opacity(0.75))
                        .opacity(cur == 1 ? 1 : 0)
                        .scaleEffect(cur == 1 ? 1 : 0.97)
                        .animation(reduce ? nil : .motion(.base), value: cur)
                    HStack(spacing: 2) {
                        Circle().fill(.primary).frame(width: 12, height: 12)
                        Circle().fill(.primary).frame(width: 12, height: 12).offset(x: 60)
                    }.offset(x: 90, y: -40).opacity(labels ? 1 : 0.25)
                        .animation(reduce ? nil : .motion(.base), value: labels)
                    HStack(spacing: 0) {
                        ForEach(names.indices, id: \.self) { i in
                            Button(names[i]) { withMotion(.base, reduceMotion: reduce) { cur = i } }
                                .font(.subheadline.weight(.medium)).padding(.horizontal, 12).frame(height: 32)
                                .foregroundStyle(i == cur ? Color.white : Color.secondary)
                                .background {
                                    if i == cur { Capsule().fill(.primary).motionTransition(.presence) }
                                }
                                .animation(reduce ? nil : .motion(.base), value: cur)
                                .accessibilityLabel("\(names[i]) layer")
                        }
                    }
                    .padding(4).background(Capsule().fill(.background.opacity(0.92)).shadow(radius: 4, y: 1))
                    .padding(12)
                }
                .frame(width: 380, height: 240).clipShape(RoundedRectangle(cornerRadius: 14))
                HStack { Text("Old tiles cross-fade, new blooms in").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Labels", isOn: $labels).labelsHidden().controlSize(.mini) }
                    .frame(width: 380)
            }
        }
    }
}
