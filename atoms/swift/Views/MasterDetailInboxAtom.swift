import SwiftUI
import Cieo

public struct MasterDetailInboxAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "inbox", category: "Views", name: "Master–detail inbox",
        summary: "Choosing a thread moves the selection plate with lagging edges, the leading edge going first. The thread pane exits, then the next thread enters from the direction of its place in the list. Then the unread dot shrinks away and the count rolls down. Compose slides a sheet over the thread pane. Send closes it first, then a new row opens at the top.")

    private struct Mail: Identifiable { let id: Int; let from: String; let subject: String; let body: String; var unread: Bool }
    private let rowH: CGFloat = 46
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var mails = [
        Mail(id: 0, from: "Maya Okafor", subject: "Agenda for Thursday’s session", body: "Item 4, the water rate vote, moved ahead of the budget amendments. Public comment now opens the meeting.", unread: true),
        Mail(id: 1, from: "Theo Lindqvist", subject: "Re: Budget hearing testimony", body: "Two minutes is plenty. Lead with the library hours, because that is the cut people have already heard about.", unread: false),
        Mail(id: 2, from: "County Clerk", subject: "Records request 2291 fulfilled", body: "Fourteen files are attached, 212 pages in total. Two pages were withheld under the personnel exemption.", unread: true),
        Mail(id: 3, from: "Priya Raman", subject: "Volunteer shifts for the voter drive", body: "Saturday still needs two people at the library table, ten to noon.", unread: true)]
    @State private var selected = 1
    @State private var dir: CGFloat = 1
    @State private var plateTop: CGFloat = 46
    @State private var plateBottom: CGFloat = 92
    @State private var composing = false
    @State private var nextID = 10
    public init() {}

    private var unread: Int { mails.filter(\.unread).count }
    private var index: Int { mails.firstIndex { $0.id == selected } ?? 0 }

    public var body: some View {
        AtomStage(hint: "Pick threads, then compose") {
            HStack(spacing: 0) {
                VStack(spacing: 0) {
                    HStack { Text("Inbox").font(.footnote.weight(.semibold)); Spacer(); RollingDigits(unread).font(.caption.weight(.semibold)); Button { withMotion(.base, reduceMotion: reduce) { composing = true } } label: { Image(systemName: "square.and.pencil") }.buttonStyle(.plain).accessibilityLabel("Compose") }
                        .padding(.horizontal, 10).frame(height: 34)
                    ZStack(alignment: .topLeading) {
                        RoundedRectangle(cornerRadius: 8).fill(Color.accentColor.opacity(0.16)).frame(height: max(0, plateBottom - plateTop)).padding(.horizontal, 4).offset(y: plateTop)
                        VStack(spacing: 0) { ForEach(mails) { m in row(m) } }
                    }
                    Spacer(minLength: 0)
                }.frame(width: 160)
                Divider()
                ZStack(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 6) {
                        let m = mails.first { $0.id == selected } ?? mails[0]
                        Text(m.subject).font(.subheadline.weight(.semibold)); Text(m.from).font(.caption).foregroundStyle(.secondary)
                        Text(m.body).font(.footnote)
                    }
                    .frame(maxWidth: .infinity, alignment: .topLeading).padding(14).id(selected)
                    .transition(reduce ? .identity : .asymmetric(
                        insertion: .opacity.combined(with: .offset(y: 12 * dir)).animation(.motion(.base).delay(Motion.exit)),
                        removal: .opacity.combined(with: .offset(y: -12 * dir)).animation(.motionExit)))
                    if composing { sheet.transition(reduce ? .identity : .move(edge: .trailing)) }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity).clipped()
            }
            .frame(width: 400, height: 250)
            .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
            .onAppear { plateTop = rowH * CGFloat(index); plateBottom = plateTop + rowH }
        }
    }

    private func row(_ m: Mail) -> some View {
        Button { pick(m.id) } label: {
            HStack(spacing: 6) {
                Circle().fill(Color.accentColor).frame(width: 8, height: 8).scaleEffect(m.unread ? 1 : 0).frame(width: 12)
                VStack(alignment: .leading, spacing: 0) {
                    Text(m.from).font(.caption.weight(m.unread ? .semibold : .regular)); Text(m.subject).font(.caption2).foregroundStyle(.secondary).lineLimit(1)
                }
                Spacer(minLength: 0)
            }.padding(.horizontal, 8).frame(height: rowH)
        }
        .buttonStyle(.plain).foregroundStyle(.primary).transition(.opacity)
        .accessibilityValue(m.unread ? "Unread" : "Read")
    }

    private var sheet: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("New message").font(.subheadline.weight(.semibold))
            Text("To: maya@example.org").font(.footnote).padding(8).frame(maxWidth: .infinity, alignment: .leading).background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
            Text("Confirming the three speakers.").font(.footnote).padding(8).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
            HStack { Spacer(); Button("Cancel") { withMotion(.snap, reduceMotion: reduce) { composing = false } }; Button("Send", action: send).buttonStyle(.borderedProminent) }.controlSize(.small)
        }
        .padding(12).frame(maxWidth: .infinity, maxHeight: .infinity).background(.background)
    }

    private func pick(_ id: Int) {
        guard id != selected, let to = mails.firstIndex(where: { $0.id == id }) else { return }
        let down = to > index; dir = down ? 1 : -1
        let t = rowH * CGFloat(to)
        withAnimation(reduce ? nil : .motion(.base).delay(down ? Motion.lag : 0)) { plateTop = t }
        withAnimation(reduce ? nil : .motion(.base).delay(down ? 0 : Motion.lag)) { plateBottom = t + rowH }
        withMotion(.base, reduceMotion: reduce) { selected = id }
        Task { try? await Task.sleep(for: .seconds(0.18)); withMotion(.base, reduceMotion: reduce) { if let i = mails.firstIndex(where: { $0.id == id }) { mails[i].unread = false } } }
    }

    private func send() {
        withMotion(.snap, reduceMotion: reduce) { composing = false }
        Task {
            try? await Task.sleep(for: .seconds(Motion.exit))
            withMotion(.base, reduceMotion: reduce) {
                mails.insert(Mail(id: nextID, from: "You", subject: "Confirming the three speakers", body: "Confirming the three speakers who signed up by Monday.", unread: false), at: 0)
                nextID += 1; selected = mails[0].id; plateTop = 0; plateBottom = rowH
            }
        }
    }
}
