import CieoUI
import SwiftUI

/// Every engagement component with local state and no network.
struct EngagementExamples: View {
    @State private var liked = true
    @State private var notify = false
    @State private var following = false
    @State private var followingBack = true
    @State private var rating = 3
    @State private var reactions = [ReactionTally(id: "like", emoji: "👍", label: "Like", count: 4, mine: true),
                                    ReactionTally(id: "love", emoji: "❤️", label: "Love", count: 2)]
    @State private var voted: String?
    @State private var lastResult = "No feedback yet"

    var body: some View {
        VStack(spacing: 20) {
            Specimen(title: "Counts and actions") {
                HStack {
                    CompactCount(26_300, unit: "likes")
                    CompactCount(4_000_000)
                    CompactCount(0, hideZero: false)
                }
                ActionBar("Post actions", alignment: .spread) {
                    CountButton("Like", count: 164, unit: "likes", tone: .danger, isOn: $liked) {
                        Image(systemName: "heart")
                    } activeIcon: {
                        Image(systemName: "heart.fill")
                    }
                    CountButton("Reply", count: 12, unit: "replies") { Image(systemName: "bubble.left") }
                    NotifyToggle(isOn: $notify)
                    ShareButton(urlString: "https://example.com/post/1", subject: "A post")
                    ShareButton(urlString: "https://example.com/post/1", subject: "A post", display: .iconOnly)
                }
            }
            Specimen(title: "Follow and rate") {
                HStack {
                    FollowButton(following: $following, name: "Ava")
                    FollowButton(following: $followingBack, name: "Ben")
                }
                Rating(value: $rating, label: "Rate this reply")
                Rating(readOnlyValue: 3.5, label: "Average rating")
            }
            Specimen(title: "Reactions") {
                ReactionPicker(selected: Set(reactions.filter(\.mine).map(\.id))) { id in
                    reactions = ReactionSummary.toggleReaction(reactions, id: id,
                        emoji: ReactionPicker.defaultReactions.first { $0.id == id }?.emoji,
                        label: ReactionPicker.defaultReactions.first { $0.id == id }?.label)
                }
                ReactionSummary(reactions, onToggle: { reactions = ReactionSummary.toggleReaction(reactions, id: $0) },
                                onAdd: { id in
                    reactions = ReactionSummary.toggleReaction(reactions, id: id,
                        emoji: ReactionPicker.defaultReactions.first { $0.id == id }?.emoji,
                        label: ReactionPicker.defaultReactions.first { $0.id == id }?.label)
                })
            }
            Specimen(title: "Poll") {
                Poll(question: Text("Which topic next?"),
                     options: [PollOption(id: "a", label: "Voting", votes: 54 + (voted == "a" ? 1 : 0)),
                               PollOption(id: "b", label: "Courts", votes: 46 + (voted == "b" ? 1 : 0)),
                               PollOption(id: "c", label: "Congress", votes: 20 + (voted == "c" ? 1 : 0))],
                     voted: voted) { voted = $0 } footnote: { Text("Votes are anonymous.") }
            }
            Specimen(title: "Thumbs feedback") {
                ThumbsFeedback(reasons: (up: ["Clear", "Short"], down: ["Confusing", "Wrong"]),
                               onSubmit: { lastResult = "\($0.value.rawValue): \($0.reasons.joined(separator: ", "))" })
                Text(lastResult).font(.footnote)
            }
        }
    }
}
