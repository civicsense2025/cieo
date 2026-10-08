import SwiftUI
import Cieo

public struct ChatPollAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "chatpoll", category: "Forms", name: "In-chat poll",
        summary: "Each option morphs in place into its result bar. Fills stagger in, percents roll their digits, and the picked row keeps its check.")

    private let options = [("Booking calendar", 38), ("Course player", 27), ("Job board", 21), ("Map directory", 14)]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var voted: Int?
    @State private var fills = false
    @State private var animate = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Vote, then watch the bars land") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Which block should ship next?").font(.system(size: 15, weight: .semibold))
                VStack(spacing: 6) {
                    ForEach(options.indices, id: \.self) { i in
                        Button { vote(i) } label: { row(i) }
                            .buttonStyle(.plain).disabled(voted != nil)
                    }
                }
                SwapText(voted == nil ? "Tap an option to vote" : "You picked \(options[voted!].0) · 128 votes")
                    .font(.caption).foregroundStyle(voted == nil ? Color.secondary : Color.green)
                    .frame(height: 18, alignment: .leading)
                HStack {
                    Toggle("Animate fills", isOn: $animate).font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Button("Reset") {
                        withMotion(.base, reduceMotion: reduce) { voted = nil; fills = false }
                    }.buttonStyle(.bordered).controlSize(.small)
                }
            }
            .frame(maxWidth: 300)
        }
    }

    private func row(_ i: Int) -> some View {
        let pct = voted == nil ? 0 : options[i].1 + (voted == i ? 1 : 0)
        return ZStack(alignment: .leading) {
            RoundedRectangle(cornerRadius: 10).fill(Color.secondary.opacity(0.18))
                .frame(width: voted == nil ? 0 : 276 * Double(pct) / 100)
                .animation(reduce || !animate ? nil : .motion(.base).delay(Motion.stagger(i, of: options.count, gap: 0.06)), value: fills)
            HStack(spacing: 8) {
                if voted == i {
                    Image(systemName: "checkmark").font(.system(size: 13, weight: .bold))
                        .motionTransition(.swap())
                }
                Text(options[i].0).font(.system(size: 13.5))
                Spacer()
                if voted != nil {
                    RollingDigits(pct).font(.system(size: 13))
                        .opacity(fills ? 1 : 0)
                        .animation(reduce ? nil : .motion(.base), value: fills)
                }
            }
            .padding(.horizontal, 12).padding(.vertical, 10)
        }
        .frame(width: 276)
        .overlay(RoundedRectangle(cornerRadius: 10).fill(voted == i ? Color.primary : Color.secondary.opacity(0.25)).opacity(0.10).allowsHitTesting(false))
    }

    private func vote(_ i: Int) {
        guard voted == nil else { return }
        withMotion(.base, reduceMotion: reduce) {
            voted = i
            fills = true
        }
    }
}
