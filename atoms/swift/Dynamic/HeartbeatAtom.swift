import SwiftUI
import Cieo

public struct HeartbeatAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "heartbeat", category: "Dynamic", name: "Heartbeat status",
        summary: "The dot breathes on a slow clock while live. As health degrades the dot morphs warning to danger and the label swaps with it. The pass ends settled on live.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let states = [(name: "Live", note: "All systems normal · settled", color: Color.green),
                          (name: "Degraded", note: "p99 up 2× · watching", color: Color.orange),
                          (name: "Outage", note: "Failing over · on it", color: Color.red)]
    @State private var pulse = Track(0, preset: .base)
    @State private var k = 0
    @State private var loop = false
    private let cycler = Timer.publish(every: 2.2, on: .main, in: .common).autoconnect()
    public init() {}

    public var body: some View {
        AtomStage(hint: "Slow clock while live · morphs as it degrades") {
            TimelineView(.motion(pulse)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let breathe = reduce ? 1.0 : 1 + 0.06 * sin(t * 2 * .pi / 2.4)
                let glow = reduce ? 1.0 : 0.72 + 0.28 * (0.5 + 0.5 * sin(t * 2 * .pi / 2.4))
                VStack(alignment: .leading, spacing: 8) {
                    Text("API status").font(.headline)
                    HStack(spacing: 10) {
                        Circle().fill(states[k].color)
                            .frame(width: 12, height: 12)
                            .scaleEffect(breathe).opacity(glow)
                            .frame(width: 32, height: 32)
                            .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.06)))
                            .animation(reduce ? nil : .motion(.soft), value: k)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(states[k].name).font(.subheadline.weight(.semibold))
                            Text(states[k].note).font(.caption).foregroundStyle(.secondary)
                        }
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                        .id(k)
                    }
                    HStack {
                        Button("Replay") {
                            withAnimation(reduce ? nil : .motion(.soft)) { k = 0 }
                        }
                        .buttonStyle(.bordered).controlSize(.regular)
                        Spacer()
                        Toggle("loop", isOn: $loop).font(.caption).foregroundStyle(.secondary)
                            .toggleStyle(.checkbox)
                    }
                }
                .frame(maxWidth: 380)
            }
        }
        .onReceive(cycler) { _ in
            if k < 2 { withAnimation(reduce ? nil : .motion(.soft)) { k += 1 } }
            else if loop { withAnimation(reduce ? nil : .motion(.soft)) { k = 0 } }
        }
    }
}
