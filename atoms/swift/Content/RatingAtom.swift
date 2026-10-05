import SwiftUI
import Cieo

public struct RatingAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "rating", category: "Content", name: "Rating",
        summary: "While the pointer is over it, the fill follows the cursor exactly. On leave it settles back to the saved value.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var saved = 3.5
    @State private var shown = 3.5
    @State private var hovering = false
    private let width: CGFloat = 5 * 30 + 4 * 4
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover to preview, tap to set") {
            VStack(spacing: 12) {
                ZStack(alignment: .leading) {
                    stars.foregroundStyle(.quaternary)
                    stars.foregroundStyle(.primary)
                        .mask(alignment: .leading) { Rectangle().frame(width: width * shown / 5) }
                }
                .frame(width: width)
                .contentShape(Rectangle())
                .onContinuousHover { phase in
                    switch phase {
                    case .active(let p):
                        hovering = true
                        follow(p.x)
                    case .ended:
                        hovering = false
                        settle()
                    }
                }
                .gesture(DragGesture(minimumDistance: 0)
                    .onChanged { follow($0.location.x) }
                    .onEnded { v in
                        saved = max(0.5, (fraction(v.location.x) * 5 * 2).rounded() / 2)
                        if !hovering { settle() }
                    })
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("Rating")
                .accessibilityValue("\(saved.formatted()) of 5")
                .accessibilityAdjustableAction { dir in
                    saved = dir == .increment ? min(5, saved + 0.5) : max(0.5, saved - 0.5)
                    settle()
                }
                Text("\(saved.formatted()) of 5").font(.footnote.monospacedDigit()).foregroundStyle(.secondary)
            }
        }
    }

    private var stars: some View {
        HStack(spacing: 4) {
            ForEach(0..<5, id: \.self) { _ in
                Image(systemName: "star.fill").resizable().scaledToFit().frame(width: 30, height: 30)
            }
        }
        .accessibilityHidden(true)
    }

    private func fraction(_ x: CGFloat) -> Double { min(1, max(0, Double(x / width))) }

    /// The fill follows the pointer exactly, with no spring in between.
    private func follow(_ x: CGFloat) {
        var t = Transaction()
        t.disablesAnimations = true
        withTransaction(t) { shown = fraction(x) * 5 }
    }

    private func settle() {
        withMotion(.base, reduceMotion: reduce) { shown = saved }
    }
}
