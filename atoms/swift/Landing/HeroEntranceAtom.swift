import SwiftUI
import Cieo

public struct HeroEntranceAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "heroentrance", category: "Landing", name: "Hero entrance",
        summary: "Order: eyebrow, then the headline words 40ms apart, then the supporting line, then both buttons together, then the product image rises 28px with a slight scale from 0.98. Everything settles in about one second and then holds perfectly still. It plays again whenever it scrolls back into view.")

    private let lines = [["Build", "the", "page,"], ["not", "the", "plumbing"]]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = false
    public init() {}

    private func enter(_ delay: Double, soft: Bool = false) -> Animation? {
        reduce ? nil : Animation.motion(soft ? .soft : .base).delay(delay)
    }

    public var body: some View {
        AtomStage(hint: "Replays when it scrolls back into view") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 8) {
                    item(0, rise: 6) { Text("NEW · SPRING RELEASE").font(.caption2.weight(.semibold)).foregroundStyle(Color.accentColor) }
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(lines.indices, id: \.self) { l in
                            HStack(spacing: 6) { ForEach(lines[l].indices, id: \.self) { w in
                                let n = lines[..<l].reduce(0) { $0 + $1.count } + w
                                item(0.10 + Double(n) * 0.04, rise: 8) { Text(lines[l][w]).font(.title.weight(.semibold)) }
                            } }
                        }
                    }
                    item(0.40, rise: 8) { Text("Drag blocks, edit text and publish in one click.").font(.footnote).foregroundStyle(.secondary) }
                    item(0.52, rise: 8) { HStack { Button("Start free") {}.buttonStyle(.borderedProminent); Button("See a demo") {}.buttonStyle(.bordered) }.controlSize(.small) }
                    AtomPhoto(seed: 5, goldenHour: 0.4).frame(height: 70).clipShape(RoundedRectangle(cornerRadius: 12))
                        .opacity(shown ? 1 : 0).scaleEffect(shown ? 1 : 0.98).offset(y: shown ? 0 : 28).animation(enter(0.62, soft: true), value: shown)
                }.frame(width: 320, alignment: .leading)
                Button("Replay") { replay() }.font(.caption).buttonStyle(.borderless)
            }
        }
        .onAppear { replay() }
    }

    private func item<V: View>(_ delay: Double, rise: CGFloat, @ViewBuilder _ content: () -> V) -> some View {
        content().opacity(shown ? 1 : 0).offset(y: shown ? 0 : rise).animation(enter(delay), value: shown)
    }

    private func replay() {
        var t = Transaction(); t.disablesAnimations = true
        withTransaction(t) { shown = false }
        DispatchQueue.main.async { shown = true }
    }
}
