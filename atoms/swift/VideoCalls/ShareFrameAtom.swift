import SwiftUI
import Cieo

public struct ShareFrameAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "shareframe", category: "Video calls", name: "Screen-share frame",
        summary: "The share frame scales in on a lazy ease while the filmstrip highlight trails its edges 60 ms behind. The presenter label swaps; stopping lands on an empty terminal.")

    private let presenters = [("Ava", "Figma"), ("Theo", "Slides")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var current = -1
    @State private var gentle = true
    @State private var ended = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Share, switch presenter, then stop") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Screen-share frame").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("The frame eases in lazy; the strip trails behind.").font(.system(size: 12)).foregroundStyle(.secondary)
                ZStack {
                    RoundedRectangle(cornerRadius: 12).fill(Color(white: 0.06))
                    SwapText(current < 0 ? "No one is sharing" : "\(presenters[current].0)'s screen — \(presenters[current].1)")
                        .font(.system(size: 13)).foregroundStyle(.white)
                }
                .frame(height: 150)
                .opacity(current < 0 ? 0 : 1)
                .scaleEffect(current < 0 ? 0.96 : 1)
                .animation(reduce ? nil : .motion(gentle ? .lazy : .soft), value: current)
                HStack(spacing: 8) {
                    ForEach(0..<presenters.count, id: \.self) { i in
                        Text(presenters[i].0).font(.system(size: 12))
                            .frame(width: 88, height: 52)
                            .background(RoundedRectangle(cornerRadius: 8).fill(.quaternary))
                            .overlay {
                                RoundedRectangle(cornerRadius: 8)
                                    .strokeBorder(Color.green, lineWidth: 2.5)
                                    .opacity(current == i ? 1 : 0)
                            }
                            .offset(x: 0)
                    }
                }
                .animation(reduce ? nil : .motion(.base).delay(Motion.lag), value: current)
                HStack(spacing: 8) {
                    Button("Share Ava") {
                        withMotion(gentle ? .lazy : .soft, reduceMotion: reduce) { current = 0; ended = false }
                    }
                    Button("Theo") {
                        withMotion(gentle ? .lazy : .soft, reduceMotion: reduce) { current = 1; ended = false }
                    }
                    Button("Stop") {
                        withMotion(.base, reduceMotion: reduce) { current = -1; ended = true }
                    }
                    .disabled(current < 0)
                }
                .buttonStyle(.bordered).controlSize(.small)
                if ended {
                    Text("∅ Share ended").font(.system(size: 12.5)).foregroundStyle(.secondary)
                        .motionTransition(.swap(drift: 0))
                }
                Toggle("Gentle ease", isOn: $gentle)
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .padding(14)
        }
    }
}
