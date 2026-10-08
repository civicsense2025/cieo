import Combine
import SwiftUI
import Cieo

public struct EmbargoAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "embargo", category: "Writing", name: "Embargo countdown",
        summary: "Only the digits that change roll each second. At zero the count lifts into a Live pill on a soft spring. Reset puts the count back.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var remaining = 8
    @State private var tweak = true
    @State private var lift: CGFloat = 0
    private let total = 8
    public init() {}

    private var live: Bool { remaining <= 0 }

    public var body: some View {
        AtomStage(hint: "Only changing digits roll") {
            VStack(spacing: 8) {
                ZStack {
                    if live {
                        Label("Live · embargo lifted", systemImage: "checkmark.circle.fill")
                            .fontWeight(.semibold).foregroundStyle(.green)
                    } else {
                        HStack(spacing: 8) {
                            Text("Lifts in").font(.system(size: 12.5)).foregroundStyle(.secondary)
                            Text(String(format: "%02d", remaining)).font(.system(size: 26, weight: .semibold, design: .monospaced)).monospacedDigit()
                                .contentTransition(.numericText())
                                .animation(reduce ? nil : .motion(.lazy), value: remaining)
                            Text("sec").font(.system(size: 12.5)).foregroundStyle(.secondary)
                        }
                    }
                }
                .id(live).motionTransition(.swap())
                .animation(reduce ? nil : .motion(.soft), value: live)
                .offset(y: lift)
                .frame(width: 280, height: 58)
                .background(live ? Color.green.opacity(0.1) : Color.clear)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).fill(live ? Color.green : Color.primary.opacity(0.2)).opacity(0.10).allowsHitTesting(false))
                .animation(reduce ? nil : .motion(.base), value: live)
                Button("Reset") {
                    withMotion(.base, reduceMotion: reduce) { remaining = total; lift = 0 }
                }
                .buttonStyle(.bordered).frame(minHeight: 32)
                Toggle("Auto-lift at zero", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
        }
        .onReceive(Timer.publish(every: 1, on: .main, in: .common).autoconnect()) { _ in
            guard remaining > 0 else { return }
            withMotion(.lazy, reduceMotion: reduce) { remaining -= 1 }
            if remaining == 0, !reduce {
                withMotion(.soft, reduceMotion: reduce) { lift = -10 }
                Task {
                    try? await Task.sleep(for: .milliseconds(140))
                    withMotion(.soft, reduceMotion: reduce) { lift = 0 }
                }
            }
        }
    }
}
