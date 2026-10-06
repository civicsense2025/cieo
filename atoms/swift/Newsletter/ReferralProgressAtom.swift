import SwiftUI
import Cieo

public struct ReferralProgressAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "referralprog", category: "Newsletter", name: "Referral progress",
        summary: "The bar fills lazily, milestone nodes ink one by one, the count rides up and the reward swaps to a check.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var count = 0
    private let goal = 5
    public init() {}

    private var done: Bool { count >= goal }

    public var body: some View {
        AtomStage(hint: "Invite readers") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Bring 5, get Plus free").font(.callout.weight(.semibold))
                Text("Each signup inks the next node.").font(.caption).foregroundStyle(.secondary)
                GeometryReader { geo in
                    Capsule().fill(.quaternary)
                        .overlay(alignment: .leading) {
                            Capsule().fill(.primary)
                                .frame(width: geo.size.width * CGFloat(count) / CGFloat(goal))
                                .animation(reduce ? nil : .motion(.lazy), value: count)
                        }
                }.frame(height: 8)
                HStack {
                    ForEach(0..<goal, id: \.self) { i in
                        ZStack {
                            Circle().strokeBorder(i < count ? Color.primary : Color.secondary.opacity(0.4), lineWidth: 1.5)
                            if i < count { Text("\(i + 1)").font(.caption2).foregroundStyle(.background) }
                            else { Text("\(i + 1)").font(.caption2).foregroundStyle(.secondary) }
                        }
                        .frame(width: 22, height: 22)
                        .background(i < count ? Color.primary : Color.clear, in: Circle())
                        .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.06), value: count)
                    }
                }
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("\(count)").font(.callout.weight(.semibold).monospacedDigit())
                    Text("of 5 referrals").font(.caption).foregroundStyle(.secondary)
                }
                ZStack(alignment: .leading) {
                    if done {
                        Label("Reward unlocked — Plus is free", systemImage: "checkmark")
                            .font(.footnote.weight(.semibold)).foregroundStyle(.green).id(1)
                    } else {
                        Text("3 to go: stickers at 3").font(.footnote).id(0)
                    }
                }
                .motionTransition(.swap())
                .animation(reduce ? nil : .motion(.base), value: done)
                Button(count >= goal ? "Done" : "Invite one") {
                    guard count < goal else { return }
                    withMotion(.lazy, reduceMotion: reduce) { count += 1 }
                }
                .buttonStyle(.bordered).controlSize(.regular)
                Button("Reset") { withMotion(.snap, reduceMotion: reduce) { count = 0 } }
                    .font(.caption).buttonStyle(.borderless)
            }
            .padding(16).frame(width: 340)
            .background(.background, in: RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
        }
    }
}
