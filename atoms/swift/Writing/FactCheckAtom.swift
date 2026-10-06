import SwiftUI
import Cieo

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

    public var body: some View {
        AtomStage(hint: "Tap a chip to toggle it") {
            VStack(spacing: 16) {
                FlowLayoutShim(spacing: 8) {
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
                            .overlay(Capsule().stroke(chip.verified ? Color.green : Color.primary.opacity(0.2)))
                        }
                        .buttonStyle(.plain).frame(minHeight: 32)
                        .animation(reduce ? nil : .motion(.base), value: chip.verified)
                        .accessibilityLabel("\(chip.name), \(chip.verified ? "verified" : "unverified")")
                    }
                }
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

/// Wraps chips like words in a paragraph until a shared flow layout exists.
private struct FlowLayoutShim: Layout {
    var spacing: CGFloat = 8
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrange(width: proposal.width ?? 360, subviews).size
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let placed = arrange(width: bounds.width, subviews)
        for (i, f) in placed.frames.enumerated() {
            subviews[i].place(at: CGPoint(x: bounds.minX + f.minX, y: bounds.minY + f.minY), proposal: ProposedViewSize(f.size))
        }
    }
    private func arrange(width: CGFloat, _ subviews: Subviews) -> (size: CGSize, frames: [CGRect]) {
        var x = 0.0, y = 0.0, rowH = 0.0, frames: [CGRect] = []
        for s in subviews {
            let size = s.sizeThatFits(.unspecified)
            if x > 0 && x + size.width > width { x = 0; y += rowH + spacing; rowH = 0 }
            frames.append(CGRect(origin: CGPoint(x: x, y: y), size: size))
            x += size.width + spacing; rowH = max(rowH, size.height)
        }
        return (CGSize(width: width, height: y + rowH), frames)
    }
}
