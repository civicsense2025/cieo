import CieoUI
import SwiftUI

/// Specimens for the messaging and feedback components, with local fixtures and no network.
struct MessagingFeedbackExamples: View {
    private struct Chat: Identifiable { let id: String; let title: String; var unread = 0; var typing: [String] = [] }

    @State private var typing: [String] = ["Ava"]
    @State private var status: DeliveryStatus.State = .sending
    @State private var readers = 2
    @State private var chats = [Chat(id: "design", title: "Design team", unread: 3), Chat(id: "ben", title: "Ben"), Chat(id: "cy", title: "Cy", typing: ["Cy"])]
    @State private var order = ["design", "ben", "cy"]
    @State private var selection: String? = "design"
    @State private var commenting = false
    @State private var draft: LayerPoint?
    @State private var pinSelection: String?
    @State private var pins = [AnnotationLayerPin(id: "a", x: 0.3, y: 0.4, initials: "AV")]
    @State private var thread = false
    @State private var unread = true

    private let people = ["Ava", "Ben", "Cy", "Di", "Ed", "Flo"].map { GroupAvatarPerson(name: $0, initials: String($0.prefix(2))) }

    var body: some View {
        VStack(spacing: 20) {
            Specimen(title: "Typing") {
                TypingIndicator(names: typing)
                TypingIndicator(names: typing, variant: .inline)
                Button("Toggle typing") { typing = typing.isEmpty ? ["Ava", "Ben"] : [] }
            }
            Specimen(title: "Delivery status") {
                DeliveryStatus(status, time: "9:41 AM")
                Button("Next state") {
                    let all = DeliveryStatus.State.allCases
                    status = all[((all.firstIndex(of: status) ?? 0) + 1) % all.count]
                }
            }
            Specimen(title: "Seen by and unread divider") {
                SeenBy(people: Array(people.prefix(readers)))
                Button("Add reader") { readers = readers % people.count + 1 }
                UnreadDivider(count: 3)
            }
            Specimen(title: "Avatars") {
                HStack {
                    Avatar(name: "Earl Warren", size: .sm)
                    Avatar(name: "Earl Warren")
                    Avatar(name: "Ruth Bader Ginsburg", size: .points(56))
                    Avatar(people[0], size: .points(56))
                }
            }
            Specimen(title: "Group avatars") {
                HStack { ForEach([1, 2, 3, 4, 6], id: \.self) { GroupAvatar(people: Array(people.prefix($0)), size: .lg) } }
            }
            Specimen(title: "Conversation list") {
                ConversationList("Conversations", items: chats, order: order, selection: $selection) { chat in
                    ConversationListItem(id: chat.id, title: chat.title, preview: "See you at 3", time: "9:41 AM",
                                         unread: chat.unread, typing: chat.typing) {
                        GroupAvatar(people: Array(people.prefix(chat.id == "design" ? 3 : 1)))
                    }
                }
                Button("Move last to top") { order = [order.last!] + order.dropLast() }
            }
            Specimen(title: "Annotation layer") {
                Toggle("Comment mode", isOn: $commenting)
                AnnotationLayer("Mockup", pins: pins, isCommenting: $commenting, draft: $draft, selection: $pinSelection) {
                    RoundedRectangle(cornerRadius: 12).fill(.quaternary).frame(height: 240)
                } popover: { target, dismiss in
                    FeedbackPopover(title: "New comment", onSubmit: { _ in
                        if case let .draft(point) = target { pins.append(AnnotationLayerPin(id: UUID().uuidString, x: point.x, y: point.y)) }
                    }, onDismiss: dismiss)
                }
            }
            Specimen(title: "Feedback popover") {
                FeedbackPopover(title: "Comment 1", onSubmit: { _ in }) { Text("Ava: can we shorten this?") }
            }
            Specimen(title: "Activity") {
                ActivityItem(actor: "Ava", what: "liked your reply", preview: "Thanks for the thread", time: "2h", unread: unread,
                             tone: .accent, onSelect: { unread = false }) { GroupAvatar(people: [people[0]]) } badge: { Text("♥") }
                ActivityItem(actor: "Ben", what: "followed you", time: "1d", avatar: { GroupAvatar(people: [people[1]]) }, actions: {
                    Button("Follow back") {}
                })
            }
        }
        .padding()
    }
}
