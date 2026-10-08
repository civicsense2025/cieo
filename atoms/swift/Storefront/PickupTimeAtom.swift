import SwiftUI
import Cieo

public struct PickupTimeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pickuptime", category: "Storefront", name: "Pickup time picker",
        summary: "The day disc glides under the new day while slots blur-swap apart. The chosen chip lifts onto a plate that stretches to it.")
    private let days = ["Today", "Tomorrow", "Sat"]
    private let slots = [["9:00", "11:30", "2:00", "4:30"], ["10:00", "12:00", "3:00"], ["9:30", "1:00"]]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var day = 0
    @State private var slot: String? = nil
    @Namespace private var disc
    @Namespace private var plate
    public init() {}
    public var body: some View {
        AtomStage(hint: "Days glide, slots stagger, choice lifts") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Choose pickup time").font(.callout.weight(.semibold))
                HStack(spacing: 4) { ForEach(days.indices, id: \.self) { i in
                    Button(days[i]) { withMotion(.base, reduceMotion: reduce) { day = i; slot = nil } }
                    .buttonStyle(.plain).font(.footnote.weight(.medium)).frame(height: 32).padding(.horizontal, 12)
                    .background(day == i ? AnyShapeStyle(Color.primary) : AnyShapeStyle(Color.clear))
                    .foregroundStyle(day == i ? .white : .primary)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .background { if day == i { RoundedRectangle(cornerRadius: 8).fill(Color.primary).matchedGeometryEffect(id: "disc", in: disc) } }
                } }.animation(reduce ? nil : .motion(.base), value: day)
                HStack(spacing: 6) { ForEach(slots[day], id: \.self) { s in
                    Button(s) { withMotion(.base, reduceMotion: reduce) { slot = s } }
                    .buttonStyle(.plain).font(.footnote).frame(height: 32).padding(.horizontal, 12)
                    .background(.background, in: RoundedRectangle(cornerRadius: 8))
                    .overlay(RoundedRectangle(cornerRadius: 8).fill(slot == s ? Color.primary : Color.secondary.opacity(0.3)).opacity(0.10).allowsHitTesting(false))
                    .offset(y: slot == s ? -2 : 0)
                    .background { if slot == s { RoundedRectangle(cornerRadius: 10).fill(Color.primary).opacity(0.10).padding(-3).matchedGeometryEffect(id: "plate", in: plate) } }
                } }.id(day).motionTransition(.swap())
                SwapText(slot.map { "\(days[day]) at \($0) — ready in 15 min." } ?? "Pick a day to see slots.").font(.caption).foregroundStyle(.secondary)
                Toggle("Include weekend", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }.frame(maxWidth: 320)
        }
    }
}
