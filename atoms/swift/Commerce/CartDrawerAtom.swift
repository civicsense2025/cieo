import SwiftUI
import Cieo

public struct CartDrawerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "cartdrawer", category: "Commerce", name: "Cart drawer",
        summary: "The drawer slides in on the base spring over a fading scrim while rows trail 40ms apart. The free-shipping bar fills and the savings line swaps to its terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var freeOver50 = true
    private let items = [("Scout backpack", 68.0), ("Trail socks", 14.0)]
    public init() {}

    private var subtotal: Double { items.reduce(0) { $0 + $1.1 } }
    private var threshold: Double { freeOver50 ? 50 : 75 }

    public var body: some View {
        AtomStage(hint: "Open the drawer") {
            ZStack {
                VStack(spacing: 8) {
                    Text("Scout backpack").font(.system(size: 15, weight: .semibold))
                    Text("$68").font(.system(size: 15, weight: .semibold)).monospacedDigit()
                    Text("Ballistic nylon, lifetime repairs.").font(.system(size: 13)).lineSpacing(6.5)
                    Button("View cart") { withMotion(.base, reduceMotion: reduce) { open = true } }
                        .frame(height: 38).frame(maxWidth: .infinity)
                        .background(.primary, in: RoundedRectangle(cornerRadius: 9)).foregroundStyle(.background)
                }
                .padding(16).frame(width: 268, height: 348)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                if open {
                    Color.primary.opacity(0.35).onTapGesture {
                        withMotion(.base, reduceMotion: reduce) { open = false }
                    }.transition(.opacity)
                    HStack {
                        Spacer()
                        VStack(spacing: 8) {
                            Text("Your cart").font(.system(size: 15, weight: .semibold)).frame(maxWidth: .infinity, alignment: .leading)
                            ProgressView(value: min(1, subtotal / threshold)).tint(.primary)
                            SwapText(subtotal >= threshold ? "Free shipping unlocked" : "Away from free shipping")
                                .font(.system(size: 12.5)).frame(maxWidth: .infinity, alignment: .leading)
                            ForEach(Array(items.enumerated()), id: \.offset) { i, it in
                                HStack {
                                    RoundedRectangle(cornerRadius: 12).fill(.quaternary).frame(width: 48, height: 36)
                                    Text(it.0).font(.system(size: 13)).lineSpacing(6.5)
                                    Spacer()
                                    Text(it.1, format: .currency(code: "USD")).font(.system(size: 13)).monospacedDigit()
                                }
                                .transition(.move(edge: .trailing).combined(with: .opacity))
                                .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.04), value: open)
                            }
                            Spacer()
                            Divider()
                            HStack { Text("Total").font(.system(size: 15, weight: .semibold)); Spacer()
                                Text(subtotal, format: .currency(code: "USD")).font(.system(size: 15, weight: .semibold)).monospacedDigit() }
                            Button("Checkout") { withMotion(.base, reduceMotion: reduce) { open = false } }
                                .frame(height: 38).frame(maxWidth: .infinity)
                                .background(.primary, in: RoundedRectangle(cornerRadius: 9)).foregroundStyle(.background)
                            Toggle("Free over $50", isOn: $freeOver50).font(.system(size: 12.5)).foregroundStyle(.secondary).toggleStyle(.checkbox)
                        }
                        .padding(14).frame(width: 232).background(.background, in: RoundedRectangle(cornerRadius: 12))
                        .transition(.move(edge: .trailing))
                    }
                    .animation(reduce ? nil : .motion(.base), value: open)
                }
            }
            .frame(width: 268, height: 348).clipped().cornerRadius(14)
        }
    }
}
