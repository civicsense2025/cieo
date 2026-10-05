import SwiftUI
import MotionKit

public struct StoriesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-story", category: "Carousels", name: "Stories with hold to pause",
        summary: "Segments fill from the clock. Holding anywhere pauses at once and, after 300 ms, fades the chrome so the photo can be read. A tap on the left third goes back, anywhere else goes forward, with an exit-then-enter swap; each photo drifts slowly while its segment runs. Inspired by Instagram stories; changed: pausing, holding and time spent off screen are all subtracted from one start time, so the bar never jumps. Use when short, ordered moments should play hands-free but stay under the viewer’s control.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var index = 0
    @State private var base = 0.0          // seconds already spent on this story
    @State private var anchor = Date()
    @State private var held = false
    @State private var chromeHidden = false
    @State private var down: Date?
    public init() {}
    private let count = 4
    private let length = 4.0

    private func elapsed(_ date: Date) -> Double { held ? base : base + date.timeIntervalSince(anchor) }

    public var body: some View {
        AtomStage(hint: "Tap left to go back, right to go on; hold to pause") {
            GeometryReader { g in
                TimelineView(.animation(paused: held)) { ctx in
                    let t = min(1, elapsed(ctx.date) / length)
                    ZStack {
                        ZStack {
                            phPhoto(index, CGSize(width: g.size.width * 1.12, height: g.size.height * 1.12))
                                .offset(x: reduce ? 0 : CGFloat(t - 0.5) * 14)
                                .frame(width: g.size.width, height: g.size.height).clipped()
                                .id(index).transition(.motionSwap(drift: 0))
                        }
                        VStack {
                            HStack(spacing: 4) {
                                ForEach(0..<count, id: \.self) { i in
                                    Capsule().fill(.white.opacity(0.35)).frame(height: 3)
                                        .overlay(alignment: .leading) {
                                            GeometryReader { b in Capsule().fill(.white).frame(width: b.size.width * (i < index ? 1 : (i == index ? t : 0))) }
                                        }
                                }
                            }
                            Spacer()
                        }.padding(8).opacity(chromeHidden ? 0 : 1).motion(.base, value: chromeHidden)
                    }
                    .onChange(of: t >= 1) { _, done in if done { advance(from: index, 1) } }
                }
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .contentShape(Rectangle())
                .gesture(DragGesture(minimumDistance: 0)
                    .onChanged { _ in if down == nil { down = Date(); pause() } }
                    .onEnded { v in
                        let short = Date().timeIntervalSince(down ?? Date()) < 0.3 && abs(v.translation.width) < 10
                        down = nil; resume()
                        if short { advance(from: index, v.location.x < g.size.width / 3 ? -1 : 1) }
                    })
                .task(id: held) {
                    if held { try? await Task.sleep(nanoseconds: 300_000_000); chromeHidden = held } else { chromeHidden = false }
                }
            }
            .frame(height: 220)
            .accessibilityLabel("Story \(index + 1) of \(count)")
        }
    }

    // pausing, holding and time spent away are all subtracted from one clock, so the bar never jumps
    private func pause() { base = elapsed(Date()); held = true }
    private func resume() { anchor = Date(); held = false }
    private func advance(from i: Int, _ d: Int) {
        guard i == index else { return }
        withMotion(.base, reduceMotion: reduce) { index = (index + d + count) % count }
        base = 0; anchor = Date()
    }
}
