import SwiftUI
import MotionKit

public struct HeaderAnnounceAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-announce", category: "Headers", name: "Header: announcement bar",
        summary: "Dismiss the bar and its text blurs out first (100ms), then the slot’s height springs to zero 60ms later, so the header and the whole page ride up into the freed space rather than leaving a gap. Show again opens the slot first and brings the text in 100ms behind. It lives above a sticky header, so once you scroll it leaves with the page and the header stays pinned. Narrow: the message left-aligns and the actions wrap below.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var slot = true
    @State private var text = true
    public init() {}
    public var body: some View {
        AtomStage(hint: "Dismiss the bar, then show it again") {
            VStack(spacing: 0) {
                HStack(spacing: 8) {
                    Text("New: motion presets are here").font(.caption).opacity(text ? 1 : 0).blur(radius: text ? 0 : 4)
                    Spacer()
                    Button { set(false) } label: { Image(systemName: "xmark").font(.caption2) }.buttonStyle(.plain).accessibilityLabel("Dismiss announcement")
                }
                .padding(.horizontal, 12).frame(height: slot ? 34 : 0).clipped()
                .background(Color.accentColor.opacity(0.18))
                HStack { HdrLogo(); Spacer(); HStack(spacing: 14) { ForEach(hdrLinks.prefix(3), id: \.self) { Text($0).font(.caption) } }; HdrButton(title: "Start") }
                    .padding(.horizontal, 12).frame(height: 52).background(.background)
                HdrBlocks().padding(10)
                Button("Show again") { set(true) }.font(.caption).disabled(slot)
                Spacer(minLength: 0)
            }
            .clipShape(RoundedRectangle(cornerRadius: 8)).overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.quaternary))
        }
    }

    private func set(_ show: Bool) {
        if reduce { slot = show; text = show; return }
        if show {
            withAnimation(.motion(.soft)) { slot = true }
            withAnimation(.motion(.base).delay(Motion.exit)) { text = true }
        } else {
            withAnimation(.motionExit) { text = false }
            withAnimation(.motion(.soft).delay(Motion.lag)) { slot = false }
        }
    }
}
