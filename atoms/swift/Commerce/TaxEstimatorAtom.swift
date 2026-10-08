import SwiftUI
import Cieo

public struct TaxEstimatorAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "taxest", category: "Commerce", name: "Tax estimator",
        summary: "The ZIP estimator opens on the base height spring. Estimate swaps in itemized rows 50ms apart while money springs together.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = false
    @State private var zip = ""
    @State private var error: String?
    @State private var fired = false
    @State private var tax = Track(0, preset: .base)
    @State private var total = Track(68, preset: .base)
    @State private var county = true
    private let sub = 68.0
    public init() {}

    private func money(_ v: Double) -> String { v.formatted(.currency(code: "USD").locale(Locale(identifier: "en_US"))) }
    private var rate: Double { county ? 0.0825 : 0.06 }

    public var body: some View {
        AtomStage(hint: "Enter 94110, then Estimate") {
            VStack(spacing: 8) {
                HStack {
                    Text("Tax estimate").font(.system(size: 15, weight: .semibold))
                    Spacer()
                    Text("US only").font(.system(size: 12.5)).foregroundStyle(.secondary)
                }
                Button("Estimate with ZIP") { withMotion(.base, reduceMotion: reduce) { shown.toggle() } }
                    .font(.system(size: 13)).frame(maxWidth: .infinity, alignment: .leading).buttonStyle(.plain).foregroundStyle(Color.accentColor)
                if shown {
                    HStack(spacing: 8) {
                        TextField("ZIP", text: $zip).frame(width: 96, height: 38)
                            .padding(.horizontal, 10).background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                            .onChange(of: zip) {
                                error = (zip.isEmpty || zip.range(of: #"^\d{5}$"#, options: .regularExpression) != nil) ? nil : "Enter all 5 digits."
                            }
                        Button("Estimate") { estimate() }.frame(height: 38).padding(.horizontal, 14)
                            .background(.primary, in: RoundedRectangle(cornerRadius: 9)).foregroundStyle(.background)
                    }
                    .transition(.move(edge: .top).combined(with: .opacity))
                    if let error { Text(error).font(.system(size: 12.5)).lineSpacing(6.5).foregroundStyle(.red).frame(maxWidth: .infinity, alignment: .leading) }
                    TimelineView(.motion([tax, total])) { ctx in
                        let t = ctx.date.timeIntervalSinceReferenceDate
                        VStack(spacing: 6) {
                            row("Subtotal", sub, at: t, delay: 0)
                            row("Tax", tax.value(at: t), at: t, delay: 1)
                            row("Total", total.value(at: t), at: t, delay: 2, strong: true)
                        }
                        .padding(.top, 12).overlay(Divider(), alignment: .top)
                    }
                }
                Toggle("Include county rate", isOn: $county).font(.system(size: 12.5)).foregroundStyle(.secondary).nativeToggleStyle()
            }
            .padding(14).frame(width: 280)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            .animation(reduce ? nil : .motion(.base), value: shown)
        }
    }

    private func row(_ label: String, _ v: Double, at t: Double, delay: Int, strong: Bool = false) -> some View {
        HStack {
            Text(label).foregroundStyle(strong ? .primary : .secondary)
            Spacer()
            Text(money(max(0, v))).monospacedDigit()
        }
        .font(strong ? .system(size: 15, weight: .semibold) : .system(size: 13)).lineSpacing(6.5)
        .opacity(fired ? 1 : 0)
        .animation(reduce ? nil : .motion(.base).delay(Double(delay) * 0.05), value: fired)
    }

    private func estimate() {
        guard zip.range(of: #"^\d{5}$"#, options: .regularExpression) != nil else {
            error = "Enter all 5 digits to estimate."
            return
        }
        error = nil; fired = true
        DataMotion.retarget(&tax, to: sub * rate, reduce: reduce)
        DataMotion.retarget(&total, to: sub * (1 + rate), reduce: reduce)
    }
}
