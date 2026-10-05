import SwiftUI
import MotionKit

public struct SwipeDeckAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-deck", category: "Carousels", name: "Swipe deck",
        summary: "The top card follows the pointer 1:1 and tilts with its offset, toward the half you grabbed. Release projects position plus velocity: past 40% of the card it is thrown off at its own speed, otherwise it settles home without overshoot. The next card rises first and the rest of the stack follows 45 ms apart. Undo brings the last card back from the side it left. Use when every item needs a quick yes or no, such as triage, shortlists or review queues.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var top = 0
    @State private var rests: [Int: CGSize] = [:]
    public init() {}
    private let count = 5

    public var body: some View {
        AtomStage(hint: "Swipe a card away; Undo brings it back") {
            VStack(spacing: 12) {
                GeometryReader { g in
                    ZStack {
                        ForEach(0..<count, id: \.self) { i in
                            card(i, g.size)
                        }
                    }
                    .frame(width: g.size.width, height: g.size.height)
                }
                .frame(height: 200)
                HStack {
                    Button("Undo") { undo() }.disabled(top == 0)
                    Spacer()
                    Text(top >= count ? "All sorted" : "\(count - top) left").font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Button("Skip") { fling(top, 1) }.disabled(top >= count)
                }.buttonStyle(.bordered).controlSize(.small)
            }
        }
    }

    private func undo() {
        guard top > 0 else { return }
        withMotion(.base, reduceMotion: reduce) { top -= 1 }
        rests[top] = .zero          // the card returns from the side it left
    }
    private func fling(_ i: Int, _ dir: Double) {
        rests[i] = CGSize(width: dir * 400, height: 0)
        withMotion(.base, reduceMotion: reduce) { top = i + 1 }
    }

    @ViewBuilder private func card(_ i: Int, _ size: CGSize) -> some View {
        let depth = max(0, i - top)
        let gone = i < top
        PhDrag(preset: .base, enabled: i == top, rest: rests[i] ?? .zero,
               decide: { o, extra in
                   let reach = o.width + extra.width * 0.2
                   return abs(reach) > size.width * 0.4 ? CGSize(width: (reach > 0 ? 1 : -1) * size.width * 1.6, height: 0) : .zero
               },
               onRelease: { to in if to.width != 0 { rests[i] = to; withMotion(.base, reduceMotion: reduce) { top = i + 1 } } },
               content: { o, _ in
            let x = o.width
            phPhoto(i, CGSize(width: size.width * 0.78, height: size.height * 0.9)).clipShape(RoundedRectangle(cornerRadius: 14))
                .rotationEffect(.degrees(x / size.width * 14))
                .offset(x: x)
                .scaleEffect(1 - 0.05 * Double(min(depth, 3)))
                .offset(y: CGFloat(min(depth, 3)) * 8)
                .opacity(gone && abs(x) > size.width * 1.2 ? 0 : 1)
                .animation(reduce ? nil : .motion(.base).delay(Motion.stagger(depth, of: 4, gap: 0.045)), value: depth)
        })
        .zIndex(Double(count - i))
        .accessibilityLabel("Card \(i + 1)")
        .accessibilityHidden(gone)
    }
}
