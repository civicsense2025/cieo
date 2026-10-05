import SwiftUI
import MotionKit

public struct AgentCursorAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentcursor", category: "Agent activity", name: "Agent cursor",
        summary: "The agent pointer glides to each target on a critically damped spring, an outline appears when it lands, and a quiet press-scale marks the click. In Browse mode the target presses; in Comment mode the click is blocked and a square agent pin drops instead, as in Velo. Your own pointer is the round chip, 1:1 while you move it. Click the page to send the agent there.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var frames: [String: CGRect] = [:]
    @State private var cursor = CGPoint(x: 20, y: 20)
    @State private var target: String?
    @State private var pressed = false
    @State private var browse = true
    @State private var paused = false
    @State private var actions = 0
    @State private var pins: [CGPoint] = []
    @State private var you: CGPoint?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap the page to send the agent there") {
            VStack(spacing: 8) {
                HStack {
                    Picker("Mode", selection: $browse) { Text("Browse").tag(true); Text("Comment").tag(false) }.pickerStyle(.segmented).frame(maxWidth: 190)
                    Toggle("Pause", isOn: $paused).toggleStyle(.button)
                    Spacer()
                    Text("\(actions) of 200 actions").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                }
                ZStack(alignment: .topLeading) {
                    AgMockPage().contentShape(Rectangle())
                        .onTapGesture { send(to: $0) }
                    if let t = target, let f = frames[t] { AgFrameRing(frame: f) }
                    ForEach(pins.indices, id: \.self) { AgPinMark(label: "\(pins[$0] == .zero ? 0 : $0 + 1)").position(pins[$0]).transition(.scale.combined(with: .opacity)) }
                    AgCursor(agent: true, pressed: pressed).position(x: cursor.x + 7, y: cursor.y + 9)
                    if let y = you { Circle().fill(Color.accentColor).frame(width: 12, height: 12).overlay(Text("You").font(.system(size: 7)).foregroundStyle(.white)).position(y).allowsHitTesting(false) }
                }
                .agFrames($frames)
                .onContinuousHover { phase in if case .active(let p) = phase { you = p } else { you = nil } }
                .animation(reduce ? nil : .motion(.base), value: pins.count)
            }
            .frame(maxWidth: 360)
        }
    }

    private func send(to p: CGPoint) {
        guard !paused else { return }
        let hit = frames.first { $0.value.insetBy(dx: -6, dy: -6).contains(p) }
        let dest = hit.map { CGPoint(x: $0.value.midX, y: $0.value.midY) } ?? p
        withMotion(.base, reduceMotion: reduce) { cursor = dest; target = nil }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 300_000_000)
            guard !paused else { return }
            actions += 1
            if browse {
                withMotion(.base, reduceMotion: reduce) { target = hit?.key }
                withMotion(.snap, reduceMotion: reduce) { pressed = true }
                try? await Task.sleep(nanoseconds: 120_000_000)
                withMotion(.snap, reduceMotion: reduce) { pressed = false }
            } else {
                withMotion(.base, reduceMotion: reduce) { pins.append(CGPoint(x: dest.x + 10, y: dest.y - 10)) }
            }
        }
    }
}
