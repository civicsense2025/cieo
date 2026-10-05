import SwiftUI
import Cieo

public struct NotificationCenterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "notifcenter", category: "Workspace", name: "Notification center",
        summary: "The bell opens a panel that pops out of its own corner. Clicking a row shrinks its dot, mixes its text to muted and rolls the badge down. Mark all read clears the dots top to bottom 40ms apart, rolls the badge to 0, then the badge exits. Every 5 seconds on the clock a notification arrives: the badge rolls up and, if the panel is open, the row enters at the top on a height spring that pushes the rest down.")

    private struct Note: Identifiable { let id = UUID(); let text: String; var unread = true; var shown = true }
    private let feed = ["Maya commented on Spring launch", "Pricing page was published", "Theo mentioned you in Budget", "A new member joined", "Backup finished"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var notes = ["Ada approved your draft", "Jonas replied to your comment", "Weekly report is ready"].map { Note(text: $0) }
    @State private var open = false
    @State private var badgeVisible = true
    @State private var arrived = 0
    public init() {}

    private var unread: Int { notes.filter(\.unread).count }

    public var body: some View {
        AtomStage(hint: "A notification arrives every 5 seconds") {
            ZStack(alignment: .topTrailing) {
                Button { withMotion(.base, reduceMotion: reduce) { open.toggle() } } label: {
                    Image(systemName: "bell").font(.title3).overlay(alignment: .topTrailing) {
                        if unread > 0 && badgeVisible { RollingDigits(unread).font(.system(size: 10, weight: .bold)).foregroundStyle(.white).padding(.horizontal, 5).padding(.vertical, 2).background(Capsule().fill(Color.red)).offset(x: 10, y: -8).transition(reduce ? .identity : .opacity.combined(with: .scale(scale: 0.8))) }
                    }
                }.buttonStyle(.plain).padding(14).accessibilityLabel("Notifications").accessibilityValue("\(unread) unread")
                if open { panel.padding(.top, 48).transition(reduce ? .identity : .modifier(active: Pop(), identity: Pop(s: 1, o: 1)).animation(.motion(.base))) }
            }
            .frame(width: 340, height: 280, alignment: .topTrailing)
            .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
            .animation(reduce ? nil : .motion(.snap), value: unread > 0)
        }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(5)); if Task.isCancelled { return }
                var n = Note(text: feed[arrived % feed.count]); arrived += 1; n.shown = !open
                withMotion(.base, reduceMotion: reduce) { badgeVisible = true; notes.insert(n, at: 0); if notes.count > 7 { notes.removeLast() } }
                if open { try? await Task.sleep(for: .seconds(0.05)); withMotion(.base, reduceMotion: reduce) { if let i = notes.firstIndex(where: { $0.id == n.id }) { notes[i].shown = true } } }
            }
        }
    }

    private var panel: some View {
        VStack(spacing: 0) {
            HStack { Text("Notifications").font(.footnote.weight(.semibold)); Spacer(); Button("Mark all read", action: markAll).buttonStyle(.plain).font(.caption).foregroundStyle(Color.accentColor).disabled(unread == 0) }.padding(10)
            Divider()
            VStack(spacing: 0) { ForEach(notes) { n in
                EditorHeightReveal(progress: n.shown ? 1 : 0) {
                    Button { read(n.id) } label: {
                        HStack(spacing: 8) { Circle().fill(Color.accentColor).frame(width: 7, height: 7).scaleEffect(n.unread ? 1 : 0).frame(width: 10)
                            Text(n.text).font(.footnote).foregroundStyle(n.unread ? Color.primary : .secondary); Spacer() }
                            .padding(.horizontal, 10).frame(height: 36)
                    }.buttonStyle(.plain)
                }.clipped().opacity(n.shown ? 1 : Motion.arriveOpacity)
            } }
            Spacer(minLength: 0)
        }
        .frame(width: 250, height: 220).background(.background, in: RoundedRectangle(cornerRadius: 12)).shadow(color: .black.opacity(0.15), radius: 10, y: 3).padding(.trailing, 10)
    }

    private func read(_ id: UUID) { withMotion(.base, reduceMotion: reduce) { if let i = notes.firstIndex(where: { $0.id == id }) { notes[i].unread = false } } }

    private func markAll() {
        for i in notes.indices { withAnimation(reduce ? nil : .motion(.base).delay(Double(i) * 0.04)) { notes[i].unread = false } }
        Task { try? await Task.sleep(for: .seconds(0.3 + Double(notes.count) * 0.04)); withMotion(.snap, reduceMotion: reduce) { badgeVisible = false } }
    }
}

private struct Pop: ViewModifier {
    var s: CGFloat = 0.92, o: Double = 0
    func body(content: Content) -> some View { content.scaleEffect(s, anchor: .topTrailing).opacity(o) }
}
