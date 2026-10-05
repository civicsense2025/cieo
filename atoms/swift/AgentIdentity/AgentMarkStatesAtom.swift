import SwiftUI
import MotionKit

public struct AgentMarkStatesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentmarkstates", category: "Agent identity", name: "Agent mark states",
        summary: "The Meridian mark carried through seven agent states. Thinking turns the meridian at a constant speed; Browsing sends a square marker along the equator while the meridian leans toward it; Commenting grows Velo’s comment tail so the mark doubles as a pin; Waiting stands the meridian upright and opens the invitation corners; Done and Error morph the equator’s five points into a check or an X. Every change is a critically damped spring, and the same drawing runs at brand size, 32, 24 and 16px and inside the presence chip.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum State_: String, CaseIterable { case thinking = "Thinking", browsing = "Browsing", commenting = "Commenting", waiting = "Waiting", done = "Done", error = "Error" }
    @State private var state = State_.thinking
    @State private var marker = 0.0
    @State private var lean = 0.0
    @State private var tail = 0.0
    @State private var upright = 0.0
    @State private var corners = 0.0
    @State private var check = 0.0
    @State private var cross = 0.0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a state; every change is a critically damped spring") {
            VStack(spacing: 10) {
                Picker("State", selection: $state) { ForEach(State_.allCases, id: \.self) { Text($0.rawValue).tag($0) } }.pickerStyle(.menu)
                    .onChange(of: state) { _, s in apply(s) }
                HStack(alignment: .bottom, spacing: 16) {
                    ForEach([96, 32, 24, 16], id: \.self) { s in mark(CGFloat(s)) }
                    HStack(spacing: 4) { mark(16); Text("Claude").font(.caption); AgentTag() }.padding(6).background(.quaternary, in: Capsule())
                }
                Text(state.rawValue).font(.caption).foregroundStyle(.secondary)
            }
        }
        .task(id: state) {
            guard state == .browsing else { return }
            while !Task.isCancelled && state == .browsing {
                withMotion(.soft, reduceMotion: reduce) { marker = marker < 0.5 ? 1 : 0 }
                try? await Task.sleep(nanoseconds: 1_100_000_000)
            }
        }
    }

    private func mark(_ s: CGFloat) -> some View {
        TimelineView(.animation(paused: reduce || state != .thinking)) { ctx in
            let spin = state == .thinking && !reduce ? ctx.date.timeIntervalSinceReferenceDate * 120 : 0
            let lw = max(1.2, s * 0.06), ink = Color.primary
            let rot = -20 + spin + lean * 14 - upright * (-20 + 90 - 0)
            ZStack {
                RoundedRectangle(cornerRadius: s * 0.22).fill(Color.green.opacity(0.18))
                Circle().stroke(ink, lineWidth: lw).padding(s * 0.2)
                Ellipse().stroke(ink, lineWidth: lw).frame(width: s * 0.7, height: s * 0.26).rotationEffect(.degrees(rot)).opacity(1 - max(check, cross))
                Rectangle().fill(ink).frame(width: s * 0.1, height: s * 0.1)
                    .offset(x: CGFloat(cos((marker - 0.5) * .pi)) * s * 0.3 * (marker < 0.5 ? 1 : 1) - s * 0.0, y: CGFloat(sin((marker - 0.5) * .pi)) * s * 0.06)
                    .opacity(state == .browsing ? 1 : 0)
                Path { p in p.move(to: CGPoint(x: s * 0.3, y: s * 0.52)); p.addLine(to: CGPoint(x: s * 0.44, y: s * 0.66)); p.addLine(to: CGPoint(x: s * 0.72, y: s * 0.36)) }
                    .trim(from: 0, to: check).stroke(ink, style: StrokeStyle(lineWidth: lw * 1.4, lineCap: .round, lineJoin: .round))
                Path { p in p.move(to: CGPoint(x: s * 0.32, y: s * 0.32)); p.addLine(to: CGPoint(x: s * 0.68, y: s * 0.68)); p.move(to: CGPoint(x: s * 0.68, y: s * 0.32)); p.addLine(to: CGPoint(x: s * 0.32, y: s * 0.68)) }
                    .trim(from: 0, to: cross).stroke(ink, style: StrokeStyle(lineWidth: lw * 1.4, lineCap: .round))
                Path { p in p.move(to: CGPoint(x: s * 0.26, y: s * 0.78)); p.addLine(to: CGPoint(x: s * 0.2, y: s * 0.92)); p.addLine(to: CGPoint(x: s * 0.4, y: s * 0.82)) }
                    .fill(ink).scaleEffect(tail, anchor: .topTrailing).opacity(tail)
                ForEach(0..<4, id: \.self) { c in
                    Path { p in p.move(to: CGPoint(x: 0, y: s * 0.1)); p.addLine(to: .zero); p.addLine(to: CGPoint(x: s * 0.1, y: 0)) }
                        .stroke(ink, style: StrokeStyle(lineWidth: lw, lineCap: .round)).frame(width: s * 0.1, height: s * 0.1)
                        .rotationEffect(.degrees(Double(c) * 90)).offset(x: c == 0 || c == 3 ? -s * 0.38 : s * 0.38, y: c < 2 ? -s * 0.38 : s * 0.38).opacity(corners)
                }
            }
            .frame(width: s, height: s)
        }
        .accessibilityLabel("Agent mark, \(state.rawValue)")
    }

    private func apply(_ s: State_) {
        withMotion(.base, reduceMotion: reduce) {
            lean = s == .browsing ? 1 : 0; tail = s == .commenting ? 1 : 0; upright = s == .waiting ? 1 : 0; corners = s == .waiting ? 1 : 0
            check = s == .done ? 1 : 0; cross = s == .error ? 1 : 0
            if s != .browsing { marker = 0 }
        }
    }
}
