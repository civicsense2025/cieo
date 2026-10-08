import SwiftUI
import Cieo

public struct RouteCompareAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "routecompare", category: "Maps", name: "Route comparison",
        summary: "Rival inks chase with the trailing edge behind. The winner plate lands leading-edge-first and ETAs roll together.")

    @State private var pick = 0
    @State private var traffic = true
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}

    private func routeRow(_ i: Int) -> some View {
        let sel = i == pick
        return Button {
            withMotion(.base, reduceMotion: reduce) { pick = i }
        } label: {
            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(routes[i].0).font(.subheadline.weight(.medium))
                    GeometryReader { g in
                        Capsule().fill(Color.secondary.opacity(0.25)).overlay(alignment: .leading) {
                            Capsule().fill(Color.primary)
                                .frame(width: g.size.width * (sel ? 1 : 0.55))
                                .animation(reduce ? nil : .motion(.base).delay(sel ? 0 : 0.06), value: pick)
                        }
                    }.frame(height: 5)
                }
                Spacer()
                RollingDigits("\(routes[i].1 + (traffic ? 0 : -2))")
                    .font(.subheadline.weight(.semibold))
                Text("min").font(.caption).foregroundStyle(.secondary)
            }
            .padding(10)
            .background(RoundedRectangle(cornerRadius: 10).fill(sel ? Color.secondary.opacity(0.18) : Color.clear))
            .animation(reduce ? nil : .motion(.base).delay(sel ? 0.06 : 0), value: pick)
        }
        .buttonStyle(.plain)
    }
    private let routes = [("Via Embarcadero", 14), ("Via Market St", 19)]

    public var body: some View {
        AtomStage(hint: "Tap a route to choose it") {
            VStack(alignment: .leading, spacing: 2) {
                Text("Pick a route").font(.callout.weight(.semibold)).lineSpacing(4)
                Text("2 options · traffic now").font(.caption).foregroundStyle(.secondary).lineSpacing(4)
                ForEach(routes.indices, id: \.self) { i in
                    routeRow(i)
                        .opacity(i == pick ? 1 : 0.65)
                        .accessibilityLabel("\(routes[i].0), \(routes[i].1) minutes")
                    if i == 0 { Divider() }
                }
                HStack { Text("Winner keeps the plate").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Traffic", isOn: $traffic).labelsHidden().controlSize(.mini) }
            }
            .padding(14).frame(maxWidth: 380)
            .background(RoundedRectangle(cornerRadius: 14).fill(.background).shadow(radius: 4, y: 1))
        }
    }
}
