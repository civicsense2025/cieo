import SwiftUI
import Cieo

public struct DelayedSpinnerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "delayspinner", category: "Admin kit", name: "Delayed spinner",
        summary: "The load starts a 300ms timer. If the result lands first, nothing shows: the list swaps and that is all. If not, the spinner fades in and blurs up on the base spring at 300ms, then stays at least 500ms so it never flashes, fading out on the snap spring once the result has swapped in. The strip below draws the same clock: the tick is the 300ms threshold and the accent span is how long the spinner was visible.")

    private let lists = [["Home", "Archive", "About"], ["Maya", "Theo", "Priya"], ["Spring", "Summer", "Autumn"]]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var list = 0
    @State private var spinner = false
    @State private var visible: ClosedRange<Double>?
    @State private var total = 0.0
    @State private var task: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Fast results never show the spinner") {
            VStack(spacing: 12) {
                ZStack {
                    ZStack { VStack(alignment: .leading, spacing: 6) { ForEach(lists[list], id: \.self) { Text($0).font(.footnote) } }.frame(maxWidth: .infinity, alignment: .leading).padding(12).id(list).motionTransition(.swap()) }
                        .animation(reduce ? nil : .motion(.base), value: list)
                    if spinner { ProgressView().transition(reduce ? .identity : .modifier(active: Veil(), identity: Veil(o: 1, blur: 0))) }
                }.frame(width: 300, height: 100).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 12))
                HStack { Button("Load in 150 ms") { load(0.15) }; Button("Load in 1.1 s") { load(1.1) } }.buttonStyle(.bordered).controlSize(.small)
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        Capsule().fill(.quaternary).frame(height: 6)
                        if let v = visible, total > 0 { Capsule().fill(Color.accentColor).frame(width: g.size.width * (v.upperBound - v.lowerBound) / total, height: 6).offset(x: g.size.width * v.lowerBound / total) }
                        Rectangle().fill(.primary).frame(width: 1.5, height: 12).offset(x: total > 0 ? g.size.width * 0.3 / total : 0)
                    }.frame(maxHeight: .infinity)
                }.frame(width: 300, height: 14).accessibilityHidden(true)
            }
        }
    }

    private func load(_ d: Double) {
        task?.cancel(); visible = nil; total = max(d, 0.8) + 0.2
        task = Task {
            if d <= 0.3 { try? await Task.sleep(for: .seconds(d)); withMotion(.base, reduceMotion: reduce) { list = (list + 1) % lists.count }; return }
            try? await Task.sleep(for: .seconds(0.3)); if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { spinner = true }
            try? await Task.sleep(for: .seconds(max(d - 0.3, 0.5))); if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { list = (list + 1) % lists.count }
            withMotion(.snap, reduceMotion: reduce) { spinner = false }
            visible = 0.3...max(d, 0.8)
        }
    }
}

private struct Veil: ViewModifier {
    var o = 0.0, blur: CGFloat = 4
    func body(content: Content) -> some View { content.opacity(o).blur(radius: blur) }
}
