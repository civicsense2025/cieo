import SwiftUI
import Cieo

public struct ValidationShakeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "validationshake", category: "Foundations", name: "Validation shake",
        summary: "Failed validation shakes the field, rings it in danger and swaps in the message. Distance is the only dial.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var email = "ada@"
    @State private var invalid = false
    @State private var distance = 8.0
    @State private var shakeT = -9.0
    public init() {}

    public var body: some View {
        AtomStage(hint: "The danger ring and message persist") {
            VStack(spacing: 16) {
                TimelineView(.animation(paused: reduce)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    TextField("Email", text: $email)
                        .softFieldSurface().frame(minHeight: 40)
                        .overlay(RoundedRectangle(cornerRadius: 8).fill(invalid ? .red : .clear).opacity(0.10).allowsHitTesting(false))
                        .offset(x: shakeOffset(at: t))
                }
                .frame(height: 44)
                ZStack {
                    if invalid {
                        Text("Enter a valid email address")
                            .font(.caption).foregroundStyle(.red)
                            .motionTransition(.swap(drift: 4))
                    }
                }
                .frame(height: 20)
                Button("Validate") { validate() }
                    .buttonStyle(.borderedProminent).frame(maxWidth: .infinity, minHeight: 36)
                HStack(spacing: 8) {
                    Text("Distance").font(.caption).foregroundStyle(.secondary)
                    Slider(value: $distance, in: 4...16, step: 1).frame(minHeight: 32)
                    Text("\(Int(distance))px").font(.system(size: 13, design: .monospaced))
                }
            }
            .frame(maxWidth: 340)
        }
    }

    private func shakeOffset(at t: Double) -> Double {
        guard invalid, !reduce else { return 0 }
        let dt = t - shakeT
        guard dt >= 0 else { return 0 }
        return distance * exp(-15 * dt) * sin(dt * 30)
    }

    private func validate() {
        invalid = true
        shakeT = Date().timeIntervalSinceReferenceDate
    }
}
