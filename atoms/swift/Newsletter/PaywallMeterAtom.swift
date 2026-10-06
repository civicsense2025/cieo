import SwiftUI
import Cieo

public struct PaywallMeterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "paywallmeter", category: "Newsletter", name: "Paywall meter",
        summary: "Each read rides the arc down. At one left the verdict swaps to a warning, at zero it locks and the gate lifts to reveal the offer.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var left = 3
    @State private var lift = Track(0, preset: .lazy)
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }
    private var locked: Bool { left <= 0 }
    private var verdict: String {
        locked ? "Locked — members read on" : left == 1 ? "1 free read left — last one" : "\(left) free reads left"
    }

    public var body: some View {
        AtomStage(hint: "Read until locked") {
            VStack(spacing: 8) {
                Text("Your reading week").font(.callout.weight(.semibold))
                ZStack {
                    Circle().trim(from: 0, to: 0.5)
                        .stroke(.quaternary, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                    Circle().trim(from: 0, to: 0.5 * Double(left) / 3)
                        .stroke(left <= 1 ? .red : .primary, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                        .animation(reduce ? nil : .motion(.lazy), value: left)
                }
                .frame(width: 140, height: 70)
                Text(verdict).font(.footnote.weight(.semibold))
                    .foregroundStyle(locked || left == 1 ? .red : .primary)
                    .motionTransition(.swap())
                    .animation(reduce ? nil : .motion(.base), value: verdict)
                ZStack(alignment: .bottom) {
                    Text("Members read everything. Join before the lock.")
                        .font(.footnote).multilineTextAlignment(.center)
                        .padding(12).frame(maxWidth: .infinity)
                        .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 10))
                    if !locked {
                        Button("Unlock — $8/mo") { unlock() }
                            .buttonStyle(.borderedProminent).controlSize(.small)
                            .padding(12).background(.background, in: RoundedRectangle(cornerRadius: 10))
                    }
                }
                HStack {
                    Button("Read one") { read() }.buttonStyle(.bordered).controlSize(.small).disabled(locked)
                    Button("Reset") { reset() }.font(.caption).buttonStyle(.borderless)
                }
            }
            .padding(16).frame(width: 340)
            .background(.background, in: RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
        }
    }

    private func read() {
        guard left > 0 else { return }
        withMotion(.lazy, reduceMotion: reduce) { left -= 1 }
        if left <= 0 {
            if reduce { lift.jump(1) } else { lift.set(1, preset: .lazy, at: now() + 0.3) }
        }
    }

    private func unlock() {
        withMotion(.base, reduceMotion: reduce) { left = 3 }
        lift.set(0, preset: .base, at: now())
    }

    private func reset() {
        withMotion(.snap, reduceMotion: reduce) { left = 3 }
        lift.jump(0)
    }
}
