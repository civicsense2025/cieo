import SwiftUI
import Cieo

public struct WordRotatorAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "wordrotator", category: "Landing", name: "Hero word rotator",
        summary: "The hero keyword cycles every 2.8 seconds: the old word blurs up and out, the next rises in, and the pill width springs to fit. With loop off the last word holds as the terminal state.")

    private let words = ["convert", "delight", "rank", "sell"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var index = 0
    @State private var loop = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Keyword swaps every 2.8s") {
            VStack(spacing: 10) {
                HStack(spacing: 6) {
                    Text("Pages that").font(.title.weight(.semibold))
                    Text(words[index]).font(.title.weight(.semibold)).id(index).motionTransition(.swap())
                }
                Text("Drag blocks, edit text and publish in one click.").font(.footnote).foregroundStyle(.secondary)
                HStack { PreviewAction("Start free").buttonStyle(.borderedProminent); PreviewAction("See a demo").buttonStyle(.bordered) }.controlSize(.small)
                Toggle("Loop keywords", isOn: $loop).font(.caption).foregroundStyle(.secondary)
            }.frame(maxWidth: 320).multilineTextAlignment(.center)
            .task { await cycle() }
            .onChange(of: index) { if !loop && index == words.count - 1 { /* terminal: hold */ } }
        }
    }

    private func cycle() async {
        while !Task.isCancelled {
            try? await Task.sleep(for: .seconds(reduce ? 3600 : 2.8))
            if reduce { return }
            let next = loop ? (index + 1) % words.count : index + 1
            guard next < words.count else { return }
            withMotion(.base, reduceMotion: reduce) { index = next }
        }
    }
}
