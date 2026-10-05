import SwiftUI
import Cieo

private struct KnobSwitch: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Binding var isOn: Bool
    @State private var left = 4.0
    @State private var right = 32.0
    @State private var pressed = false

    var body: some View {
        let l = left - (isOn && pressed ? 6 : 0), r = right + (!isOn && pressed ? 6 : 0)
        ZStack(alignment: .topLeading) {
            Capsule().fill(isOn ? Color.primary : Color.secondary.opacity(0.25))
            Capsule().fill(.background).shadow(color: .black.opacity(0.2), radius: 2, y: 1)
                .frame(width: r - l, height: 28).offset(x: l, y: 4)
        }
        .frame(width: 64, height: 36)
        .animation(reduce ? nil : .motion(.base), value: isOn)
        .animation(reduce ? nil : .motion(.snap), value: pressed)
        .contentShape(Capsule())
        .gesture(DragGesture(minimumDistance: 0)
            .onChanged { _ in pressed = true }
            .onEnded { v in
                pressed = false
                if abs(v.translation.width) < 40 && abs(v.translation.height) < 40 { isOn.toggle() }
            })
        .onChange(of: isOn) { _, on in
            let target = on ? (32.0, 60.0) : (4.0, 32.0)
            guard !reduce else { left = target.0; right = target.1; return }
            // The leading edge moves first; the trailing edge follows 60 ms later.
            withAnimation(.motion(.base).delay(on ? Motion.lag : 0)) { left = target.0 }
            withAnimation(.motion(.base).delay(on ? 0 : Motion.lag)) { right = target.1 }
        }
    }
}

private struct KnobSwitchStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack { configuration.label; KnobSwitch(isOn: configuration.$isOn) }
    }
}

public struct SwitchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "switch", category: "Admin", name: "Switch",
        summary: "The knob leads with one edge and trails with the other. While pressed it widens toward where it will go. The track inks in on the same spring.")
    @State private var on = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Press and hold, then release") {
            Toggle("Email notifications", isOn: $on).labelsHidden().toggleStyle(KnobSwitchStyle())
        }
    }
}
