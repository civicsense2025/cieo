import CieoUI
import SwiftUI

/// A thread, its pieces and a composer, with local fixtures and plain placeholder buttons in every slot.
struct CommentsExamples: View {
    struct Post: FlatComment {
        let id: String
        var parentID: String?
        var author: String
        var text: String
        var time = "1h"
    }

    @State private var draft = ""
    @State private var replyDraft = ""
    @State private var replying: CommentComposer.Reply? = CommentComposer.Reply(author: "Ava", excerpt: "Has anyone checked the midterm numbers?")
    @State private var recording = false
    @State private var expanded: Set<String> = []
    @State private var waiting = 0
    @State private var posts: [Post] = [
        Post(id: "1", parentID: nil, author: "ginandtanic", text: "Early turnout in Florida looks higher than 2022. Source: floridapolitics.com/archives/123456/turnout #midterms"),
        Post(id: "2", parentID: "1", author: "ava", text: "Thanks @ginandtanic, that matches the county data."),
        Post(id: "3", parentID: "1", author: "bo", text: "Which counties?"),
        Post(id: "4", parentID: "2", author: "ginandtanic", text: "Mostly Miami-Dade and Orange."),
        Post(id: "5", parentID: "1", author: "cy", text: "Third reply, hidden at first."),
        Post(id: "6", parentID: "1", author: "di", text: "Fourth reply, hidden at first."),
    ]

    var body: some View {
        VStack(spacing: 24) {
            Specimen(title: "Comment thread") {
                CommentThread(label: "Comments", items: CommentTree.buildCommentTree(flat: posts), expanded: $expanded,
                              newIDs: ["3"], branchLabel: { "Replies to \($0.item.author)" }) { node, depth, replies in
                    Comment(author: node.item.author, time: node.item.time, depth: depth, avatar: { Circle().fill(.gray) },
                            content: { RichText(node.item.text, mentionURL: { "https://example.com/u/\($0)" }, tagURL: { "https://example.com/t/\($0)" }) })
                        .badge { if node.id == "1" { VerifiedBadge(size: .sm) } }
                        .context { if node.id == "1" { Text("midterms 2026") } }
                        .menu { IconButton(.disclosure, label: "More options") {} }
                        .attachments { if node.id == "1" { attachment } }
                        .actions { HStack { Button("Like") {}; Button("Reply") {}; Button("Share") {} }.buttonStyle(.plain) }
                        .replies { replies }
                }
            }
            Specimen(title: "Comment states") {
                Comment(author: "Ava", time: "now", state: .pending, avatar: { Circle().fill(.gray) }, content: { Text("Still sending.") })
                Comment(author: "Ava", state: .failed, avatar: { Circle().fill(.gray) }, content: { Text("Could not send.") })
                    .status { Button("Try again") {} }
                Comment(author: "Ava", state: .deleted, avatar: { Circle().fill(.gray) })
                    .replies { Comment(author: "Bo", depth: 1, avatar: { Circle().fill(.gray) }, content: { Text("A reply that stays.") }) }
                Comment(author: "Ava", state: .highlighted, entering: true, avatar: { Circle().fill(.gray) }, content: { Text("Linked from a notification.") })
            }
            Specimen(title: "Link preview") {
                LinkPreview(url: "https://www.floridapolitics.com/archives/1", title: "Early turnout runs ahead of the last midterm", summary: "Counties report a sharp rise.", image: .init(src: "https://example.invalid/a.jpg"))
                LinkPreview(url: "https://example.com/a", title: "A compact card with a long headline that needs two lines", variant: .compact)
                LinkPreview(url: "https://example.com/a", title: "Loading", variant: .large, loading: true)
                LinkPreview(url: "ftp://example.com/a", title: "Not a link")
            }
            Specimen(title: "Rich text, mentions and bylines") {
                RichText("Read x.com/joelw (see https://en.wikipedia.org/wiki/Foo_(bar)). Thanks @joelw #florida\nNo links: javascript:alert(1)", mentionURL: { "https://example.com/u/\($0)" })
                Mention(handle: "joelw", href: "https://example.com/joelw")
                ByLine(author: "A very long author name that has to truncate before the time", time: "1d") { VerifiedBadge() } context: { Text("midterms") }
            }
            Specimen(title: "New replies") {
                NewItemsPill(count: waiting, onShow: { waiting = 0 })
                HStack { Button("One arrives") { waiting += 1 }; Button("Show") { waiting = 0 } }
            }
            Specimen(title: "Reply quote and count ring") {
                ReplyPreview(author: "Ava", excerpt: "Has anyone checked the midterm numbers for the state?", onJump: {})
                HStack { CharacterCountRing(length: 10, max: 280); CharacterCountRing(length: 268, max: 280); CharacterCountRing(length: 284, max: 280) }
            }
            Specimen(title: "Composer") {
                CommentComposer(text: $draft, replyingTo: replying, onCancelReply: { replying = nil }, maxLength: 40) { text in
                    posts.append(Post(id: UUID().uuidString, parentID: "1", author: "you", text: text))
                    draft = ""
                }
                .avatar { Circle().fill(.gray) }
                .tools { HStack(spacing: 0) { IconButton(.info, label: "Add image") {}; IconButton(.search, label: "Add GIF") {}; IconButton(.next, label: "Record voice note") { recording = true } } }
                .recorder(isActive: recording) {
                    HStack { Text("Recording placeholder"); Spacer(); Button("Done") { recording = false } }
                }
                CommentComposer(text: $replyDraft, submitLabel: "Send", isPending: true, onSubmit: { _ in })
            }
        }
    }

    private var attachment: some View {
        LinkPreview(url: "https://example.com/a", title: "Attached link", variant: .compact)
    }
}
