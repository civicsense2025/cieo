import SwiftUI
import MotionKit

/// Face parts, each continuous so a mood change can move brows first, then lids, then mouth.
struct AgFace: Equatable {
    var brow = 0.0    // -1 worried, 0 level, 1 raised
    var lid = 0.0     // 0 open, 1 closed
    var mouth = 0.4   // -1 frown, 1 wide smile
    var open = 0.0    // mouth open, 0 to 1
}

enum AgMood: String, CaseIterable {
    case calm, happy, surprised, sleepy, thinking, worried
    var face: AgFace {
        switch self {
        case .calm: AgFace()
        case .happy: AgFace(brow: 0.4, lid: 0.15, mouth: 1, open: 0)
        case .surprised: AgFace(brow: 1, lid: 0, mouth: 0, open: 0.8)
        case .sleepy: AgFace(brow: -0.2, lid: 0.7, mouth: 0, open: 0)
        case .thinking: AgFace(brow: -0.5, lid: 0.1, mouth: -0.2, open: 0)
        case .worried: AgFace(brow: -1, lid: 0, mouth: -0.8, open: 0)
        }
    }
}

struct AgMouth: Shape {
    var curve: Double
    var open: Double
    var animatableData: AnimatablePair<Double, Double> {
        get { .init(curve, open) }
        set { curve = newValue.first; open = newValue.second }
    }
    func path(in r: CGRect) -> Path {
        var p = Path()
        let y = r.midY
        p.move(to: CGPoint(x: r.minX, y: y))
        p.addQuadCurve(to: CGPoint(x: r.maxX, y: y), control: CGPoint(x: r.midX, y: y + curve * r.height))
        if open > 0.05 {
            p.addQuadCurve(to: CGPoint(x: r.minX, y: y), control: CGPoint(x: r.midX, y: y + curve * r.height + open * r.height * 2.4))
            p.closeSubpath()
        }
        return p
    }
}

/// One agent: a square body, two eyes, brows, a mouth and a tilted-equator antenna. Everything is a parameter so callers can spring it.
struct AgentCharacter: View {
    var size: CGFloat = 96
    var face = AgFace()
    var look = CGSize.zero          // -1...1 each way
    var squash = CGSize(width: 1, height: 1)
    var lean = 0.0                  // degrees
    var wash: Color = .green
    var spin = 0.0                  // meridian turn, degrees
    var blink = false

    var body: some View {
        let s = size, ink = Color.primary
        ZStack(alignment: .bottom) {
            Capsule().fill(ink).frame(width: s * 0.03, height: s * 0.14).offset(y: -s * 1.0)
            Ellipse().stroke(ink, lineWidth: max(1, s * 0.03)).frame(width: s * 0.32, height: s * 0.12)
                .rotationEffect(.degrees(-20 + spin)).offset(y: -s * 1.16)
            RoundedRectangle(cornerRadius: s * 0.2).fill(wash.opacity(0.3))
                .overlay(RoundedRectangle(cornerRadius: s * 0.2).strokeBorder(ink, lineWidth: max(1.2, s * 0.035)))
                .frame(width: s, height: s)
                .overlay(faceView(s).offset(x: look.width * s * 0.07, y: look.height * s * 0.05))
        }
        .frame(width: s, height: s * 1.25, alignment: .bottom)
        .scaleEffect(squash, anchor: .bottom)
        .rotationEffect(.degrees(lean), anchor: .bottom)
        .accessibilityHidden(true)
    }

    private func faceView(_ s: CGFloat) -> some View {
        let lid = blink ? 1 : face.lid
        return ZStack {
            ForEach([-1.0, 1.0], id: \.self) { side in
                Circle().fill(Color.primary).frame(width: s * 0.13, height: s * 0.13)
                    .scaleEffect(y: max(0.08, 1 - lid * 0.92)).offset(x: side * s * 0.2, y: -s * 0.08)
                Capsule().fill(Color.primary).frame(width: s * 0.17, height: max(1, s * 0.03))
                    .rotationEffect(.degrees(side * -face.brow * 14)).offset(x: side * s * 0.2, y: -s * (0.22 + face.brow * 0.04))
            }
            AgMouth(curve: face.mouth * 0.5, open: face.open)
                .stroke(Color.primary, style: StrokeStyle(lineWidth: max(1.2, s * 0.03), lineCap: .round))
                .background(AgMouth(curve: face.mouth * 0.5, open: face.open).fill(Color.primary.opacity(face.open > 0.05 ? 0.85 : 0)))
                .frame(width: s * 0.3, height: s * 0.1).offset(y: s * 0.2)
        }
    }
}

/// Blinks and breathes on its own clock. Holds still under Reduce Motion.
struct AgentIdle<Content: View>: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    var phase = 0.0
    @ViewBuilder var content: (_ blink: Bool, _ breathe: CGFloat) -> Content
    var body: some View {
        TimelineView(.animation(paused: reduce)) { ctx in
            let t = ctx.date.timeIntervalSinceReferenceDate + phase
            content(!reduce && t.truncatingRemainder(dividingBy: 3.7) < 0.12, reduce ? 1 : 1 + 0.012 * sin(t * 1.6))
        }
    }
}

extension View {
    /// Moves brows first, then lids, then mouth, 60 ms apart, each on the base spring.
    @MainActor func agStage(_ mood: AgMood, face: Binding<AgFace>, reduce: Bool) {
        let t = mood.face
        withMotion(.base, reduceMotion: reduce) { face.wrappedValue.brow = t.brow }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 60_000_000)
            withMotion(.base, reduceMotion: reduce) { face.wrappedValue.lid = t.lid }
            try? await Task.sleep(nanoseconds: 60_000_000)
            withMotion(.base, reduceMotion: reduce) { face.wrappedValue.mouth = t.mouth; face.wrappedValue.open = t.open }
        }
    }
}
