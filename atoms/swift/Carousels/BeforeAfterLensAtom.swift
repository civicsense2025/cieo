import SwiftUI
import MotionKit

public struct BeforeAfterLensAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-compare", category: "Carousels", name: "Before and after lens",
        summary: "The divider tracks the pointer exactly; a tap on the photo glides it to the tap and then tracks 1:1, and a fast release carries it a little further without overshoot. While held, the knob opens into a 2.25× lens centred on the seam, so both lights can be compared at the same pixel; on touch the lens floats above the finger. It is a real slider: arrows, Shift, Page keys, Home and End, and Enter or Magnify keep the lens open. Inspired by Juxtapose and the iOS text loupe. Use when two aligned images differ in detail, such as edits, relights, or before and after.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var clock = PhClock(0.5, .snap)
    @State private var live: Double?
    @State private var held = false
    @State private var idle = true
    @State private var key = 0
    public init() {}

    private func layers(_ f: Double, _ s: CGSize) -> some View {
        ZStack {
            phPhoto(0, s, golden: 0)
            phPhoto(0, s, golden: 1).mask(alignment: .trailing) { Rectangle().frame(width: s.width * (1 - f)) }
        }
    }

    public var body: some View {
        AtomStage(hint: "Drag or tap the photo; hold to open the lens") {
            GeometryReader { g in
                TimelineView(.animation(paused: idle && live == nil)) { _ in
                    let f = live ?? clock.value
                    ZStack {
                        layers(f, g.size)
                        Rectangle().fill(.white).frame(width: 2).position(x: g.size.width * f, y: g.size.height / 2)
                        Circle().fill(.white).frame(width: 26, height: 26).shadow(radius: 3).position(x: g.size.width * f, y: g.size.height / 2)
                        // while held the knob opens into a 2.25x lens centred on the seam
                        layers(f, g.size).scaleEffect(2.25, anchor: UnitPoint(x: f, y: 0.5))
                            .mask(phCircle(CGPoint(x: g.size.width * f, y: g.size.height / 2), 44, g.size))
                            .overlay(Circle().stroke(.white, lineWidth: 2).frame(width: 88, height: 88).position(x: g.size.width * f, y: g.size.height / 2))
                            .scaleEffect(held ? 1 : 0.2, anchor: UnitPoint(x: f, y: 0.5)).opacity(held ? 1 : 0)
                            .motion(.snap, value: held)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .contentShape(Rectangle())
                .gesture(DragGesture(minimumDistance: 0)
                    .onChanged { v in live = phClamp(Double(v.location.x / g.size.width)); held = true }
                    .onEnded { v in
                        let raw = live ?? clock.value
                        let carry = Double((v.predictedEndLocation.x - v.location.x) / g.size.width)
                        clock.release(from: raw, velocity: carry * 2.5, to: phClamp(raw + carry * 0.5), reduce: reduce)
                        live = nil; held = false; key += 1
                    })
                .task(id: key) {
                    idle = false
                    try? await Task.sleep(nanoseconds: 700_000_000)
                    idle = true
                }
                .accessibilityElement()
                .accessibilityLabel("Before and after divider")
                .accessibilityValue("\(Int(clock.value * 100)) percent")
                .accessibilityAdjustableAction { d in
                    clock.release(from: clock.value, velocity: 0, to: phClamp(clock.track.target + (d == .increment ? 0.1 : -0.1)), reduce: reduce); key += 1
                }
            }
            .frame(height: 200)
        }
    }
}
