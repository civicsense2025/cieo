@testable import CieoUI
import SwiftUI
import XCTest

final class MessagingFeedbackTests: XCTestCase {
    // MARK: - TypingIndicator

    func testTypingLabelWordsOneToManyPeopleAndIgnoresBlanks() {
        let label = TypingIndicator.typingLabel
        XCTAssertEqual(label([]), "")
        XCTAssertEqual(label(["  ", ""]), "")
        XCTAssertEqual(label(["Ava"]), "Ava is typing")
        XCTAssertEqual(label(["Ava", "Ben"]), "Ava and Ben are typing")
        XCTAssertEqual(label(["Ava", "Ben", "Cy"]), "Ava, Ben and Cy are typing")
        XCTAssertEqual(label(["Ava", "Ben", "Cy", "Di"]), "Ava and 3 others are typing")
        XCTAssertEqual(label(["Ava", "Ben", "Cy", "Di", "Ed", "Flo"]), "Ava and 5 others are typing")
    }

    func testTypingSetKeyIgnoresOrderAndBlanks() {
        XCTAssertEqual(TypingIndicator.typingSetKey(["Ben", "Ava"]), TypingIndicator.typingSetKey([" Ava ", "Ben", ""]))
        XCTAssertEqual(TypingIndicator.typingSetKey([" ", ""]), "")
        XCTAssertNotEqual(TypingIndicator.typingSetKey(["Ava"]), TypingIndicator.typingSetKey(["Ava", "Ben"]))
    }

    func testTheWaveStaysInRangeAndTrailsFromDotToDot() {
        for dot in 0..<TypingIndicator.dotCount {
            for step in 0..<50 {
                let level = TypingIndicator.wave(at: Double(step) * 0.07, dot: dot)
                XCTAssertTrue((0...1).contains(level), "dot \(dot) at step \(step): \(level)")
            }
        }
        XCTAssertNotEqual(TypingIndicator.wave(at: 0.3, dot: 0), TypingIndicator.wave(at: 0.3, dot: 1))
        XCTAssertEqual(TypingIndicator.wave(at: 0, dot: 0), 0, accuracy: 1e-9)
    }

    // MARK: - DeliveryStatus

    func testDeliveryLabelNamesEveryState() {
        XCTAssertEqual(DeliveryStatus.State.allCases.map(DeliveryStatus.deliveryLabel),
                       ["Sending", "Sent", "Delivered", "Read", "Not delivered"])
    }

    func testDeliverySpeaksTheTimeAfterTheStatus() {
        XCTAssertEqual(DeliveryStatus.spokenLabel(.delivered, time: "9:41 AM"), "Delivered, 9:41 AM")
        XCTAssertEqual(DeliveryStatus.spokenLabel(.read, time: nil), "Read")
        XCTAssertEqual(DeliveryStatus.spokenLabel(.sent, time: ""), "Sent")
    }

    func testEveryDeliveryStateDrawsItsOwnGlyph() {
        let icons = DeliveryStatus.State.allCases.map(DeliveryStatus.icon)
        XCTAssertEqual(Set(icons).count, icons.count)
    }

    // MARK: - SeenBy, listNames, GroupAvatar

    func testSeenByLabelAndListNamesSummariseReaders() {
        XCTAssertEqual(SeenBy.seenByLabel([]), "")
        XCTAssertEqual(SeenBy.seenByLabel(["Ava"]), "Seen by Ava")
        XCTAssertEqual(SeenBy.seenByLabel(["Ava", "Ben"]), "Seen by Ava and Ben")
        XCTAssertEqual(SeenBy.seenByLabel(["Ava", "Ben", "Cy"]), "Seen by Ava, Ben and Cy")
        XCTAssertEqual(SeenBy.seenByLabel(["Ava", "Ben", "Cy", "Di"]), "Seen by Ava, Ben and 2 others")
        XCTAssertEqual(GroupAvatar.listNames([" ", "Ava"]), "Ava")
    }

    func testSeenByCollapsesFacesBeyondTheLimitIntoAPlusTile() {
        XCTAssertEqual(SeenBy.layout(count: 2).shown, 2)
        XCTAssertEqual(SeenBy.layout(count: 2).rest, 0)
        XCTAssertEqual(SeenBy.layout(count: 5).shown, 3)
        XCTAssertEqual(SeenBy.layout(count: 5).rest, 2)
        XCTAssertEqual(SeenBy.layout(count: 5, max: 0).shown, 1, "the limit is at least one face")
        XCTAssertEqual(SeenBy.layout(count: 0).rest, 0)
    }

    func testGroupAvatarLabelAndLayoutShowFacesUpToFourThenThreePlusATile() {
        XCTAssertEqual(GroupAvatar.groupAvatarLabel(["Ava", "Ben", "Cy", "Di", "Ed"]), "Ava, Ben and 3 others")
        XCTAssertEqual(GroupAvatar.groupAvatarLabel(["Ava", "Ben"]), "Ava and Ben")
        XCTAssertEqual(GroupAvatar.groupAvatarLabel([]), "")
        func ids(_ n: Int) -> [Int] { Array(0..<n) }
        for n in 1...4 {
            let layout = GroupAvatar.groupAvatarLayout(ids(n))
            XCTAssertEqual(layout.faces, ids(n))
            XCTAssertEqual(layout.more, 0)
        }
        XCTAssertEqual(GroupAvatar.groupAvatarLayout(ids(5)).faces, [0, 1, 2])
        XCTAssertEqual(GroupAvatar.groupAvatarLayout(ids(5)).more, 2)
        XCTAssertEqual(GroupAvatar.groupAvatarLayout(ids(12)).more, 9)
        XCTAssertEqual(GroupAvatar.groupAvatarLayout([Int]()).faces, [])
    }

    func testGroupAvatarFacesStayInsideTheCircleAndTheGridDoesNotOverlap() {
        for count in 1...4 {
            let frames = GroupAvatar.slotFrames(count: count)
            XCTAssertEqual(frames.count, count)
            for frame in frames {
                let reach = hypot(frame.midX - 0.5, frame.midY - 0.5) + frame.width / 2
                XCTAssertLessThanOrEqual(reach, 0.5 + 1e-9, "count \(count): \(frame) leaves the circle")
            }
            if count >= 3 {
                for i in frames.indices { for j in frames.indices where i < j {
                    let gap = hypot(frames[i].midX - frames[j].midX, frames[i].midY - frames[j].midY)
                    XCTAssertGreaterThanOrEqual(gap, frames[i].width, "count \(count): faces \(i) and \(j) overlap")
                } }
            }
        }
        XCTAssertTrue(GroupAvatar.slotFrames(count: 0).isEmpty)
    }

    // MARK: - UnreadDivider

    func testUnreadDividerPrefersTheHostLabelThenACountThenTheDefault() {
        XCTAssertEqual(UnreadDivider.unreadDividerLabel(), "New messages")
        XCTAssertEqual(UnreadDivider.unreadDividerLabel(count: 3), "3 new messages")
        XCTAssertEqual(UnreadDivider.unreadDividerLabel(count: 1), "1 new message")
        XCTAssertEqual(UnreadDivider.unreadDividerLabel(count: 0), "New messages")
        XCTAssertEqual(UnreadDivider.unreadDividerLabel(count: -2), "New messages")
        XCTAssertEqual(UnreadDivider.unreadDividerLabel(count: 3, label: "Nouveaux messages"), "Nouveaux messages")
        XCTAssertEqual(UnreadDivider.unreadDividerLabel(count: 3, label: "  "), "3 new messages")
    }

    // MARK: - ConversationListItem and ConversationList

    func testUnreadBadgeTextClampsAndCaps() {
        XCTAssertEqual(ConversationListItem<EmptyView>.unreadBadgeText(3), "3")
        XCTAssertEqual(ConversationListItem<EmptyView>.unreadBadgeText(99), "99")
        XCTAssertEqual(ConversationListItem<EmptyView>.unreadBadgeText(100), "99+")
        XCTAssertEqual(ConversationListItem<EmptyView>.unreadBadgeText(-4), "0")
    }

    func testConversationLabelSummarisesARowForScreenReaders() {
        let label = ConversationListItem<EmptyView>.conversationLabel
        XCTAssertEqual(label(.init(title: "Design team", unread: 3, preview: "Ava: see you at 3", time: "9:41 AM")),
                       "Design team, 3 unread, Ava: see you at 3, 9:41 AM")
        XCTAssertEqual(label(.init(title: "Ben")), "Ben")
        XCTAssertEqual(label(.init(title: "Ben", muted: true, pinned: true, preview: "ok")), "Ben, muted, pinned, ok")
        XCTAssertEqual(label(.init(title: "Ben", draft: true, preview: "maybe")), "Ben, Draft: maybe")
        XCTAssertEqual(label(.init(title: "Ben", typing: ["Ben", "Cy"], preview: "old news")), "Ben, Ben and Cy are typing")
        XCTAssertEqual(label(.init(title: "Ben", unread: -3)), "Ben")
    }

    func testConversationOrderPutsNamedIdsFirstAndKeepsTheRest() {
        typealias List = ConversationList<TestChat, EmptyView>
        XCTAssertEqual(List.conversationOrder(["a", "b", "c"]), ["a", "b", "c"])
        XCTAssertEqual(List.conversationOrder(["a", "b", "c"], order: ["c", "a"]), ["c", "a", "b"])
        XCTAssertEqual(List.conversationOrder(["a", "b", "c"], order: ["z", "b", "b"]), ["b", "a", "c"])
        XCTAssertEqual(List.conversationOrder([String](), order: ["a"]), [])
    }

    func testConversationTabbablePrefersActiveThenSelectedThenFirst() {
        typealias List = ConversationList<TestChat, EmptyView>
        XCTAssertEqual(List.conversationTabbable(["a", "b"], activeId: "b", selectedId: "a"), "b")
        XCTAssertEqual(List.conversationTabbable(["a", "b"], activeId: "gone", selectedId: "b"), "b")
        XCTAssertEqual(List.conversationTabbable(["a", "b"], activeId: nil, selectedId: "gone"), "a")
        XCTAssertNil(List.conversationTabbable([String](), activeId: nil))
    }

    func testConversationRoveStepsJumpsAndDoesNotWrap() {
        typealias List = ConversationList<TestChat, EmptyView>
        XCTAssertEqual(List.conversationRove(key: "ArrowDown", current: 0, count: 3), 1)
        XCTAssertEqual(List.conversationRove(key: "ArrowUp", current: 2, count: 3), 1)
        XCTAssertEqual(List.conversationRove(key: "ArrowUp", current: 0, count: 3), 0)
        XCTAssertEqual(List.conversationRove(key: "ArrowDown", current: 2, count: 3), 2)
        XCTAssertEqual(List.conversationRove(key: "Home", current: 2, count: 3), 0)
        XCTAssertEqual(List.conversationRove(key: "End", current: 0, count: 3), 2)
        XCTAssertNil(List.conversationRove(key: "a", current: 0, count: 3))
        XCTAssertNil(List.conversationRove(key: "ArrowDown", current: 0, count: 0))
        XCTAssertEqual(List.conversationRove(key: "ArrowDown", current: -1, count: 3), 0, "no focus yet: the first row")
    }

    // MARK: - AnnotationPin

    func testPinLabelNamesIndexAuthorAndState() {
        XCTAssertEqual(AnnotationPin.annotationPinLabel(3, state: .open), "Comment 3, open")
        XCTAssertEqual(AnnotationPin.annotationPinLabel(3, state: .resolved, author: "Ava"), "Comment 3 by Ava, resolved")
        XCTAssertEqual(AnnotationPin.annotationPinLabel(0, state: .draft), "Comment 1, draft")
        XCTAssertEqual(AnnotationPin.annotationPinLabel(2), "Comment 2, open")
        XCTAssertEqual(AnnotationPin.annotationPinLabel(1, author: "  "), "Comment 1, open")
    }

    func testClampUnitClampsToZeroToOneAndTreatsNaNAsZero() {
        XCTAssertEqual(AnnotationPin.clampUnit(-1), 0)
        XCTAssertEqual(AnnotationPin.clampUnit(2), 1)
        XCTAssertEqual(AnnotationPin.clampUnit(0.4), 0.4)
        XCTAssertEqual(AnnotationPin.clampUnit(.nan), 0)
        XCTAssertEqual(AnnotationPin.clampUnit(.infinity), 0)
    }

    func testPinGeometryPutsTheBodyCentreAboveTheTip() {
        let d: CGFloat = 28
        XCTAssertGreaterThan(AnnotationPin.height(forDiameter: d), d)
        XCTAssertEqual(AnnotationPin.centreRise(diameter: d), AnnotationPin.height(forDiameter: d) - d / 2, accuracy: 1e-9)
    }

    func testTheTeardropEndsInATipOnTheBottomEdge() {
        let rect = CGRect(x: 0, y: 0, width: 28, height: 36)
        let path = Teardrop().path(in: rect)
        XCTAssertEqual(path.boundingRect.maxY, rect.maxY, accuracy: 0.01)
        XCTAssertEqual(path.boundingRect.minY, rect.minY, accuracy: 0.01)
        XCTAssertEqual(path.boundingRect.width, rect.width, accuracy: 0.01)
        XCTAssertTrue(path.contains(CGPoint(x: 14, y: 14)))
        XCTAssertTrue(path.contains(CGPoint(x: 14, y: 33)), "the tip tapers along the centre line")
        XCTAssertFalse(path.contains(CGPoint(x: 2, y: 33)), "and is narrow near the bottom")
    }

    // MARK: - FeedbackPopover

    private static let size = CGSize(width: 200, height: 100)
    private static let box = CGSize(width: 800, height: 600)
    private func place(_ x: CGFloat, _ y: CGFloat, size: CGSize = size, in container: CGSize = box, gap: CGFloat = 8) -> FeedbackPopover<EmptyView, EmptyView>.Placement {
        FeedbackPopover<EmptyView, EmptyView>.placePopover(anchor: CGPoint(x: x, y: y), size: size, container: container, gap: gap)
    }

    func testPlacePopoverPrefersTheRightSide() {
        let p = place(100, 300)
        XCTAssertEqual(p.side, .right)
        XCTAssertEqual(p.left, 108)
        XCTAssertTrue(p.top >= 0 && p.top + Self.size.height <= Self.box.height)
    }

    func testPlacePopoverFlipsLeftBelowAndAboveWhenThePreferredSideOverflows() {
        XCTAssertEqual(place(700, 300).side, .left)
        XCTAssertEqual(place(700, 300).left, 700 - 8 - 200)
        let narrow = CGSize(width: 220, height: 600)
        let below = place(110, 100, in: narrow)
        XCTAssertEqual(below.side, .below)
        XCTAssertEqual(below.top, 108)
        let above = place(110, 560, in: narrow)
        XCTAssertEqual(above.side, .above)
        XCTAssertEqual(above.top, 560 - 8 - 100)
    }

    func testPlacePopoverAlwaysClampsInsideTheContainerEvenWhenNothingFits() {
        let edge = place(790, 590)
        XCTAssertTrue(edge.left >= 0 && edge.left + Self.size.width <= Self.box.width)
        XCTAssertTrue(edge.top >= 0 && edge.top + Self.size.height <= Self.box.height)
        let tiny = place(10, 10, size: CGSize(width: 500, height: 500), in: CGSize(width: 100, height: 100))
        XCTAssertEqual(tiny.left, 0)
        XCTAssertEqual(tiny.top, 0)
        XCTAssertEqual(place(100, 0).top, 0)
    }

    func testPlacePopoverHonoursACustomGap() {
        XCTAssertEqual(place(100, 300, gap: 30).left, 130)
    }

    func testPlacePopoverSurvivesNonFiniteInput() {
        let p = place(.nan, .infinity)
        XCTAssertTrue(p.left.isFinite && p.top.isFinite)
        XCTAssertTrue(p.left >= 0 && p.top >= 0)
    }

    func testCommentTextTrimsAndRefusesBlank() {
        XCTAssertNil(FeedbackPopover<EmptyView, EmptyView>.commentText("   \n"))
        XCTAssertEqual(FeedbackPopover<EmptyView, EmptyView>.commentText("  hi "), "hi")
    }

    // MARK: - AnnotationLayer

    func testNormalizePointMapsTapsToZeroToOneAndClamps() {
        let rect = CGRect(x: 100, y: 50, width: 400, height: 200)
        let normalize = AnnotationLayer<EmptyView, EmptyView>.normalizePoint
        XCTAssertEqual(normalize(300, 150, rect), LayerPoint(x: 0.5, y: 0.5))
        XCTAssertEqual(normalize(0, 0, rect), LayerPoint(x: 0, y: 0))
        XCTAssertEqual(normalize(9999, 9999, rect), LayerPoint(x: 1, y: 1))
        XCTAssertEqual(normalize(10, 10, .zero), LayerPoint(x: 0, y: 0))
        XCTAssertEqual(normalize(.nan, 10, rect), LayerPoint(x: 0, y: 0))
    }

    func testMoveReticleStepsSmallBigWithShiftClampsAndIgnoresOtherKeys() {
        let move = AnnotationLayer<EmptyView, EmptyView>.moveReticle
        let c = LayerPoint(x: 0.5, y: 0.5)
        XCTAssertEqual(move(c, "ArrowRight", false, 0.02, 0.1), LayerPoint(x: 0.52, y: 0.5))
        XCTAssertEqual(move(c, "ArrowLeft", false, 0.02, 0.1), LayerPoint(x: 0.48, y: 0.5))
        XCTAssertEqual(move(c, "ArrowUp", false, 0.02, 0.1), LayerPoint(x: 0.5, y: 0.48))
        XCTAssertEqual(move(c, "ArrowDown", true, 0.02, 0.1), LayerPoint(x: 0.5, y: 0.6))
        XCTAssertEqual(move(LayerPoint(x: 0.99, y: 0), "ArrowRight", true, 0.02, 0.1), LayerPoint(x: 1, y: 0))
        XCTAssertEqual(move(LayerPoint(x: 0, y: 0.01), "ArrowUp", false, 0.02, 0.1), LayerPoint(x: 0, y: 0))
        XCTAssertNil(move(c, "Enter", false, 0.02, 0.1))
        XCTAssertNil(move(c, "a", false, 0.02, 0.1))
        XCTAssertEqual(AnnotationLayer<EmptyView, EmptyView>.moveReticle(c, key: "ArrowRight"), LayerPoint(x: 0.52, y: 0.5), "default step is 2 percent")
    }

    func testEscapeCancelsADraftOrThreadBeforeLeavingCommentMode() {
        XCTAssertEqual(AnnotationLayer<EmptyView, EmptyView>.escapeAction(hasOpenTarget: true), .closeTarget)
        XCTAssertEqual(AnnotationLayer<EmptyView, EmptyView>.escapeAction(hasOpenTarget: false), .leaveMode)
    }

    func testArrowKeysMapToTheNamesTheReticleUnderstands() {
        let name = AnnotationLayer<EmptyView, EmptyView>.arrowName
        XCTAssertEqual(name(.leftArrow), "ArrowLeft")
        XCTAssertEqual(name(.downArrow), "ArrowDown")
        XCTAssertNil(name(.return))
    }

    // MARK: - ActivityItem

    func testActivityMainTagPicksLinkButtonOrPlainRow() {
        XCTAssertEqual(ActivityItem<EmptyView, EmptyView, EmptyView>.activityMainTag(href: URL(string: "https://example.com"), hasAction: true), .link)
        XCTAssertEqual(ActivityItem<EmptyView, EmptyView, EmptyView>.activityMainTag(href: nil, hasAction: true), .button)
        XCTAssertEqual(ActivityItem<EmptyView, EmptyView, EmptyView>.activityMainTag(href: nil, hasAction: false), .plain)
    }

    // MARK: - Rendering

    private struct TestChat: Identifiable { let id: String }

    @MainActor
    func testEveryComponentRendersAtPhoneWidthInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let renderer = ImageRenderer(content: Self.specimens.environment(\.colorScheme, scheme).frame(width: 390))
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage)
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 800)
            try AtomTests.save(image, name: "messaging-feedback-\(scheme)")
        }
    }

    @MainActor
    func testTheAnnotationLayerDrawsItsPinsAndTheDraftOverContent() throws {
        let layer = AnnotationLayer("Landing page", pins: [AnnotationLayerPin(id: "a", x: 0.3, y: 0.5, initials: "AV"),
                                                           AnnotationLayerPin(id: "b", x: 0.7, y: 0.4, state: .resolved)],
                                    isCommenting: .constant(false), draft: .constant(LayerPoint(x: 0.5, y: 0.8)), selection: .constant("a")) {
            RoundedRectangle(cornerRadius: 12).fill(.quaternary).frame(width: 320, height: 220)
        } popover: { _, _ in EmptyView() }
        let renderer = ImageRenderer(content: layer)
        renderer.scale = 2
        let image = try XCTUnwrap(renderer.cgImage)
        XCTAssertEqual(image.width, 640)
        XCTAssertEqual(image.height, 440)
        try AtomTests.save(image, name: "annotation-layer")
    }

    @MainActor
    func testAnAvatarWithNoPeopleDrawsNothing() {
        XCTAssertNil(ImageRenderer(content: GroupAvatar(people: [])).cgImage)
        XCTAssertNil(ImageRenderer(content: SeenBy(people: [])).cgImage)
    }

    private static let people = ["Ava", "Ben", "Cy", "Di", "Ed", "Flo"].map { GroupAvatarPerson(name: $0, initials: String($0.prefix(2))) }

    @MainActor
    private static var specimens: some View {
        VStack(alignment: .leading, spacing: 16) {
            TypingIndicator(names: ["Ava"])
            TypingIndicator(names: ["Ava", "Ben"], variant: .inline)
            ForEach(DeliveryStatus.State.allCases, id: \.self) { DeliveryStatus($0, time: "9:41 AM") }
            SeenBy(people: people)
            UnreadDivider(count: 3)
            HStack { ForEach([1, 2, 3, 4, 6], id: \.self) { GroupAvatar(people: Array(people.prefix($0))) } }
            ConversationListItem(id: "a", title: "Design team", preview: "Ava: see you at 3", time: "9:41 AM", unread: 3, selected: true) {
                GroupAvatar(people: Array(people.prefix(3)))
            }
            ConversationListItem(id: "b", title: "Ben", preview: "maybe", time: "Mon", muted: true, pinned: true, draft: true) {
                GroupAvatar(people: [people[1]])
            }
            ConversationListItem(id: "c", title: "Cy", time: "Sun", typing: ["Cy"]) { GroupAvatar(people: [people[2]]) }
            ConversationList("Conversations", items: [TestChat(id: "x"), TestChat(id: "y")], order: ["y", "x"]) { chat in
                ConversationListItem(id: chat.id, title: chat.id.uppercased(), preview: "hello", time: "now", unread: 120) {
                    GroupAvatar(people: [people[0]])
                }
            }
            ZStack {
                RoundedRectangle(cornerRadius: 12).fill(.quaternary)
                AnnotationPin(index: 1, x: 0.2, y: 0.9)
                AnnotationPin(index: 2, x: 0.45, y: 0.9, selected: true)
                AnnotationPin(index: 3, x: 0.7, y: 0.9, state: .resolved)
                AnnotationPin(index: 4, x: 0.9, y: 0.9, state: .draft, initials: "AV")
            }.frame(height: 80)
            FeedbackPopover(title: "Comment 2", onSubmit: { _ in }) { Text("Ava: can we shorten this?") }
            ActivityItem(actor: "Ava", what: "liked your reply", preview: "Thanks for the thread", time: "2h", unread: true,
                         tone: .accent, onSelect: {}) { GroupAvatar(people: [people[0]]) } badge: { Text("♥") }
            ActivityItem(actor: "Ben", what: "followed you", time: "1d", avatar: { GroupAvatar(people: [people[1]]) }, actions: {
                Button("Follow back") {}
            })
        }
        .padding()
    }
}
