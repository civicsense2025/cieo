import SwiftUI
import Cieo

public struct ItineraryAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "itinerary", category: "Maps", name: "Itinerary timeline",
        summary: "One scrub value inks the route and rolls the clock and miles together. Stop photos swap in as the marker passes.")

    @State private var scrub = 30.0
    @State private var walking = false
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let stops = ["Ferry Building", "Coit Tower", "North Beach"]
    public init() {}
    private var active: Int { min(2, Int(scrub / 100 * 3)) }

    public var body: some View {
        AtomStage(hint: "Drag the slider") {
            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .firstTextBaseline, spacing: 10) {
                    Text("Day one").font(.callout.weight(.semibold)).lineSpacing(4)
                    RollingDigits(clock).font(.subheadline.weight(.semibold))
                    Spacer()
                    RollingDigits(miles).font(.caption).foregroundStyle(.secondary)
                }
                GeometryReader { g in
                    Capsule().fill(.secondary.opacity(0.2)).overlay(alignment: .leading) {
                        Capsule().fill(.primary).frame(width: g.size.width * scrub / 100)
                    }
                    Circle().fill(.background).overlay(Circle().strokeBorder(.primary, lineWidth: 3))
                        .frame(width: 14, height: 14).position(x: g.size.width * scrub / 100, y: 3)
                }.frame(height: 6).padding(.vertical, 10)
                Slider(value: $scrub, in: 0...100).tint(.primary)
                    .animation(reduce ? nil : .motion(.base), value: scrub)
                    .accessibilityLabel("Scrub the day")
                ForEach(stops.indices, id: \.self) { i in
                    HStack(spacing: 10) {
                        RoundedRectangle(cornerRadius: 7).fill(tint(i).opacity(0.4))
                            .frame(width: 44, height: 32)
                            .overlay(SwapText(i <= active ? "✓" : "", drift: 4).font(.caption).foregroundStyle(.secondary))
                        Text(stops[i]).font(.subheadline).lineSpacing(4)
                        Spacer()
                        Text("\(9 + i * 2):00").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                    }
                    .padding(.vertical, 8)
                    .opacity(i <= active ? 1 : 0.45)
                    .animation(reduce ? nil : .motion(.lazy), value: active)
                    if i < stops.count - 1 { Divider() }
                }
                HStack { Text("One value drives ink, clock and miles").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Walking", isOn: $walking).labelsHidden().controlSize(.mini) }
                    .padding(.top, 8)
            }
            .padding(14).frame(width: 380)
            .background(RoundedRectangle(cornerRadius: 14).fill(.background).shadow(radius: 4, y: 1))
        }
    }

    private var clock: String {
        let m = 30 + Int((scrub * 0.9).rounded()) % 60
        return "\(9 + Int(scrub / 60 * 6)):\(String(format: "%02d", m))"
    }
    private var miles: String { String(format: "%.1fm", scrub / 10 * (walking ? 0.4 : 1)) }
    private func tint(_ i: Int) -> Color { [.blue, .brown, .green][i] }
}
