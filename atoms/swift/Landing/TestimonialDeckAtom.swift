import SwiftUI
import Cieo

public struct TestimonialDeckAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "testimonialdeck", category: "Landing", name: "Testimonial deck",
        summary: "The stack fans beneath the top card as it is dragged. A fast fling or far drag dismisses it and the next quote swaps in; a short drag springs home. The last card settles into a done state with a restart.")

    private let quotes = [
        ("Maya", "I read every issue on the train. The one subscription I never question."),
        ("Theo", "A newsroom that links its sources. The corrections policy alone is worth reading."),
        ("Priya", "Finally a site that loads fast and respects my time.")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var current = 0
    @State private var finished = false
    @State private var dragX: CGFloat = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the top card") {
            VStack(spacing: 10) {
                Text("What readers say").font(.headline)
                ZStack {
                    ForEach(quotes.indices, id: \.self) { i in
                        let pos = (i - current + quotes.count * 2) % quotes.count
                        if (!finished && pos <= 2) || (finished && false) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("“\(quotes[i].1)”").font(.footnote).lineLimit(3)
                                Text("— \(quotes[i].0)").font(.caption).foregroundStyle(.secondary)
                            }.padding(14).frame(maxWidth: 300, alignment: .leading)
                            .background(.background, in: RoundedRectangle(cornerRadius: 10))
                            .scaleEffect(1 - CGFloat(min(2, pos)) * 0.06)
                            .offset(x: pos == 0 ? dragX : 0, y: CGFloat(min(2, pos)) * 10)
                            .rotationEffect(.degrees(pos == 0 ? Double(dragX / 28) : 0))
                            .opacity(pos == 0 ? max(0, 1 - abs(dragX) / 380) : 1 - Double(min(2, pos)) * 0.25)
                            .zIndex(Double(10 - pos))
                        }
                    }
                    if finished {
                        Text("That is everyone. Thanks for reading.").font(.footnote)
                            .frame(width: 300, height: 120).background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                            .id(1).motionTransition(.swap())
                    }
                }.frame(width: 300, height: 172)
                .gesture(DragGesture().onChanged { dragX = $0.translation.width }
                    .onEnded { v in
                        let fast = abs(v.predictedEndTranslation.width - v.translation.width) > 200
                        if abs(v.translation.width) > 90 || fast {
                            withMotion(.soft, reduceMotion: reduce) { dragX = v.translation.width > 0 ? 440 : -440 }
                            Task { try? await Task.sleep(for: .seconds(reduce ? 0 : 0.3)); advance() }
                        } else { withMotion(.soft, reduceMotion: reduce) { dragX = 0 } }
                    })
                Text(finished ? "end of quotes" : "\(current + 1) of \(quotes.count) · \(quotes[current].0)")
                    .font(.caption).foregroundStyle(.secondary).id(finished ? 99 : current).motionTransition(.swap())
                HStack(spacing: 8) {
                    ForEach(quotes.indices, id: \.self) { i in
                        Circle().fill(i == current && !finished ? Color.primary : Color.secondary.opacity(0.3)).frame(width: 7, height: 7)
                    }
                    Button(finished ? "Restart" : "Next") { next() }.font(.caption).buttonStyle(.borderless)
                }
            }.frame(maxWidth: 340)
        }
    }

    private func next() {
        if finished {
            withMotion(.base, reduceMotion: reduce) { current = 0; finished = false; dragX = 0 }
        } else {
            withMotion(.soft, reduceMotion: reduce) { dragX = 440 }
            Task { try? await Task.sleep(for: .seconds(reduce ? 0 : 0.3)); advance() }
        }
    }

    private func advance() {
        var t = Transaction(); t.disablesAnimations = true
        withTransaction(t) { dragX = 0 }
        if current + 1 >= quotes.count {
            withMotion(.base, reduceMotion: reduce) { finished = true }
        } else {
            withMotion(.base, reduceMotion: reduce) { current += 1 }
        }
    }
}
