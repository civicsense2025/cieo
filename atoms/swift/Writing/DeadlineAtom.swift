import SwiftUI
import Cieo

public struct DeadlineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "deadline", category: "Writing", name: "Deadline ticker",
        summary: "The minutes and seconds roll on lazy springs while the plate edges trail 60ms behind. Under ten minutes the tile turns danger. Pause freezes the count in place.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var remaining = 612
    @State private var tweak = true
    @State private var paused = false
    private let total = 612
    public init() {}

    private var danger: Bool { remaining < 600 }
    private var clock: String { String(format: "%02d:%02d", remaining / 60, remaining % 60) }

    public var body: some View {
        AtomStage(hint: "Pauses in place; danger under 10:00") {
            VStack(spacing: 8) {
                Text("Submission closes in").font(.system(size: 12.5)).foregroundStyle(.secondary)
                Text(clock).font(.system(size: 30, weight: .semibold, design: .monospaced)).monospacedDigit()
                    .contentTransition(.numericText())
                    .animation(reduce ? nil : .motion(.lazy), value: remaining)
                GeometryReader { g in
                    let inset = (1 - Double(remaining) / Double(total)) * g.size.width / 2
                    ZStack {
                        Capsule().fill(danger ? Color.red.opacity(0.25) : Color.primary.opacity(0.12))
                        Capsule().fill(danger ? .red : .primary)
                            .padding(.leading, inset).animation(reduce ? nil : .motion(.base), value: remaining)
                            .padding(.trailing, inset).animation(reduce ? nil : .motion(.base).delay(0.06), value: remaining)
                    }
                    .frame(height: 3)
                }
                .frame(height: 3)
                Button(paused ? "Resume" : "Pause") {
                    withMotion(.base, reduceMotion: reduce) { paused.toggle() }
                }
                .buttonStyle(.bordered).frame(minHeight: 32)
                Toggle("Warn under 10:00", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }.frame(minWidth: 238)
            .padding(14)
            .background(danger ? Color.red.opacity(0.08) : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(danger ? Color.red : Color.primary.opacity(0.2)))
            .animation(reduce ? nil : .motion(.base), value: danger)
        }
        .onReceive(Timer.publish(every: 1, on: .main, in: .common).autoconnect()) { _ in
            guard !paused, remaining > 0 else { return }
            withMotion(.lazy, reduceMotion: reduce) { remaining -= 1 }
        }
    }
}
