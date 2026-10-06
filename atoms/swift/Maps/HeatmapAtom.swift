import SwiftUI
import Cieo

public struct HeatmapAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "crowdheat", category: "Maps", name: "Crowd heat overlay",
        summary: "Cells bloom in and cross-fade. Dense cells pulse once and rest. Toggling off fades the heat and brings pins back.")

    @State private var on = true
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let d: [Double] = [0.2, 0.5, 0.9, 0.4, 0.7, 0.3, 0.6, 0.95, 0.5, 0.3, 0.8, 0.45, 0.25, 0.6, 0.85, 0.35, 0.55, 0.2]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Toggle the overlay") {
            VStack(spacing: 6) {
                ZStack {
                    Rectangle().fill(.quaternary.opacity(0.4))
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 6), spacing: 8) {
                        ForEach(d.indices, id: \.self) { i in
                            RoundedRectangle(cornerRadius: 9).fill(Color.accentColor)
                                .opacity(on ? 0.25 + 0.65 * d[i] : 0)
                                .scaleEffect(on ? 1 : 0.7)
                                .frame(height: 52)
                                .animation(reduce ? nil : .motion(.lazy).delay(Double(i) * 0.04), value: on)
                                .overlay {
                                    if on && d[i] > 0.8 {
                                        RoundedRectangle(cornerRadius: 9).stroke(Color.accentColor, lineWidth: 2)
                                            .scaleEffect(1.15).opacity(0.4)
                                            .animation(reduce ? nil : .motion(.snap), value: on)
                                    }
                                }
                        }
                    }.padding(12)
                    HStack(spacing: 60) {
                        pin.offset(x: -60, y: 20); pin.offset(y: -30); pin.offset(x: 60, y: 10)
                    }.opacity(on ? 0 : 1)
                        .animation(reduce ? nil : .motion(.base), value: on)
                }
                .frame(width: 380, height: 240).clipShape(RoundedRectangle(cornerRadius: 14))
                HStack { Text("Dense cells pulse once, then rest").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Heat", isOn: $on).labelsHidden().controlSize(.mini) }
                    .frame(width: 380)
            }
        }
    }

    private var pin: some View {
        Circle().fill(.primary).frame(width: 12, height: 12)
            .overlay(Circle().strokeBorder(.background, lineWidth: 2))
    }
}
