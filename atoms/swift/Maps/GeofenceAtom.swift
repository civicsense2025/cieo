import SwiftUI
import Cieo

public struct GeofenceAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "geofence", category: "Maps", name: "Geofence ring",
        summary: "Entering snaps pulses out, then the ring settles soft and the label swaps to Inside. Leaving reverses it.")

    @State private var inside = false
    @State private var wide = false
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap the map to enter or leave") {
            VStack(spacing: 6) {
                ZStack {
                    Rectangle().fill(.quaternary.opacity(0.4))
                    Circle().strokeBorder(.primary.opacity(0.6), style: StrokeStyle(lineWidth: 2, dash: [6, 4]))
                        .frame(width: wide ? 190 : 150, height: wide ? 190 : 150)
                        .animation(reduce ? nil : .motion(.soft), value: inside)
                        .animation(reduce ? nil : .motion(.base), value: wide)
                    Circle().stroke(Color.accentColor, lineWidth: 2)
                        .frame(width: wide ? 190 : 150, height: wide ? 190 : 150)
                        .scaleEffect(inside ? 1.25 : 0.95).opacity(inside ? 0.2 : 0.6)
                        .animation(reduce ? nil : inside ? .motion(.snap) : .motion(.base), value: inside)
                    SwapText(inside ? "Inside" : "Outside", drift: 4).font(.subheadline.weight(.medium))
                    Circle().fill(.primary).frame(width: 12, height: 12)
                        .overlay(Circle().strokeBorder(.background, lineWidth: 2))
                        .offset(y: inside ? -6 : 0)
                        .animation(reduce ? nil : .motion(.soft), value: inside)
                }
                .frame(width: 380, height: 240).clipShape(RoundedRectangle(cornerRadius: 14))
                .contentShape(Rectangle())
                .onTapGesture { withMotion(inside ? .base : .soft, reduceMotion: reduce) { inside.toggle() } }
                .accessibilityLabel("Geofence").accessibilityValue(inside ? "Inside" : "Outside")
                HStack { Text("Exit reverses the breach").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Wide ring", isOn: $wide).labelsHidden().controlSize(.mini) }
                    .frame(maxWidth: 380)
            }
        }
    }
}
