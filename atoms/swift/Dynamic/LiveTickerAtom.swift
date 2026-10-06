import SwiftUI
import Cieo

public struct LiveTickerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "liveticker", category: "Dynamic", name: "Live value ticker",
        summary: "Changed digits roll toward the new value while an up or down tint cross-fades in and drains away. Every slot keeps its width, so the row never shifts.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var value = 4281
    @State private var delta = 0
    @State private var heat = 0.0
    @State private var paused = false
    @State private var auto = true
    private let timer = Timer.publish(every: 1.1, on: .main, in: .common).autoconnect()
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pause to hold a terminal state") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Portfolio value").font(.headline)
                    Spacer()
                    HStack(spacing: 6) {
                        Circle().fill(paused ? Color.gray : Color.green).frame(width: 8, height: 8)
                        Text(paused ? "Paused" : "Live").font(.caption)
                    }
                }
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    RollingDigits(value).font(.system(size: 22, weight: .semibold)).monospacedDigit()
                    Text((delta >= 0 ? "+" : "−") + "$\(abs(delta))")
                        .font(.subheadline.weight(.semibold)).monospacedDigit()
                }
                .foregroundStyle(heat > 0.05 ? .green : heat < -0.05 ? .red : .primary)
                .animation(reduce ? nil : .motion(.soft), value: heat)
                Text("Ticks on the clock · slots keep width so the row never shifts")
                    .font(.caption).foregroundStyle(.secondary)
                HStack {
                    Button(paused ? "Resume" : "Pause") { paused.toggle() }
                        .buttonStyle(.bordered).controlSize(.regular)
                    Spacer()
                    Toggle("auto-tick", isOn: $auto).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.checkbox)
                }
            }
            .frame(maxWidth: 420)
        }
        .onReceive(timer) { _ in
            guard auto, !paused else { return }
            let step = Int.random(in: 1...24)
            let dir = Bool.random() ? 1 : -1
            delta = dir * step
            value = min(9999, max(1000, value + delta))
            heat = Double(dir)
            if !reduce {
                withAnimation(.motion(.lazy).delay(0.7)) { heat = 0 }
            } else { heat = 0 }
        }
    }
}
