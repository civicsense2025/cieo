import SwiftUI
import Cieo

public struct PredictionAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "prediction", category: "Forms", name: "Prediction question",
        summary: "A pick presses in, then fills while the odds bar stretches leading-edge-first and the caption swaps to locked. The lock holds as the terminal state.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var locked = -1
    @State private var showOdds = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a side · it locks with a press-and-fill") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Will the launch ship Friday?").font(.headline)
                Text(locked < 0 ? "Tap a side to lock your call" : "Locked · Ship it 68% · settled")
                    .font(.caption).foregroundStyle(.secondary)
                    .transition(.opacity.combined(with: .move(edge: .bottom))).id(locked)
                ForEach(["Ship it", "Slip"], id: \.self) { name in
                    let i = name == "Ship it" ? 0 : 1
                    Button {
                        guard locked < 0 else { return }
                        withAnimation(reduce ? nil : .motion(.base)) { locked = i }
                    } label: {
                        HStack {
                            Text(name).font(.subheadline.weight(.medium))
                            Spacer()
                        }
                        .padding(.horizontal, 12).frame(minHeight: 40, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: 10).fill(Color.accentColor.opacity(locked == i ? 0.22 : 0))
                                .scaleEffect(x: locked == i ? 1 : 0, anchor: .leading)
                                .animation(reduce ? nil : .motion(.base).delay(0.09), value: locked),
                            alignment: .leading
                        )
                        .overlay(RoundedRectangle(cornerRadius: 10).fill(locked == i ? .primary : .quaternary).opacity(0.10).allowsHitTesting(false))
                        .scaleEffect(locked == i ? 0.98 : 1)
                    }
                    .buttonStyle(.plain).disabled(locked >= 0)
                    .accessibilityLabel("\(name)\(locked == i ? ", locked" : "")")
                }
                if showOdds {
                    HStack(spacing: 8) {
                        GeometryReader { g in
                            ZStack(alignment: .leading) {
                                Capsule().fill(Color.primary.opacity(0.12))
                                Capsule().fill(Color.accentColor)
                                    .frame(width: g.size.width * (locked < 0 ? 0.5 : locked == 0 ? 0.68 : 0.32))
                                    .animation(reduce ? nil : .motion(.base).delay(0.09), value: locked)
                            }
                        }
                        .frame(height: 8)
                        Text(locked < 0 ? "68 / 32" : locked == 0 ? "68 / 32" : "32 / 68")
                            .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                    }
                    .transition(.opacity)
                }
                HStack {
                    if locked >= 0 {
                        Button("Unlock") {
                            withAnimation(reduce ? nil : .motion(.snap)) { locked = -1 }
                        }
                        .buttonStyle(.bordered).controlSize(.regular)
                    }
                    Spacer()
                    Toggle("show odds", isOn: $showOdds).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.checkbox)
                }
            }
            .frame(maxWidth: 380)
            .animation(reduce ? nil : .motion(.snap), value: showOdds)
        }
    }
}
