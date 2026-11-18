import SwiftUI
import Cieo
import CieoUI

private struct FactChip: Identifiable {
    let id = UUID()
    let name: String
    var verified = false
}

public struct FactCheckAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "factcheck", category: "Writing", name: "Source fact-check chips",
        summary: "Each source swaps from unverified to verified in 100ms exit-then-enter while the chip width springs to fit. Verify all runs the same change down the row.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var chips = [FactChip(name: "Harbor minutes"), FactChip(name: "City budget PDF"), FactChip(name: "Founder interview")]
    @State private var tweak = true
    public init() {}
    private var verifiedCount: Int { chips.filter(\.verified).count }
    private var requiredCount: Int { tweak ? 2 : 1 }

    public var body: some View {
        AtomStage(hint: "Tap a chip to toggle it") {
            VStack(spacing: 16) {
                FlowStack(spacing: 8) {
                    ForEach($chips) { $chip in
                        Button {
                            withMotion(.base, reduceMotion: reduce) { chip.verified.toggle() }
                        } label: {
                            HStack(spacing: 8) {
                                Circle().fill(chip.verified ? .green : .orange).frame(width: 7, height: 7)
                                Text((chip.verified ? "✓ " : "● ") + chip.name)
                                    .id(chip.verified).motionTransition(.swap())
                            }
                            .font(.system(size: 14))
                            .padding(.horizontal, 14).frame(height: 32)
                            .background(chip.verified ? Color.green.opacity(0.12) : Color.secondary.opacity(0.08))
                            .foregroundStyle(chip.verified ? .green : .primary)
                            .clipShape(Capsule())
                            .overlay(Capsule().fill(chip.verified ? Color.green : Color.primary.opacity(0.2)).opacity(0.10).allowsHitTesting(false))
                        }
                        .buttonStyle(.plain).frame(minHeight: 32)
                        .animation(reduce ? nil : .motion(.base), value: chip.verified)
                        .accessibilityLabel("\(chip.name), \(chip.verified ? "verified" : "unverified")")
                    }
                }
                SwapText(verifiedCount >= requiredCount ? "Ready to file (\(verifiedCount) verified) ✓" : "Verify at least \(requiredCount) source\(requiredCount == 1 ? "" : "s")")
                    .font(.system(size: 12.5))
                    .foregroundStyle(verifiedCount >= requiredCount ? .green : .secondary)
                Button("Verify all") { verifyAll() }.buttonStyle(.bordered).frame(minHeight: 32)
                Toggle("Require two sources", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .frame(maxWidth: 360)
        }
    }

    private func verifyAll() {
        Task {
            for i in chips.indices {
                if Task.isCancelled { return }
                withMotion(.base, reduceMotion: reduce) { chips[i].verified = true }
                try? await Task.sleep(for: .milliseconds(reduce ? 0 : 90))
            }
        }
    }
}
