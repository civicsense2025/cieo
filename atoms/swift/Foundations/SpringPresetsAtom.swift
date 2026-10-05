import SwiftUI
import MotionKit

public struct SpringPresetsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "step", category: "Foundations", name: "Spring presets",
        summary: "Critically damped step responses solved in closed form. No integration, no drift, no overshoot.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var tracks = [34.0, 22, 15, 9].map { Track(0, preset: SpringPreset(w: $0)) }
    private let labels = ["snap · ω34", "base · ω22", "soft · ω15", "lazy · ω9"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap to send all four") {
            TimelineView(.animation(paused: reduce)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                VStack(spacing: 22) {
                    ForEach(0..<4, id: \.self) { i in
                        GeometryReader { g in
                            ZStack(alignment: .topLeading) {
                                Rectangle().fill(.quaternary).frame(height: 1).offset(y: 15)
                                Text(labels[i]).font(.caption).foregroundStyle(.secondary)
                                    .frame(maxWidth: .infinity, alignment: .trailing).offset(y: -18)
                                Circle().fill(.primary).frame(width: 14, height: 14)
                                    .offset(x: tracks[i].value(at: t) * (g.size.width - 14), y: 1)
                            }
                        }
                        .frame(height: 16)
                    }
                }
                .frame(maxWidth: 340)
                .padding(.top, 18)
            }
            .contentShape(Rectangle())
            .onTapGesture { sendAll() }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Four spring presets")
            .accessibilityAddTraits(.isButton)
            .accessibilityAction { sendAll() }
        }
    }

    private func sendAll() {
        let t0 = Date().timeIntervalSinceReferenceDate
        for i in tracks.indices {
            let to = tracks[i].target > 0 ? 0.0 : 1.0
            if reduce { tracks[i].jump(to) } else { tracks[i].set(to, at: t0) }
        }
    }
}
