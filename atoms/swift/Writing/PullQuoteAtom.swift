import SwiftUI
import Cieo

public struct PullQuoteAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pullquote", category: "Writing", name: "Pull-quote extractor",
        summary: "Drag the quote and it lifts while the paragraphs spring aside. Dropping it grows the block open from zero height.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var placed = false
    @State private var tweak = true
    @State private var dragY: CGFloat = 0
    @State private var lifting = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the quote into the story") {
            VStack(spacing: 8) {
                VStack(spacing: 8) {
                    Text("Mara kept the lamp lit long after the ferry left.")
                        .padding(14).background(.quaternary.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                        .offset(y: lifting ? -8 : 0)
                    if placed {
                        Text("“We start over on the first line.”").italic()
                            .padding(14).frame(maxWidth: .infinity, alignment: .leading)
                            .overlay(alignment: .leading) { Rectangle().fill(.primary).frame(width: 3) }
                            .background(.quaternary.opacity(0.16), in: RoundedRectangle(cornerRadius: 8))
                            .motionTransition(.presence)
                    }
                    Text("The orchard deal could wait until morning, she said.")
                        .padding(14).background(.quaternary.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                        .offset(y: lifting ? 8 : 0)
                    if !placed {
                        Text("“We start over on the first line.”").italic().font(.system(size: 14))
                            .padding(14).frame(maxWidth: .infinity, alignment: .leading)
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
                HStack { Spacer(); Button("Reset") { withMotion(.base, reduceMotion: reduce) { placed = false } }.buttonStyle(.bordered).frame(minHeight: 32) }
                Toggle("Drop quotes inline", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .frame(maxWidth: 320)
        }
    }
}
