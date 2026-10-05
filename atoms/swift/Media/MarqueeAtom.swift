import SwiftUI
import MotionKit

public struct MarqueeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "marquee", category: "Media", name: "Marquee",
        summary: "Offset is the closed-form integral of a speed spring, so slowing on hover is smooth and the position is still a pure function of time.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let words = ["Field Notes", "North Studio", "The Ledger", "Loop Press", "Common Room", "Paper Trail"]
    private let w = SpringPreset.soft.w
    @State private var base = 1.0
    @State private var offset = 0.0
    @State private var events: [(t: Double, d: Double)] = []
    @State private var half: CGFloat = 1
    public init() {}

    /// Integral of the speed spring's response: R(T) = 2/w (1 - e^-wT) - T e^-wT.
    private func integral(_ T: Double) -> Double { (2 / w) * (1 - exp(-w * T)) - T * exp(-w * T) }

    private func position(_ t: Double) -> Double {
        events.reduce(base * t + offset) { x, e in t > e.t ? x + e.d * ((t - e.t) - integral(t - e.t)) : x }
    }

    private func setSpeed(_ v: Double) {
        guard !reduce else { return }
        let now = DataMotion.now
        for e in events where exp(-w * (now - e.t)) < 1e-6 { base += e.d; offset += e.d * (-e.t - 2 / w) }
        events.removeAll { exp(-w * (now - $0.t)) < 1e-6 }
        let cur = base + events.reduce(0) { $0 + $1.d }
        if v != cur { events.append((now, v - cur)) }
    }

    private var strip: some View {
        HStack(spacing: 0) {
            ForEach(words.indices, id: \.self) { i in
                Text(words[i]).font(.title3.weight(.semibold)).foregroundStyle(.secondary).padding(.horizontal, 22)
                Text("·").font(.title3).foregroundStyle(.tertiary)
            }
        }
        .fixedSize()
    }

    public var body: some View {
        AtomStage(hint: "Hover or press to slow it down") {
            TimelineView(.animation(paused: reduce)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                HStack(spacing: 0) {
                    strip.background(GeometryReader { g in Color.clear.onAppear { half = g.size.width } })
                    strip
                }
                .offset(x: -(reduce ? 0 : (position(t) * 60).truncatingRemainder(dividingBy: Double(half))))
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .clipped()
            .mask(LinearGradient(stops: [.init(color: .clear, location: 0), .init(color: .black, location: 0.12),
                                         .init(color: .black, location: 0.88), .init(color: .clear, location: 1)], startPoint: .leading, endPoint: .trailing))
            .contentShape(Rectangle())
            .onHover { setSpeed($0 ? 0.15 : 1) }
            .gesture(DragGesture(minimumDistance: 0).onChanged { _ in setSpeed(0.15) }.onEnded { _ in setSpeed(1) })
            .accessibilityLabel("Studios: \(words.joined(separator: ", "))")
        }
    }
}
