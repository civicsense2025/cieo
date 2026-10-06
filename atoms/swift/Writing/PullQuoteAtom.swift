import SwiftUI
import Cieo

public struct PullQuoteAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pullquote", category: "Writing", name: "Pull-quote extractor",
        summary: "Drag the quote and it lifts while the paragraphs spring aside. Dropping it grows the block open from zero height.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var placed = false
    @State private var dragY: CGFloat = 0
    @State private var lifting = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the quote into the story") {
            VStack(spacing: 8) {
                VStack(spacing: 8) {
                    Text("Mara kept the lamp lit long after the ferry left.")
                        .padding(10).background(.quaternary.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                        .offset(y: lifting ? -8 : 0)
                    if placed {
                        Text("“We start over on the first line.”").italic()
                            .padding(10).frame(maxWidth: .infinity, alignment: .leading)
                            .overlay(alignment: .leading) { Rectangle().fill(.primary).frame(width: 3) }
                            .background(.quaternary.opacity(0.16), in: RoundedRectangle(cornerRadius: 8))
                            .motionTransition(.presence)
                    }
                    Text("The orchard deal could wait until morning, she said.")
                        .padding(10).background(.quaternary.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                        .offset(y: lifting ? 8 : 0)
                    if !placed {
                        Text("“We start over on the first line.”").italic().font(.callout)
                            .padding(10).frame(maxWidth: .infinity, alignment: .leading)
                            .overlay(alignment: .leading) { Rectangle().fill(.primary).frame(width: 3) }
                            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
                            .shadow(color: .black.opacity(lifting ? 0.18 : 0), radius: lifting ? 10 : 0, y: 4)
                            .scaleEffect(lifting ? 1.03 : 1)
                            .offset(y: dragY)
                            .gesture(DragGesture()
                                .onChanged { d in
                                    if !lifting { withMotion(.base, reduceMotion: reduce) { lifting = true } }
                                    dragY = d.translation.height
                                }
                                .onEnded { d in
                                    withMotion(.base, reduceMotion: reduce) {
                                        dragY = 0; lifting = false
                                        if d.translation.height > 12 || d.translation.height < -12 { placed = true }
                                    }
                                })
                            .accessibilityLabel("Pull quote, drag into story")
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: lifting)
                .animation(reduce ? nil : .motion(.base), value: placed)
                HStack { Spacer(); Button("Reset") { withMotion(.base, reduceMotion: reduce) { placed = false } }.buttonStyle(.bordered) }
            }
            .frame(maxWidth: 320)
        }
    }
}
