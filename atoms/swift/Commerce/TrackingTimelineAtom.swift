import SwiftUI
import Cieo

public struct TrackingTimelineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tracking", category: "Commerce", name: "Tracking timeline",
        summary: "The spine fills on the lazy spring while nodes ink 60ms after arrival. ETA digits roll down. Delivered draws its check and swaps to receipt.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur = 0
    @State private var notify = true
    @State private var fill = Track(0, preset: .lazy)
    private let stops = ["Ordered", "Shipped", "Out for delivery", "Delivered"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Advance to Delivered") {
            VStack(spacing: 8) {
                HStack {
                    Text("Trail order").font(.system(size: 15, weight: .semibold))
                    Spacer()
                    Text("ETA ").font(.system(size: 12.5)).foregroundStyle(.secondary)
                    + Text(cur >= 3 ? "0d" : "\(5 - cur)d").font(.system(size: 12.5).weight(.semibold)).monospacedDigit()
                }
                TimelineView(.motion([fill])) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    VStack(spacing: 0) {
                        ForEach(stops.indices, id: \.self) { i in
                            HStack(spacing: 10) {
                                ZStack {
                                    Circle().strokeBorder(i <= cur ? .primary : .quaternary, lineWidth: 2).frame(width: 20, height: 20)
                                    Circle().fill(.primary).frame(width: 10, height: 10)
                                        .scaleEffect(i <= cur ? 1 : 0)
                                        .animation(reduce ? nil : .motion(.base).delay(0.06), value: cur)
                                }
                                Text(stops[i]).font(.system(size: 13)).lineSpacing(6.5)
                                if i == 3 && cur >= 3 {
                                    Image(systemName: "checkmark").foregroundStyle(.green).transition(.opacity)
                                }
                                Spacer()
                            }
                            .padding(.vertical, 8)
                            if i < 3 {
                                Rectangle().fill(i < cur ? .primary : .quaternary)
                                    .frame(width: 2, height: 12).padding(.leading, 9)
                                    .animation(reduce ? nil : .motion(.lazy), value: cur)
                            }
                        }
                    }
                    .opacity(fill.value(at: t) >= 0 ? 1 : 1)
                }
                SwapText(cur >= 3 ? "Receipt · review your tote" : "").font(.system(size: 13)).lineSpacing(6.5)
                    .frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                HStack(spacing: 8) {
                    Button(cur >= 3 ? "Restart" : "Advance") {
                        cur = cur >= 3 ? 0 : cur + 1
                        DataMotion.retarget(&fill, to: Double(cur) / 3, reduce: reduce)
                    }
                    .frame(height: 38).padding(.horizontal, 14)
                    .background(.primary, in: RoundedRectangle(cornerRadius: 9)).foregroundStyle(.background)
                    Toggle("Notify me", isOn: $notify).font(.system(size: 12.5)).foregroundStyle(.secondary).toggleStyle(.checkbox)
                }
            }
            .padding(14).frame(width: 280)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }
}
