import SwiftUI
import MotionKit

public struct ListToDetailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "listdetail", category: "Views", name: "List to detail",
        summary: "The card you pick is the detail view. Siblings fade and blur out first, then the same card’s x, y, width, height and radius spring from its measured slot to fill the frame while its image grows. Back appears as it lands, then the heading and two paragraphs enter 50ms apart. Closing runs it backwards: text out, card down into the exact slot, siblings return.")

    private struct Post { let tag: String, title: String, by: String, body: [String] }
    private let posts = [
        Post(tag: "Agenda · 6 min", title: "Who writes the school board agenda", by: "Maya Okafor · Oct 2", body: ["The superintendent drafts it and the board chair approves it. Anyone can ask for an item by writing to the clerk eight days before the meeting.", "Most agendas are settled before the public sees them, so the packet posted on Friday is the last draft you can still change."]),
        Post(tag: "Budget · 9 min", title: "Reading a city budget in ten minutes", by: "Theo Lindqvist · Sep 28", body: ["Start with the transfers page. It shows which departments moved money between lines after the vote.", "Then compare the adopted figure with last year’s actual spending. A gap of more than five percent deserves a question."]),
        Post(tag: "Votes · 4 min", title: "What a consent calendar hides", by: "Priya Raman · Sep 24", body: ["A consent calendar passes a stack of items in one vote with no discussion.", "Any member can pull an item for its own vote. Ask which ones they pulled this year and why."]),
        Post(tag: "Comment · 5 min", title: "Public comment, step by step", by: "Ben Alvarez · Sep 19", body: ["Sign up before the meeting opens, keep to the time limit, and name the agenda item you are speaking to.", "Written comments sent by noon the day before are usually entered into the record."])]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Namespace private var ns
    @State private var open: Int?
    @State private var textShown = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open a card, then go back") {
            ZStack {
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                    ForEach(posts.indices, id: \.self) { i in
                        ZStack {
                            if open != i { Button { select(i) } label: { card(i, expanded: false) }.buttonStyle(.plain)
                                .matchedGeometryEffect(id: i, in: ns).accessibilityLabel("Open \(posts[i].title)") }
                            else { Color.clear }
                        }
                        .frame(height: 118)
                        .opacity(open == nil || open == i ? 1 : 0).blur(radius: open == nil || open == i ? 0 : 6)
                    }
                }
                .padding(10).animation(reduce ? nil : .motionExit, value: open)
                if let i = open {
                    VStack(alignment: .leading, spacing: 0) {
                        card(i, expanded: true)
                    }
                    .matchedGeometryEffect(id: i, in: ns).padding(10)
                }
            }
            .frame(width: 380, height: 290)
            .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 16)).clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private func card(_ i: Int, expanded: Bool) -> some View {
        let p = posts[i]
        return VStack(alignment: .leading, spacing: 0) {
            AtomPhoto(seed: i + 2, goldenHour: Double(i) / 3).frame(height: expanded ? 90 : nil).frame(maxHeight: expanded ? 90 : .infinity).clipped()
            VStack(alignment: .leading, spacing: expanded ? 6 : 1) {
                if expanded {
                    HStack { Button { close() } label: { Label("Back", systemImage: "chevron.left").font(.footnote) }.buttonStyle(.plain).opacity(textShown ? 1 : 0) }
                }
                Text(p.tag).font(.caption2.weight(.semibold)).foregroundStyle(Color.accentColor)
                Text(p.title).font(expanded ? .headline : .footnote.weight(.semibold)).lineLimit(expanded ? 3 : 2)
                if expanded {
                    Text(p.by).font(.caption).foregroundStyle(.secondary).opacity(textShown ? 1 : 0)
                    ForEach(Array(p.body.enumerated()), id: \.offset) { k, s in
                        Text(s).font(.footnote).fixedSize(horizontal: false, vertical: true)
                            .opacity(textShown ? 1 : 0).offset(y: textShown ? 0 : 6)
                            .animation(reduce ? nil : (textShown ? .motion(.base).delay(Double(k) * 0.05 + 0.05) : .motionExit), value: textShown)
                    }
                    Spacer(minLength: 0)
                }
            }
            .padding(10).frame(maxWidth: .infinity, maxHeight: expanded ? .infinity : 56, alignment: .topLeading)
        }
        .background(.background, in: RoundedRectangle(cornerRadius: expanded ? 12 : 14))
        .clipShape(RoundedRectangle(cornerRadius: expanded ? 12 : 14))
        .shadow(color: .black.opacity(0.08), radius: 4, y: 1)
        .foregroundStyle(.primary)
    }

    private func select(_ i: Int) {
        withMotion(.soft, reduceMotion: reduce) { open = i }
        Task { try? await Task.sleep(for: .seconds(0.45)); if open == i { withMotion(.base, reduceMotion: reduce) { textShown = true } } }
    }

    private func close() {
        withAnimation(reduce ? nil : .motionExit) { textShown = false }
        Task { try? await Task.sleep(for: .seconds(Motion.exit)); withMotion(.soft, reduceMotion: reduce) { open = nil } }
    }
}
