import SwiftUI
import MotionKit

public struct NumberStepperAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "numstep", category: "Forms", name: "Number stepper",
        summary: "Digits roll up when the value rises and down when it falls, so direction is readable at a glance. Holding a button repeats after 400ms, every 80ms, on the clock.")
    @State private var n = 2
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hold a button to repeat · 1 to 20") {
            VStack(spacing: 8) {
                Text("Guests").font(.footnote).foregroundStyle(.secondary)
                HStack(spacing: 6) {
                    HoldButton(symbol: "minus", label: "Fewer guests", enabled: n > 1) { n = max(1, n - 1) }
                    RollingDigits(n).font(.system(size: 24, weight: .semibold)).frame(minWidth: 44)
                        .accessibilityValue("\(n)")
                    HoldButton(symbol: "plus", label: "More guests", enabled: n < 20) { n = min(20, n + 1) }
                }
                .padding(6).background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
            }
        }
    }

    /// Steps once on press, then repeats after 400 ms every 80 ms until release.
    private struct HoldButton: View {
        let symbol: String
        let label: String
        let enabled: Bool
        let step: () -> Void
        @State private var repeating: Task<Void, Never>?
        var body: some View {
            Image(systemName: symbol).font(.system(size: 16, weight: .medium))
                .frame(width: 36, height: 36)
                .background(RoundedRectangle(cornerRadius: 9).fill(Color.primary.opacity(0.08)))
                .opacity(enabled ? 1 : 0.35)
                .contentShape(Rectangle())
                .gesture(DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        guard repeating == nil else { return }
                        step()
                        repeating = Task {
                            try? await Task.sleep(for: .seconds(0.4))
                            while !Task.isCancelled {
                                step()
                                try? await Task.sleep(for: .seconds(0.08))
                            }
                        }
                    }
                    .onEnded { _ in
                        repeating?.cancel()
                        repeating = nil
                    })
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(label)
                .accessibilityAddTraits(.isButton)
                .accessibilityAction { if enabled { step() } }
        }
    }
}
