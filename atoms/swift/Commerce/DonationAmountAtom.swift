import SwiftUI
import Cieo

public struct DonationAmountAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "donation", category: "Commerce", name: "Donation amount",
        summary: "The amount indicator stretches between chips. “Other” opens a field below on a height spring, and the button’s amount rolls digit by digit.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @FocusState private var focused: Bool
    private let chips = ["$10", "$25", "$50", "$100", "Other"]
    @State private var chip = 1
    @State private var custom = ""
    private enum Give { case idle, busy, thanks }
    @State private var give = Give.idle
    @State private var receipt = true
    @State private var run: Task<Void, Never>?
    public init() {}

    private var amount: String {
        chip == 4 ? String(Int(custom) ?? 0) : String(chips[chip].dropFirst())
    }

    public var body: some View {
        AtomStage(hint: "Choose an amount, or Other") {
            VStack(alignment: .leading, spacing: 12) {
                Text("Support the newsroom").fontWeight(.semibold)
                DataSegmented(labels: chips, selection: $chip, spread: true)
                HStack(spacing: 6) {
                    Text("$").foregroundStyle(.secondary)
                    TextField("Amount", text: $custom).textFieldStyle(.plain).focused($focused).accessibilityLabel("Custom amount")
                        .onChange(of: custom) { _, v in custom = String(v.filter(\.isNumber).prefix(4)) }
                }
                .font(.subheadline).padding(.horizontal, 10).padding(.vertical, 8)
                .overlay(RoundedRectangle(cornerRadius: 9).stroke(.quaternary, lineWidth: 1.5))
                .opacity(chip == 4 ? 1 : 0).offset(y: chip == 4 ? 0 : -4)
                .frame(height: chip == 4 ? 40 : 0, alignment: .top).clipped()
                .accessibilityHidden(chip != 4)
                Button(action: donate) {
                    ZStack { giveLabel.id(givePhase).motionTransition(.swap()) }
                        .fontWeight(.medium).foregroundStyle(give == .thanks ? AnyShapeStyle(Color.white) : AnyShapeStyle(.background))
                        .frame(maxWidth: .infinity).frame(height: 40).background(giveFill, in: RoundedRectangle(cornerRadius: 10))
                        .animation(reduce ? nil : .motion(.base), value: give)
                }
                .buttonStyle(.plain).disabled(give != .idle)
                ZStack(alignment: .leading) {
                    if give == .thanks && receipt { Text("Receipt sent · thank you for supporting the newsroom").foregroundStyle(.green).motionTransition(.swap()) }
                }
                .font(.caption).frame(maxWidth: .infinity, minHeight: 20, alignment: .leading)
                .animation(reduce ? nil : .motion(.base), value: give == .thanks && receipt)
                Toggle("Receipt", isOn: $receipt).font(.caption).foregroundStyle(.secondary).disabled(give != .idle)
            }
            .padding(16).frame(maxWidth: 320)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            .animation(reduce ? nil : .motion(.base), value: chip == 4)
        }
        .onChange(of: chip) { _, c in if c == 4 { focused = true } else { focused = false } }
        .onDisappear { run?.cancel() }
    }

    private var givePhase: Int { give == .idle ? 0 : give == .busy ? 1 : 2 }
    private var giveFill: Color { give == .thanks ? .green : Color.primary }

    @ViewBuilder private var giveLabel: some View {
        switch give {
        case .idle: HStack(spacing: 4) { Text("Give $"); RollingDigits(amount) }
        case .busy:
            HStack(spacing: 8) {
                TimelineView(.animation(paused: reduce)) { ctx in
                    Image(systemName: "arrow.2.circlepath").rotationEffect(.degrees(reduce ? 0 : (ctx.date.timeIntervalSinceReferenceDate * 420).truncatingRemainder(dividingBy: 360)))
                }
                Text("Processing")
            }
        case .thanks: Label("Thank you", systemImage: "checkmark")
        }
    }

    private func donate() {
        guard give == .idle else { return }
        run = Task {
            withMotion(.base, reduceMotion: reduce) { give = .busy }
            try? await Task.sleep(for: .milliseconds(1100))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { give = .thanks }
            try? await Task.sleep(for: .milliseconds(2400))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { give = .idle }
        }
    }
}
