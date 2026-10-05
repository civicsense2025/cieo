import SwiftUI
import Cieo

public struct PeekShelfAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-peek", category: "Carousels", name: "Peek and pull shelf",
        summary: "Cards align to the left margin and the next one peeks in, so a phone screen always shows there is more. Dragging past the last card rubber-bands into a ring that fills with the stretch; past the mark the label swaps to Release, and letting go opens the full list as a sheet while the shelf settles back. Inspired by the App Store and Airbnb shelves; changed: the “see all” target lives inside the overscroll instead of a separate button. Use when a horizontal shelf sits inside a vertically scrolling phone screen.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var showAll = false
    public init() {}
    private let count = 5

    public var body: some View {
        AtomStage(hint: "Pull past the last card, then let go to see all") {
            ZStack {
                PhPager(count: count, itemFraction: 0.62, onRelease: { raw in
                    if raw - Double(count - 1) > 0.35 { showAll = true }
                    return 0
                }) { pos, size, item in
                    let pull = phClamp((pos - Double(count - 1)) / 0.12)
                    ZStack {
                        ForEach(0..<count, id: \.self) { i in
                            phPhoto(i, CGSize(width: item - 10, height: size.height * 0.85)).clipShape(RoundedRectangle(cornerRadius: 12))
                                .offset(x: CGFloat(Double(i) - pos) * item - size.width * 0.5 + item / 2 + 8)
                        }
                        // the "see all" target lives inside the overscroll
                        VStack(spacing: 4) {
                            ZStack {
                                Circle().stroke(.quaternary, lineWidth: 3)
                                Circle().trim(from: 0, to: pull).stroke(Color.accentColor, style: StrokeStyle(lineWidth: 3, lineCap: .round)).rotationEffect(.degrees(-90))
                            }.frame(width: 28, height: 28)
                            ZStack {
                                Text("See all").opacity(pull < 1 ? 1 : 0)
                                Text("Release").opacity(pull >= 1 ? 1 : 0)
                            }.font(.caption2).motion(.snap, value: pull >= 1)
                        }
                        .offset(x: CGFloat(Double(count) - pos) * item - size.width * 0.5 + item / 2 + 8 + 20)
                        .opacity(pull > 0 ? 1 : 0)
                    }
                    .frame(width: size.width, height: size.height).clipped()
                }
                .frame(height: 150)
                if showAll {
                    VStack(spacing: 8) {
                        Text("All \(count) photos").font(.subheadline.weight(.semibold))
                        HStack { ForEach(0..<count, id: \.self) { phPhoto($0, CGSize(width: 40, height: 40)).clipShape(RoundedRectangle(cornerRadius: 6)) } }
                        Button("Done") { withMotion(.base, reduceMotion: reduce) { showAll = false } }.buttonStyle(.bordered).controlSize(.small)
                    }
                    .padding(14).background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
                    .motionTransition(.presence)
                }
            }
            .motion(.base, value: showAll)
        }
    }
}
