import CieoUI
import SwiftUI
import XCTest

final class EngagementTests: XCTestCase {
    // MARK: CompactCount

    func testCompactCountShortensLikeAFeedAndClampsBadInput() {
        XCTAssertEqual(CompactCount.formatCompactCount(164), "164")
        XCTAssertEqual(CompactCount.formatCompactCount(1640), "1.6K")
        XCTAssertEqual(CompactCount.formatCompactCount(26_300), "26.3K")
        XCTAssertEqual(CompactCount.formatCompactCount(4_000_000), "4M")
        XCTAssertEqual(CompactCount.formatCompactCount(-3), "0")
        XCTAssertEqual(CompactCount.formatCompactCount(Double.nan), "0")
        XCTAssertEqual(CompactCount.formatCompactCount(2.9), "2")
        XCTAssertEqual(CompactCount.formatExactCount(26_300), "26,300")
        XCTAssertEqual(CompactCount.formatExactCount(-1), "0")
        XCTAssertEqual(CompactCount.spokenCount(26_300, unit: "likes"), "26,300 likes")
        XCTAssertEqual(CompactCount.spokenCount(5), "5")
    }

    // MARK: CountButton and ActionBar

    func testCountButtonLabelJoinsLabelAndExactCount() {
        XCTAssertEqual(CountButton<EmptyView, EmptyView>.countButtonLabel("Like", count: 164, unit: "likes"), "Like, 164 likes")
        XCTAssertEqual(CountButton<EmptyView, EmptyView>.countButtonLabel("Like", count: 26_300, unit: "likes"), "Like, 26,300 likes")
        XCTAssertEqual(CountButton<EmptyView, EmptyView>.countButtonLabel("Reply", count: 2), "Reply, 2")
        for count in [0, nil, -3] as [Int?] {
            XCTAssertEqual(CountButton<EmptyView, EmptyView>.countButtonLabel("Like", count: count, unit: "likes"), "Like")
        }
        XCTAssertEqual(CountButton<EmptyView, EmptyView>.dip, 0.8)
    }

    func testActionBarIndexWrapsAndIgnoresOtherKeys() {
        XCTAssertEqual(ActionBar<EmptyView>.actionBarIndex("ArrowRight", current: 0, count: 4), 1)
        XCTAssertEqual(ActionBar<EmptyView>.actionBarIndex("ArrowRight", current: 3, count: 4), 0)
        XCTAssertEqual(ActionBar<EmptyView>.actionBarIndex("ArrowLeft", current: 0, count: 4), 3)
        XCTAssertEqual(ActionBar<EmptyView>.actionBarIndex("Home", current: 2, count: 4), 0)
        XCTAssertEqual(ActionBar<EmptyView>.actionBarIndex("End", current: 0, count: 4), 3)
        XCTAssertNil(ActionBar<EmptyView>.actionBarIndex("ArrowDown", current: 1, count: 4))
        XCTAssertNil(ActionBar<EmptyView>.actionBarIndex("a", current: 1, count: 4))
        XCTAssertNil(ActionBar<EmptyView>.actionBarIndex("ArrowRight", current: 0, count: 0))
    }

    // MARK: FollowButton

    func testFollowLabelCoversEveryState() {
        XCTAssertEqual(FollowButton.followLabel(following: false, previewing: false), "Follow")
        XCTAssertEqual(FollowButton.followLabel(following: false, previewing: true), "Follow")
        XCTAssertEqual(FollowButton.followLabel(following: true, previewing: false), "Following")
        XCTAssertEqual(FollowButton.followLabel(following: true, previewing: true), "Unfollow")
    }

    func testFollowSpokenNameAlwaysEqualsTheVisibleWordPlusThePerson() {
        XCTAssertEqual(FollowButton.spokenLabel(following: false, previewing: false, name: "Ava"), "Follow Ava")
        XCTAssertEqual(FollowButton.spokenLabel(following: true, previewing: false, name: "Ava"), "Following Ava")
        XCTAssertEqual(FollowButton.spokenLabel(following: true, previewing: true, name: "Ava"), "Unfollow Ava")
        XCTAssertEqual(FollowButton.spokenLabel(following: false, previewing: false, name: nil), "Follow")
        XCTAssertEqual(FollowButton.spokenLabel(following: true, previewing: false, name: ""), "Following")
    }

    // MARK: NotifyToggle

    func testBellWiggleIsASmallDampedSwingThatStartsAndEndsAtRest() {
        XCTAssertLessThanOrEqual(NotifyToggle.bellWiggleMilliseconds, 440)
        XCTAssertLessThanOrEqual(NotifyToggle.bellWiggleDegrees, 15)
        XCTAssertEqual(NotifyToggle.bellWiggleAngle(0), 0)
        XCTAssertLessThan(abs(NotifyToggle.bellWiggleAngle(1)), 0.01)
        let frames = NotifyToggle.bellWiggleFrames()
        XCTAssertEqual(frames.count, 11)
        XCTAssertEqual(frames.first, 0)
        XCTAssertEqual(frames.last, 0)
        XCTAssertLessThanOrEqual(frames.map(abs).max() ?? 0, NotifyToggle.bellWiggleDegrees)
        XCTAssertGreaterThan(frames.map(abs).max() ?? 0, 1, "the bell visibly swings")
    }

    func testBellWiggleClampsAndSurvivesNaN() {
        XCTAssertEqual(NotifyToggle.bellWiggleAngle(-1), 0)
        XCTAssertEqual(NotifyToggle.bellWiggleAngle(.nan), 0)
        XCTAssertEqual(NotifyToggle.bellWiggleAngle(5), NotifyToggle.bellWiggleAngle(1), accuracy: 1e-9)
        XCTAssertEqual(NotifyToggle.bellWiggleFrames(steps: 1).count, 3)
    }

    // MARK: ShareButton

    func testOnlyHttpAndHttpsLinksAreShareable() {
        XCTAssertTrue(ShareButton.isShareableURL("https://example.com/p/1"))
        XCTAssertTrue(ShareButton.isShareableURL("http://example.com"))
        for url in ["javascript:alert(1)", "data:text/html,hi", "ftp://x.com", "/relative", "", "not a url"] {
            XCTAssertFalse(ShareButton.isShareableURL(url), url)
        }
    }

    // MARK: Rating

    func testRatingKeyStepMovesClampsAndIgnores() {
        XCTAssertEqual(Rating.ratingKeyStep("ArrowRight", value: 3, max: 5), 4)
        XCTAssertEqual(Rating.ratingKeyStep("ArrowUp", value: 0, max: 5), 1)
        XCTAssertEqual(Rating.ratingKeyStep("ArrowLeft", value: 3, max: 5), 2)
        XCTAssertNil(Rating.ratingKeyStep("ArrowDown", value: 1, max: 5))
        XCTAssertNil(Rating.ratingKeyStep("ArrowRight", value: 5, max: 5))
        XCTAssertEqual(Rating.ratingKeyStep("Home", value: 4, max: 5), 1)
        XCTAssertEqual(Rating.ratingKeyStep("End", value: 2, max: 5), 5)
        XCTAssertNil(Rating.ratingKeyStep("End", value: 5, max: 5))
        XCTAssertNil(Rating.ratingKeyStep("a", value: 2, max: 5))
        XCTAssertEqual(Rating.ratingKeyStep("ArrowRight", value: .nan, max: 5), 1)
        XCTAssertNil(Rating.ratingKeyStep("ArrowRight", value: 99, max: 5))
        XCTAssertNil(Rating.ratingKeyStep("End", value: 1, max: 0))
    }

    func testRatingLabelReadsOutOfAndClamps() {
        XCTAssertEqual(Rating.ratingLabel(4, max: 5), "4 out of 5")
        XCTAssertEqual(Rating.ratingLabel(3.5, max: 5), "3.5 out of 5")
        XCTAssertEqual(Rating.ratingLabel(9, max: 5), "5 out of 5")
        XCTAssertEqual(Rating.ratingLabel(-1, max: 5), "0 out of 5")
        XCTAssertEqual(Rating.ratingLabel(.nan, max: 5), "0 out of 5")
    }

    func testRatingCapsStarCountAndStaggerAllocation() {
        XCTAssertEqual(Rating.ratingLabel(99, max: Int.max), "10 out of 10")
        XCTAssertEqual(Rating.ratingKeyStep("End", value: 1, max: Int.max), 10)
        XCTAssertEqual(Rating.ratingPopDelays(from: 0, to: 10_000).count, 10)
        XCTAssertEqual(Rating.ratingPopDelays(from: 0, to: 10).count, 10)
    }

    func testRatingPopStaggerFitsInOneHundredFiftyMilliseconds() {
        XCTAssertEqual(Rating.ratingPopDelays(from: 3, to: 3), [])
        XCTAssertEqual(Rating.ratingPopDelays(from: 4, to: 2), [])
        XCTAssertEqual(Rating.ratingPopDelays(from: 0, to: 1), [0])
        let delays = Rating.ratingPopDelays(from: 0, to: 10)
        XCTAssertEqual(delays.count, 10)
        XCTAssertEqual(delays.first, 0)
        XCTAssertLessThanOrEqual(delays.max() ?? 0, 150)
        XCTAssertEqual(delays, delays.sorted())
    }

    // MARK: Reactions

    func testDefaultReactionsAreTheSixAgreedOnesInOrder() {
        XCTAssertEqual(ReactionPicker.defaultReactions.map(\.id), ["like", "love", "laugh", "wow", "sad", "thanks"])
        XCTAssertEqual(ReactionPicker.defaultReactions.map(\.label), ["Like", "Love", "Funny", "Wow", "Sad", "Thanks"])
        XCTAssertEqual(ReactionPicker.defaultReactions.map(\.emoji), ["👍", "❤️", "😂", "😮", "😢", "🙏"])
        XCTAssertEqual(ReactionPicker.pickerStartIndex([], selected: []), 0)
        XCTAssertEqual(ReactionPicker.pickerStartIndex(ReactionPicker.defaultReactions, selected: ["wow"]), 3)
        XCTAssertEqual(ReactionPicker.pickerStartIndex(ReactionPicker.defaultReactions, selected: ["nope"]), 0)
    }

    func testToggleReactionMatchesTheWebSemantics() {
        let list = [ReactionTally(id: "like", emoji: "👍", label: "Like", count: 1, mine: true),
                    ReactionTally(id: "love", emoji: "❤️", label: "Love", count: 2),
                    ReactionTally(id: "wow", emoji: "😮", label: "Wow", count: 2)]
        XCTAssertEqual(ReactionSummary.toggleReaction(list, id: "like").map(\.id), ["love", "wow"], "off at 1 drops the chip")
        let on = ReactionSummary.toggleReaction(list, id: "wow")
        XCTAssertEqual(on[2], ReactionTally(id: "wow", emoji: "😮", label: "Wow", count: 3, mine: true))
        let off = ReactionSummary.toggleReaction(on, id: "wow")
        XCTAssertEqual(off[2], ReactionTally(id: "wow", emoji: "😮", label: "Wow", count: 2, mine: false))
        XCTAssertEqual(ReactionSummary.toggleReaction([], id: "x"), [ReactionTally(id: "x", emoji: "x", label: "x", count: 1, mine: true)])
        XCTAssertEqual(ReactionSummary.toggleReaction([], id: "x", emoji: "🎉", label: "Party").first?.emoji, "🎉")
        XCTAssertEqual(list[0].count, 1, "the input is never changed")
    }

    func testReactionNameSpeaksTheCountAndWhetherYouAreIn() {
        func chip(_ count: Int, mine: Bool = false) -> ReactionTally { ReactionTally(id: "l", emoji: "❤️", label: "Love", count: count, mine: mine) }
        XCTAssertEqual(ReactionSummary.reactionName(chip(3, mine: true)), "Love, 3 people including you")
        XCTAssertEqual(ReactionSummary.reactionName(chip(2)), "Love, 2 people")
        XCTAssertEqual(ReactionSummary.reactionName(chip(1)), "Love, 1 person")
        XCTAssertEqual(ReactionSummary.reactionName(chip(1, mine: true)), "Love, just you")
    }

    func testReactionDiffFindsEnteringAndLeavingChips() {
        let a = ReactionTally(id: "a", emoji: "a", label: "A", count: 1)
        let b = ReactionTally(id: "b", emoji: "b", label: "B", count: 1)
        let diff = ReactionSummary.reactionDiff([a], [b])
        XCTAssertEqual(diff.entering, ["b"])
        XCTAssertEqual(diff.leaving.map(\.at), [0])
        XCTAssertEqual(diff.leaving.map(\.chip.id), ["a"])
        let same = ReactionSummary.reactionDiff([a], [a])
        XCTAssertTrue(same.entering.isEmpty && same.leaving.isEmpty)
    }

    // MARK: Poll

    func testPollPercentagesSumToExactlyOneHundred() {
        XCTAssertEqual(Poll<EmptyView>.pollPercentages([1, 1, 1]), [34, 33, 33])
        XCTAssertEqual(Poll<EmptyView>.pollPercentages([0, 0]), [0, 0])
        XCTAssertEqual(Poll<EmptyView>.pollPercentages([]), [])
        XCTAssertEqual(Poll<EmptyView>.pollPercentages([5]), [100])
        XCTAssertEqual(Poll<EmptyView>.pollPercentages([1, 0]), [100, 0])
        XCTAssertEqual(Poll<EmptyView>.pollPercentages([-4, 2]), [0, 100])
        XCTAssertEqual(Poll<EmptyView>.pollPercentages([54, 46]), [54, 46])
        for votes in [[7, 11, 13], [1, 2, 3, 4, 5, 6, 7], [33, 33, 34], [1, 1, 1, 1, 1, 1, 1]] {
            XCTAssertEqual(Poll<EmptyView>.pollPercentages(votes).reduce(0, +), 100, "\(votes)")
        }
    }

    func testPollAnnouncementNamesTheLeaderTiesAndEmptyPolls() {
        let options = [PollOption(id: "a", label: "Option A", votes: 54), PollOption(id: "b", label: "Option B", votes: 46)]
        XCTAssertEqual(Poll<EmptyView>.pollAnnouncement(options), "Vote counted. Option A leads with 54%.")
        XCTAssertEqual(Poll<EmptyView>.pollAnnouncement([PollOption(id: "a", label: "A", votes: 1), PollOption(id: "b", label: "B", votes: 1)]),
                       "Vote counted. A and B are tied at 50%.")
        XCTAssertEqual(Poll<EmptyView>.pollAnnouncement([PollOption(id: "a", label: "A", votes: 0)]), "Vote counted.")
    }

    // MARK: ThumbsFeedback

    func testThumbsStepGoesAskDetailDoneAndSkipsDetailWithoutReasons() {
        let initial = ThumbsFeedback.thumbsInitial
        let detail = ThumbsFeedback.thumbsStep(initial, .rate(.down, hasReasons: true))
        XCTAssertEqual(detail, ThumbsState(step: .detail, value: .down))
        XCTAssertEqual(ThumbsFeedback.thumbsStep(detail, .rate(.up, hasReasons: true)), ThumbsState(step: .detail, value: .up))
        XCTAssertEqual(ThumbsFeedback.thumbsStep(detail, .submit), ThumbsState(step: .done, value: .down))
        XCTAssertEqual(ThumbsFeedback.thumbsStep(detail, .skip), ThumbsState(step: .done, value: .down))
        XCTAssertEqual(ThumbsFeedback.thumbsStep(initial, .rate(.up, hasReasons: false)), ThumbsState(step: .done, value: .up))
        let done = ThumbsState(step: .done, value: .up)
        XCTAssertEqual(ThumbsFeedback.thumbsStep(done, .rate(.down, hasReasons: true)), done)
        XCTAssertEqual(ThumbsFeedback.thumbsStep(done, .submit), done)
        XCTAssertEqual(ThumbsFeedback.thumbsStep(initial, .submit), initial)
        XCTAssertEqual(ThumbsFeedback.thumbsStep(initial, .skip), initial)
    }

    // MARK: Foundations used by the kit

    func testGlyphAndToneSlotsHaveDefaults() {
        for icon in [ComponentIcon.bell, .bellFilled, .share, .star, .starFilled, .add, .thumbUp, .thumbDown] {
            XCTAssertFalse(ComponentIcons.systemName(icon).isEmpty)
        }
        // Deliberate shares: disclosure and next are the same chevron; a read message and a selected
        // option are the same filled check. Any other repeat is a copy-paste slip.
        let names = ComponentIcon.allCases.map(ComponentIcons.systemName)
        let repeats = Set(names.filter { name in names.filter { $0 == name }.count > 1 })
        XCTAssertEqual(repeats, ["chevron.forward", "checkmark.circle.fill"])
    }

    // MARK: Rendering

    @MainActor
    func testEngagementComponentsRenderAtPhoneWidthInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let renderer = ImageRenderer(content: Self.specimens.environment(\.colorScheme, scheme).frame(width: 390))
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage)
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 600)
            try AtomTests.save(image, name: "engagement-\(scheme)")
        }
    }

    @MainActor
    func testPollsRenderBeforeAndAfterTheVote() throws {
        let options = [PollOption(id: "a", label: "Voting", votes: 3), PollOption(id: "b", label: "Courts", votes: 1)]
        let before = Poll(question: Text("Next topic?"), options: options, onVote: { _ in }).frame(width: 390)
        let after = Poll(question: Text("Next topic?"), options: options, voted: "a", onVote: { _ in }).frame(width: 390)
        XCTAssertNotNil(ImageRenderer(content: before).cgImage)
        XCTAssertNotNil(ImageRenderer(content: after).cgImage)
    }

    @MainActor
    static var specimens: some View {
        VStack(alignment: .leading, spacing: 20) {
            ActionBar("Post actions", alignment: .spread) {
                CountButton("Like", count: 164, unit: "likes", tone: .danger, isOn: .constant(true)) { Image(systemName: "heart") }
                CountButton("Reply", count: 12, unit: "replies") { Image(systemName: "bubble.left") }
                NotifyToggle(isOn: .constant(true))
                ShareButton(urlString: "https://example.com")
            }
            HStack {
                FollowButton(following: .constant(false), name: "Ava")
                FollowButton(following: .constant(true), name: "Ben")
            }
            Rating(value: .constant(4), label: "Rate this reply")
            Rating(readOnlyValue: 3, label: "Average")
            ReactionPicker(selected: ["love"]) { _ in }
            ReactionSummary([ReactionTally(id: "like", emoji: "👍", label: "Like", count: 4, mine: true),
                             ReactionTally(id: "love", emoji: "❤️", label: "Love", count: 2)],
                            onToggle: { _ in }, onAdd: { _ in })
            Poll(question: Text("Next topic?"),
                 options: [PollOption(id: "a", label: "Voting", votes: 3), PollOption(id: "b", label: "Courts", votes: 1)],
                 voted: "a", onVote: { _ in })
            ThumbsFeedback(reasons: (up: ["Clear"], down: ["Confusing"])) { _ in }
        }
        .padding(16)
    }
}
