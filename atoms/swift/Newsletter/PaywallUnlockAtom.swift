import SwiftUI
import MotionKit

public struct PaywallUnlockAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "paywall", category: "Newsletter", name: "Paywall unlock",
        summary: "The lock’s shackle swings open first. Then the gate card exits and the fade over the hidden text lifts from top to bottom.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var unlocked = false
    @State private var lift = Track(0, preset: .lazy)
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Unlock the rest of the post") {
            VStack(spacing: 10) {
                ZStack(alignment: .bottom) {
                    article
                    gate
                }
                .frame(width: 320, height: 270)
                .background(RoundedRectangle(cornerRadius: 14).fill(.quaternary.opacity(0.5)))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                Button("Reset") { unlocked = false; lift.set(0, preset: .base, at: now()) }.font(.caption).buttonStyle(.borderless)
            }
        }
    }

    private var article: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("What we learned shipping members").font(.headline)
            Text("We expected sign-ups to come from the pricing page. They came from the end of long posts instead, right where readers had already decided the writing was worth it.")
            TimelineView(.animation(paused: !lift.isMoving)) { tl in
                let a = min(1, max(0, lift.value(at: tl.date.timeIntervalSinceReferenceDate))) * 130
                Text("So we moved the offer. Every post over 1,200 words now ends with a single line and one button, and the pricing page became a reference instead of a pitch. Conversion doubled in six weeks.")
                    .mask(a > 129 ? AnyView(Color.black) : AnyView(LinearGradient(stops: [
                        .init(color: .black, location: min(1, max(0, (a - 30) / 100))),
                        .init(color: .clear, location: min(1, max(0, a / 100)))], startPoint: .top, endPoint: .bottom)))
            }
        }
        .font(.callout).foregroundStyle(.primary)
        .padding(16).frame(maxHeight: .infinity, alignment: .top)
    }

    private var gate: some View {
        VStack(spacing: 8) {
            ShackleLock(open: unlocked).frame(width: 26, height: 30)
            Text("Members read the rest").font(.subheadline.weight(.semibold))
            Button("Unlock") { unlock() }.buttonStyle(.borderedProminent).controlSize(.small)
        }
        .padding(14).frame(maxWidth: .infinity)
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
        .padding(10)
        .opacity(unlocked ? 0 : 1).offset(y: unlocked ? 12 : 0)
        .animation(reduce ? nil : .motion(.snap).delay(0.25), value: unlocked)
        .allowsHitTesting(!unlocked)
    }

    private func unlock() {
        withMotion(.snap, reduceMotion: reduce) { unlocked = true }
        if reduce { lift.jump(1) } else { lift.set(1, preset: .lazy, at: now() + 0.3) }
    }
}

private struct ShackleLock: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let open: Bool
    var body: some View {
        ZStack(alignment: .bottom) {
            RoundedRectangle(cornerRadius: 3).stroke(lineWidth: 2.5).frame(width: 14, height: 14)
                .offset(y: open ? -16 : -14)
                .rotationEffect(.degrees(open ? -28 : 0), anchor: .bottomLeading)
                .motion(.snap, value: open)
            RoundedRectangle(cornerRadius: 4).frame(width: 24, height: 16)
        }
        .accessibilityLabel(open ? "Unlocked" : "Locked")
    }
}
