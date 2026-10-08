import SwiftUI
import Cieo

public struct ExpressPayAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "expresspay", category: "Commerce", name: "Express pay sheet",
        summary: "Wallet buttons fade up staggered once ready. The sheet rises on the base spring with line-items, options and coupon inside. Confirm fills success.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var ready = false
    @State private var sheet = false
    @State private var paid = false
    @State private var coupon = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Wait for wallets, open options") {
            ZStack(alignment: .bottom) {
                VStack(spacing: 8) {
                    Text("Checkout").font(.system(size: 15, weight: .semibold)).frame(maxWidth: .infinity, alignment: .leading)
                    Text("$82.00").font(.system(size: 15, weight: .semibold)).monospacedDigit().frame(maxWidth: .infinity, alignment: .leading)
                    if ready {
                        PreviewAction("Pay").frame(height: 38).frame(maxWidth: .infinity)
                            .background(.primary, in: RoundedRectangle(cornerRadius: 9)).foregroundStyle(.background)
                            .transition(.move(edge: .bottom).combined(with: .opacity))
                        PreviewAction("G Pay").frame(height: 38).frame(maxWidth: .infinity)
                            .background(.primary, in: RoundedRectangle(cornerRadius: 9)).foregroundStyle(.background)
                            .transition(.move(edge: .bottom).combined(with: .opacity))
                            .animation(reduce ? nil : .motion(.base).delay(0.06), value: ready)
                    }
                    Button("More options") { withMotion(.base, reduceMotion: reduce) { sheet = true } }
                        .frame(height: 38).frame(maxWidth: .infinity).buttonStyle(.bordered)
                    Toggle("Apply SHIP10 in sheet", isOn: $coupon).font(.system(size: 12.5)).foregroundStyle(.secondary).nativeToggleStyle()
                    Spacer()
                }
                .padding(14).frame(width: 280, height: 330)
                if sheet {
                    VStack(spacing: 8) {
                        Text("Order · 2 items").font(.system(size: 13, weight: .semibold)).lineSpacing(6.5).frame(maxWidth: .infinity, alignment: .leading)
                        line("Scout backpack", "$68.00")
                        line("Trail socks", "$14.00")
                        if coupon { line("Coupon SHIP10", "−$10.00") }
                        Button(paid ? "Paid · Receipt sent" : "Confirm $82.00") {
                            withMotion(.base, reduceMotion: reduce) { paid = true }
                        }
                        .frame(height: 38).frame(maxWidth: .infinity)
                        .background(paid ? .green : .primary, in: RoundedRectangle(cornerRadius: 9))
                        .foregroundStyle(.white)
                        .animation(reduce ? nil : .motion(.base), value: paid)
                    }
                    .padding(14).background(.background, in: RoundedRectangle(cornerRadius: 12))
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
                    .transition(.move(edge: .bottom))
                }
            }
            .frame(width: 280, height: 330).clipped().cornerRadius(14)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            .animation(reduce ? nil : .motion(.base), value: sheet)
            .task { try? await Task.sleep(for: .milliseconds(400)); ready = true }
        }
    }

    private func line(_ a: String, _ b: String) -> some View {
        HStack {
            Text(a).font(.system(size: 13)).lineSpacing(6.5).foregroundStyle(.secondary)
            Spacer()
            Text(b).font(.system(size: 13)).monospacedDigit()
        }
    }
}
