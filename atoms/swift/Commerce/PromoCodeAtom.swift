import SwiftUI
import Cieo

public struct PromoCodeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "promocode", category: "Commerce", name: "Promo code",
        summary: "The field grows open on the base spring. Apply spins, then the success chip width-springs in while the discount rolls. Bad codes ring danger inline.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = false
    @State private var code = ""
    @State private var busy = false
    @State private var applied = false
    @State private var error: String?
    @State private var total = Track(82, preset: .base)
    @State private var auto = true
    public init() {}

    private func money(_ v: Double) -> String { v.formatted(.currency(code: "USD").locale(Locale(identifier: "en_US"))) }

    public var body: some View {
        AtomStage(hint: "Type SHIP10, then try a bad code") {
            VStack(spacing: 8) {
                TimelineView(.motion([total])) { ctx in
                    HStack {
                        Text("Order total").font(.system(size: 15, weight: .semibold))
                        Spacer()
                        Text(money(total.value(at: ctx.date.timeIntervalSinceReferenceDate)))
                            .font(.system(size: 15, weight: .semibold)).monospacedDigit()
                    }
                }
                Button("Have a code?") { withMotion(.base, reduceMotion: reduce) { shown.toggle() } }
                    .font(.system(size: 13)).frame(maxWidth: .infinity, alignment: .leading).buttonStyle(.plain).foregroundStyle(Color.accentColor)
                if shown {
                    HStack(spacing: 8) {
                        TextField("TRY SHIP10", text: $code)
                            .frame(height: 38).padding(.horizontal, 10)
                            .background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                            .border(error != nil ? .red : .clear, width: 1)
                            .onChange(of: code) { error = nil }
                        Button {
                            apply()
                        } label: {
                            if busy { ProgressView().frame(minWidth: 76, minHeight: 38) }
                            else { Text("Apply").frame(minWidth: 76, minHeight: 38) }
                        }
                        .background(.primary, in: RoundedRectangle(cornerRadius: 9)).foregroundStyle(.background).buttonStyle(.plain)
                    }
                    .transition(.move(edge: .top).combined(with: .opacity))
                    if let error {
                        Text(error).font(.system(size: 12.5)).lineSpacing(6.5).foregroundStyle(.red)
                            .frame(maxWidth: .infinity, alignment: .leading).transition(.opacity)
                    } else if !code.isEmpty && !applied {
                        Text("Codes are 6 letters — try SHIP10.").font(.system(size: 12.5)).lineSpacing(6.5)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                if applied {
                    Text("SHIP10 · −$10").font(.system(size: 13, weight: .semibold))
                        .padding(.horizontal, 12).frame(height: 30)
                        .background(.quaternary, in: Capsule())
                        .transition(.scale(scale: 0.85).combined(with: .opacity))
                }
                Toggle("Auto-apply best code", isOn: $auto).font(.system(size: 12.5)).foregroundStyle(.secondary).toggleStyle(.checkbox)
                    .onChange(of: auto) { if auto { code = "SHIP10" } }
            }
            .padding(14).frame(width: 280)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            .animation(reduce ? nil : .motion(.base), value: shown)
            .animation(reduce ? nil : .motion(.base), value: applied)
        }
    }

    private func apply() {
        guard !busy, shown else { return }
        busy = true; error = nil
        Task {
            try? await Task.sleep(for: .milliseconds(reduce ? 0 : 900))
            busy = false
            if code.trimmingCharacters(in: .whitespaces).uppercased() == "SHIP10" {
                applied = true
                DataMotion.retarget(&total, to: 72, reduce: reduce)
            } else {
                applied = false
                DataMotion.retarget(&total, to: 82, reduce: reduce)
                error = "That code didn’t work. Check spelling — try SHIP10."
            }
        }
    }
}
