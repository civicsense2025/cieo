import SwiftUI
import Cieo

public struct InfiniteLoopAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-loop", category: "Carousels", name: "Infinite loop",
        summary: "Each slide is placed modulo the loop length from one unbounded position, so the track never resets, velocity carries across the seam and a flick can be caught anywhere. Across the seam the dot indicator drains out of the last slot while it fills the first, so it never jumps back across the row. Autoplay steps every four seconds and holds while hovered or focused. Inspired by Embla’s slide looper; changed: placement is computed per slide, never by cloning or teleporting the track. Use when a set has no natural end, such as postcards, testimonials or logos.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var advance = 0
    @State private var paused = false
    public init() {}
    private let count = 5

    /// Distance from the viewing position, wrapped so slides are placed modulo the loop, never cloned.
    private func wrapped(_ d: Double) -> Double {
        var x = d.truncatingRemainder(dividingBy: Double(count))
        if x > Double(count) / 2 { x -= Double(count) }
        if x < -Double(count) / 2 { x += Double(count) }
        return x
    }

    public var body: some View {
        AtomStage(hint: "Drag in either direction: it never reaches an end") {
            VStack(spacing: 12) {
                PhPager(count: count, loop: true, itemFraction: 0.7, advance: advance) { pos, size, item in
                    ZStack {
                        ForEach(0..<count, id: \.self) { i in
                            let d = wrapped(Double(i) - pos)
                            phPhoto(i, CGSize(width: item - 12, height: size.height)).clipShape(RoundedRectangle(cornerRadius: 12))
                                .scaleEffect(1 - 0.08 * min(1, abs(d))).offset(x: CGFloat(d) * item)
                        }
                    }.frame(width: size.width, height: size.height)
                }
                .frame(height: 150)
                #if os(macOS) || os(iOS)
                .onHover { paused = $0 }
                #endif
                dots
                    .task(id: paused) {
                        // autoplay steps every four seconds and holds while hovered
                        while !paused && !reduce && !Task.isCancelled {
                            try? await Task.sleep(nanoseconds: 4_000_000_000)
                            if !paused && !Task.isCancelled { advance += 1 }
                        }
                    }
            }
        }
    }

    private var dots: some View {
        HStack(spacing: 8) {
            ForEach(0..<count, id: \.self) { k in
                Circle().fill(.quaternary).frame(width: 7, height: 7)
            }
        }
        .accessibilityHidden(true)
    }
}
