import SwiftUI
import Cieo

public struct DrillInAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "drillin", category: "Views", name: "Drill-in navigation",
        summary: "The new pane slides in from the trailing edge while the current one shifts 28pt and dims. The back label swaps to the parent title and the tab bar never moves. An edge swipe tracks the finger and commits or cancels on release.")

    private let stories = [
        (title: "Who writes the agenda", by: "Maya Okafor · Oct 2", body: "The superintendent drafts it and the chair approves it. Ask the clerk eight days out."),
        (title: "Reading a city budget", by: "Theo Lindqvist · Sep 28", body: "Start with the transfers page. It shows money moved between lines after the vote.")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open: Int?
    @State private var slide: CGFloat = 340
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open a story, swipe from the left edge to go back") {
            VStack(spacing: 0) {
                ZStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Stories").font(.headline)
                        Text("Tap one to drill in.").font(.caption).foregroundStyle(.secondary)
                        ForEach(stories.indices, id: \.self) { i in
                            Button(stories[i].title) { show(i) }.buttonStyle(.bordered).controlSize(.small).padding(.top, 4)
                        }
                        Spacer(minLength: 0)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(14)
                    .offset(x: open == nil ? 0 : -28).opacity(open == nil ? 1 : 0.55).blur(radius: open == nil ? 0 : 2)
                    if let i = open {
                        VStack(alignment: .leading, spacing: 4) {
                            Button { hide() } label: {
                                SwapText("‹ Stories", drift: 0).font(.footnote)
                            }.buttonStyle(.plain).foregroundStyle(Color.accentColor)
                            Text(stories[i].title).font(.headline).id("h\(i)").motionTransition(.swap(drift: 4))
                            Text(stories[i].by).font(.caption).foregroundStyle(.secondary)
                            Text(stories[i].body).font(.footnote).padding(.top, 4)
                            Spacer(minLength: 0)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                        .padding(14).background(.background)
                        .offset(x: slide)
                        .gesture(DragGesture(minimumDistance: 8).onChanged { g in
                            guard g.startLocation.x < 30 else { return }
                            slide = max(0, g.translation.width)
                        }.onEnded { g in
                            guard g.startLocation.x < 30 else { return }
                            if g.predictedEndTranslation.width > 90 { hide() }
                            else { withMotion(.base, reduceMotion: reduce) { slide = 0 } }
                        })
                    }
                }
                Divider()
                HStack {
                    Text("Read").font(.caption.weight(.semibold))
                    Spacer()
                    Text("Saved").font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Text("Me").font(.caption).foregroundStyle(.secondary)
                }.padding(.horizontal, 16).frame(height: 44)
            }
            .frame(width: 340, height: 264)
            .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12)).clipShape(RoundedRectangle(cornerRadius: 12))
            .animation(reduce ? nil : .motion(.base), value: open)
        }
    }

    private func show(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) { open = i; slide = 0 }
    }

    private func hide() {
        withMotion(.base, reduceMotion: reduce) { slide = 340; open = nil }
    }
}
