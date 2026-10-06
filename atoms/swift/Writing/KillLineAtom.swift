import SwiftUI
import Cieo

public struct KillLineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "killline", category: "Writing", name: "Kill line",
        summary: "Dragging a story past the cut line arms a red snap. Letting go past the mark fades the row out, then its space closes and the rest spring up. Restore brings it back.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var stories = ["Water rates explained", "The footnote nobody read", "School board recap"]
    @State private var dragX = 0.0
    @State private var armed = false
    @State private var cut = false
    public init() {}
    private let threshold = 120.0

    public var body: some View {
        AtomStage(hint: "Drag the middle story past the line") {
            VStack(spacing: 8) {
                ZStack(alignment: .leading) {
                    Rectangle().fill(armed ? Color.red : Color.primary.opacity(0.15)).frame(width: 2)
                        .offset(x: threshold).animation(reduce ? nil : .motion(.snap), value: armed)
                    VStack(spacing: 8) {
                        Text(stories[0]).font(.callout).padding(10).frame(maxWidth: .infinity, alignment: .leading)
                            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 10))
                        if !cut {
                            Text(stories[1]).font(.callout).padding(10).frame(maxWidth: .infinity, alignment: .leading)
                                .background(.background, in: RoundedRectangle(cornerRadius: 10))
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(armed ? Color.red : Color.primary.opacity(0.2)))
                                .offset(x: dragX).zIndex(1)
                                .gesture(DragGesture(minimumDistance: 4).onChanged { g in
                                    dragX = reduce ? g.translation.width : max(0, g.translation.width)
                                    armed = dragX > threshold
                                }.onEnded { g in
                                    if dragX > threshold { kill() }
                                    else { withMotion(.base, reduceMotion: reduce) { dragX = 0; armed = false } }
                                })
                                .transition(reduce ? .identity : .opacity.combined(with: .scale(scale: 0.94)))
                        }
                        Text(stories[2]).font(.callout).padding(10).frame(maxWidth: .infinity, alignment: .leading)
                            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 10))
                    }
                    .animation(reduce ? nil : .motion(.base), value: cut)
                    .animation(reduce ? nil : .motion(.base), value: stories.count)
                }
                HStack {
                    Button("Restore") { withMotion(.base, reduceMotion: reduce) { cut = false; dragX = 0; armed = false } }
                        .buttonStyle(.bordered)
                    Text(cut ? "cut" : armed ? "release to cut" : "").font(.caption).foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: 340)
        }
    }

    private func kill() {
        if reduce { cut = true; dragX = 0; armed = false; return }
        withMotion(.snap, reduceMotion: reduce) { armed = false }
        withMotion(.base, reduceMotion: reduce) { cut = true; dragX = 0 }
    }
}
