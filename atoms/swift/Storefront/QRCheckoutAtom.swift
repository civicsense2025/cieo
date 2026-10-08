import SwiftUI
import Cieo

public struct QRCheckoutAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "qrcheckout", category: "Storefront", name: "QR checkout",
        summary: "The code rests at 96% and springs to full on open while a beam sweeps on the clock. Paid swaps in a check and the total counts up to a held terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var paid = false
    @State private var shown = false
    @State private var total: Double = 24
    public init() {}
    public var body: some View {
        AtomStage(hint: "Beam sweeps until paid, then total counts up") {
            VStack(spacing: 8) {
                Text("Scan to pay").font(.callout.weight(.semibold))
                ZStack {
                    RoundedRectangle(cornerRadius: 12).fill(.quaternary).opacity(0.10).frame(width: 148, height: 148)
                        .overlay(Image(systemName: "qrcode").font(.system(size: 90)).foregroundStyle(.primary))
                        .scaleEffect(shown ? 1 : 0.96).motion(.base, value: shown)
                    TimelineView(.animation(minimumInterval: 1.0 / 30)) { tl in
                        if !paid {
                            let p = (tl.date.timeIntervalSinceReferenceDate.truncatingRemainder(dividingBy: 2.4)) / 2.4
                            Capsule().fill(Color.accentColor).frame(width: 120, height: 2).offset(y: -40 + CGFloat(p) * 80)
                        }
                    }.allowsHitTesting(false)
                    if paid { Image(systemName: "checkmark.circle.fill").font(.largeTitle).foregroundStyle(.green).background(.white, in: Circle()).motionTransition(.swap()) }
                }.frame(width: 160, height: 160)
                Text(total, format: .currency(code: "USD")).font(.footnote.weight(.semibold)).monospacedDigit().motion(.soft, value: total)
                SwapText(paid ? "Payment received" : "Show this code at the register").font(.caption).foregroundStyle(.secondary)
                HStack {
                    Button(paid ? "Reset demo" : "Simulate scan") {
                        withMotion(.base, reduceMotion: reduce) { paid.toggle(); total = paid ? 0 : 24 }
                        if paid { Task { try? await Task.sleep(for: .seconds(0.15)); withMotion(.soft, reduceMotion: reduce) { total = 24 } } }
                    }.buttonStyle(.borderedProminent).controlSize(.small)
                    Toggle("Beam", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
                }
            }.frame(maxWidth: 300).onAppear { withMotion(.base, reduceMotion: reduce) { shown = true } }
        }
    }
}
