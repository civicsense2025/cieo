import SwiftUI
import Cieo

public struct GiftWrapAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "giftwrap", category: "Commerce", name: "Gift wrap",
        summary: "The knob edges across like a switch while the note height-springs open and the bow draws softly. The fee rolls without moving the switch.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var on = false
    @State private var fee = Track(0, preset: .base)
    @State private var bow: Double = 0
    @State private var foil = false
    public init() {}

    private func money(_ v: Double) -> String { v.formatted(.currency(code: "USD").locale(Locale(identifier: "en_US"))) }

    public var body: some View {
        AtomStage(hint: "Flip the wrap switch") {
            VStack(spacing: 8) {
                TimelineView(.motion([fee])) { ctx in
                    HStack(spacing: 10) {
                        Image(systemName: "gift").font(.system(size: 24, weight: .light)).foregroundStyle(foil ? .orange : Color.accentColor)
                            .frame(width: 44, height: 33).opacity(0.25 + 0.75 * bow)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Gift wrap").font(.system(size: 15, weight: .semibold))
                            Text("Kraft paper, cotton bow").font(.system(size: 12.5)).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(money(max(0, fee.value(at: ctx.date.timeIntervalSinceReferenceDate))))
                            .font(.system(size: 15, weight: .semibold)).monospacedDigit().frame(minWidth: 52, alignment: .trailing)
                        Toggle("", isOn: $on).toggleStyle(.switch).labelsHidden().accessibilityLabel("Gift wrap")
                            .onChange(of: on) {
                                DataMotion.retarget(&fee, to: on ? 4.95 : 0, reduce: reduce)
                                withMotion(.soft, reduceMotion: reduce) { bow = on ? 1 : 0 }
                            }
                    }
                }
                if on {
                    TextField("Gift note…", text: .constant("")).font(.system(size: 13)).lineSpacing(6.5)
                        .padding(8).background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                        .transition(.move(edge: .top).combined(with: .opacity))
                }
                Toggle("Foil bow", isOn: $foil).font(.system(size: 12.5)).foregroundStyle(.secondary).nativeToggleStyle()
            }
            .padding(14).frame(width: 280)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            .animation(reduce ? nil : .motion(.base), value: on)
        }
    }
}
