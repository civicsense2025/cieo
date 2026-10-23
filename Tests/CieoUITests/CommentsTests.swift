@testable import CieoUI
import SwiftUI
import XCTest

private final class DeepCommentNode: CommentTreeNode {
    let id: Int
    weak var next: DeepCommentNode?

    init(_ id: Int) { self.id = id }

    var children: [DeepCommentNode] { next.map { [$0] } ?? [] }
}

final class CommentsTests: XCTestCase {
    // MARK: Mention

    func testNormalizeHandleStripsOneAtTrimsAndRejectsWhitespace() {
        XCTAssertEqual(Mention.normalizeHandle("@joelw"), "joelw")
        XCTAssertEqual(Mention.normalizeHandle("  joelw  "), "joelw")
        XCTAssertEqual(Mention.normalizeHandle("@@joelw"), "@joelw")
        XCTAssertEqual(Mention.normalizeHandle("joel w"), "")
        XCTAssertEqual(Mention.normalizeHandle("@"), "")
        XCTAssertEqual(Mention.normalizeHandle(""), "")
        XCTAssertEqual(Mention.normalizeHandle(nil), "")
    }

    func testSafeURLAllowsHttpAndSameAppPathsOnly() {
        for ok in ["https://x.com/a", "http://x.com", "/u/joel", "./a", "../a", "#top", "?q=1"] {
            XCTAssertNotNil(Mention.safeURL(ok), ok)
        }
        let bad = ["javascript:alert(1)", " JavaScript:alert(1)", "java\tscript:alert(1)", "data:text/html,hi", "vbscript:x",
                   "//evil.com", "/\\evil.com", "ftp://x.com", "mailto:a@b.com", "", "x.com/a", "https://"]
        for value in bad { XCTAssertNil(Mention.safeURL(value), value) }
        XCTAssertNil(Mention.safeURL(nil))
        XCTAssertNil(Mention.safeURL("/u/joel", allowRelative: false))
    }

    func testSafeURLRejectsCredentialBearingAbsoluteAddresses() {
        for value in ["https://user:secret@example.com/path", "http://user@example.com/", "https://:secret@example.com/"] {
            XCTAssertNil(Mention.safeURL(value, allowRelative: false), value)
        }
    }

    func testByLineSafeURLRefusesOtherSchemesAndProtocolRelative() {
        XCTAssertNotNil(ByLine<EmptyView, EmptyView>.safeURL("https://a.com/u"))
        XCTAssertNotNil(ByLine<EmptyView, EmptyView>.safeURL("/u/ava"))
        XCTAssertNil(ByLine<EmptyView, EmptyView>.safeURL("javascript:alert(1)"))
        XCTAssertNil(ByLine<EmptyView, EmptyView>.safeURL(" java\tscript:alert(1)"))
        XCTAssertNil(ByLine<EmptyView, EmptyView>.safeURL("//evil.com"))
        XCTAssertNil(ByLine<EmptyView, EmptyView>.safeURL(""))
        XCTAssertNil(ByLine<EmptyView, EmptyView>.safeURL(nil))
        XCTAssertNil(ByLine<EmptyView, EmptyView>.safeURL("mailto:a@b.com"))
    }

    func testVerifiedBadgeSizeFallsBackToMedium() {
        XCTAssertEqual(VerifiedBadge.size("sm"), .sm)
        XCTAssertEqual(VerifiedBadge.size("huge"), .md)
        XCTAssertEqual(VerifiedBadge.size(nil), .md)
    }

    // MARK: RichText

    private func types(_ text: String?) -> [String] {
        RichText.tokenizeRichText(text).map { "\($0.kind.rawValue):\($0.value)" }
    }

    private func links(_ text: String) -> [RichText.Token] {
        RichText.tokenizeRichText(text).filter { $0.kind == .url }
    }

    func testTokenizeFindsUrlsBareDomainsMentionsTagsAndBreaks() {
        XCTAssertEqual(types("Source: x.com/joelw\nthanks @joelw #florida"), [
            "text:Source: ", "url:x.com/joelw", "lineBreak:\n", "text:thanks ", "mention:@joelw", "text: ", "tag:#florida",
        ])
        XCTAssertEqual(links("x.com/joelw")[0].href, "https://x.com/joelw")
        XCTAssertEqual(links("see https://floridapolitics.com/archives/1?a=b#c now")[0].href, "https://floridapolitics.com/archives/1?a=b#c")
        XCTAssertEqual(links("www.example.com/path")[0].href, "https://www.example.com/path")
    }

    func testTokenizeStripsTrailingPunctuationFromUrls() {
        for end in [".", ",", ";", ":", "!", "?", "\"", "'", "?!", ".)", "…"] {
            XCTAssertEqual(links("go to https://a.com/x\(end)")[0].value, "https://a.com/x", "ending \(end)")
        }
        XCTAssertEqual(links("(see https://a.com/x)")[0].value, "https://a.com/x")
        XCTAssertEqual(links("https://en.wikipedia.org/wiki/Foo_(bar)")[0].value, "https://en.wikipedia.org/wiki/Foo_(bar)")
        XCTAssertEqual(links("(https://en.wikipedia.org/wiki/Foo_(bar))")[0].value, "https://en.wikipedia.org/wiki/Foo_(bar)")
        let trimmed = RichText.trimUrl("https://a.com/x).")
        XCTAssertEqual(trimmed.url, "https://a.com/x")
        XCTAssertEqual(trimmed.rest, ").")
        XCTAssertEqual(Array(types("end https://a.com/x.").suffix(2)), ["url:https://a.com/x", "text:."])
    }

    func testTrimUrlUsesLinearWorkForManyUnmatchedClosingParentheses() {
        let closers = String(repeating: ")", count: 8_000)
        let started = ProcessInfo.processInfo.systemUptime
        let (url, rest) = RichText.trimUrl("https://example.com/story" + closers)
        let elapsed = ProcessInfo.processInfo.systemUptime - started
        XCTAssertEqual(url, "https://example.com/story")
        XCTAssertEqual(rest, closers)
        XCTAssertLessThan(elapsed, 2.0, "a long trailing run should be processed in linear time")
    }

    func testTokenizeNeverLinksUnsafeSchemes() {
        let evil = ["javascript:alert(1)", "JAVASCRIPT:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:msgbox(1)",
                    "file:///etc/passwd", "ftp://x.com/a", "blob:https://x.com/uuid", "javascript://x.com/%0Aalert(1)"]
        for value in evil {
            let tokens = RichText.tokenizeRichText("click \(value) now")
            for token in tokens where token.kind == .url {
                XCTAssertTrue(token.href?.lowercased().hasPrefix("http") == true, value)
            }
            XCTAssertEqual(tokens.map(\.value).joined(), "click \(value) now", value)
        }
        XCTAssertEqual(links("javascript:alert(1)").count, 0)
        XCTAssertEqual(links("data:text/html,hi").count, 0)
        let attributed = RichText.attributedString("javascript:alert(1) and <script>alert(1)</script> and <img src=x onerror=alert(1)>")
        XCTAssertTrue(attributed.runs.allSatisfy { $0.link == nil })
        XCTAssertTrue(String(attributed.characters).contains("<script>"))
    }

    func testTokenizeNeverLinksCredentialBearingHosts() {
        for value in ["https://user:secret@example.com/path", "https://trusted.com@evil.example/path"] {
            let tokens = RichText.tokenizeRichText(value)
            XCTAssertFalse(tokens.contains { $0.kind == .url }, value)
            XCTAssertEqual(tokens.map(\.value).joined(), value, "unsafe addresses stay lossless plain text")
        }
    }

    func testEmailsAndMidWordAtAreNotMentions() {
        XCTAssertFalse(RichText.tokenizeRichText("mail a@b.com now").contains { $0.kind == .mention })
        XCTAssertFalse(RichText.tokenizeRichText("a.b@c.org").contains { $0.kind == .mention })
        XCTAssertEqual(links("mail a@b.com now").count, 0)
        XCTAssertFalse(RichText.tokenizeRichText("@@x").contains { $0.kind == .mention && $0.value == "@x" })
        XCTAssertEqual(types("hi @joel."), ["text:hi ", "mention:@joel", "text:."])
        XCTAssertEqual(types("(@joel)"), ["text:(", "mention:@joel", "text:)"])
        XCTAssertEqual(types("@a_b.c"), ["mention:@a_b.c"])
        XCTAssertEqual(types("@"), ["text:@"])
    }

    func testTagsEmojiNewlinesAndEmpties() {
        XCTAssertEqual(types("#fl2026 #1 a#b"), ["tag:#fl2026", "text: #1 a#b"])
        XCTAssertEqual(types("🚀 launch #Nueva_Era ❤️ @maria"), ["text:🚀 launch ", "tag:#Nueva_Era", "text: ❤️ ", "mention:@maria"])
        XCTAssertEqual(types("a\n\n\nb"), ["text:a", "lineBreak:\n", "lineBreak:\n", "lineBreak:\n", "text:b"])
        XCTAssertEqual(types("a\r\nb"), ["text:a", "lineBreak:\n", "text:b"])
        XCTAssertEqual(RichText.tokenizeRichText(""), [])
        XCTAssertEqual(RichText.tokenizeRichText(nil), [])
        XCTAssertEqual(links("anchor https://a.com/#frag").count, 1)
        XCTAssertEqual(types("v1.2.3 and e.g. 3.5/4"), ["text:v1.2.3 and e.g. 3.5/4"])
        XCTAssertEqual(links("visit example.com today").count, 0)
    }

    func testTokenizeIsLossless() {
        for sample in ["Source: x.com/joelw\n#tag @me (https://a.com/b).", "a\n\nb", "🚀 https://a.com/x?y=1&z=2!", "plain"] {
            XCTAssertEqual(RichText.tokenizeRichText(sample).map(\.value).joined(), sample)
        }
    }

    func testShortenUrlKeepsTheParsedHostAndEllipsizesOnlyTheSuffix() {
        XCTAssertEqual(RichText.shortenUrl("https://www.example.com/"), "www.example.com")
        XCTAssertEqual(RichText.shortenUrl("http://x.com/joelw"), "x.com/joelw")
        let long = RichText.shortenUrl("https://floridapolitics.com/archives/123456/long-story")
        XCTAssertEqual(long.unicodeScalars.count, 28)
        XCTAssertTrue(long.hasSuffix("…"))
        XCTAssertTrue(long.hasPrefix("floridapolitics.com/archive"))
        XCTAssertEqual(RichText.shortenUrl("x.com/abcdefghij", max: 5), "x.com")
        XCTAssertEqual(RichText.shortenUrl("abc", max: 0), "abc")
        XCTAssertEqual(RichText.shortenUrl("", max: 10), "")
        XCTAssertLessThanOrEqual(RichText.shortenUrl("https://a.com/🚀🚀🚀🚀", max: 9).unicodeScalars.count, 9)
    }

    func testShortenUrlKeepsTheFullParsedHostWhenItExceedsTheDisplayLimit() {
        XCTAssertEqual(RichText.shortenUrl("https://service.example.attacker.test/a/long/path", max: 12),
                       "service.example.attacker.test")
    }

    func testAttributedStringLinksShortenedTextToTheFullAddress() throws {
        let text = RichText.attributedString("Source: x.com/joelw\nhi @joelw #fl",
                                             mentionURL: { "/u/\($0)" }, tagURL: { "/t/\($0)" })
        let linked = text.runs.filter { $0.link != nil }.map { (String(text[$0.range].characters), $0.link!.absoluteString) }
        XCTAssertEqual(linked.map(\.0), ["x.com/joelw", "@joelw", "#fl"])
        XCTAssertEqual(linked.map(\.1), ["https://x.com/joelw", "/u/joelw", "/t/fl"])
        XCTAssertTrue(String(text.characters).contains("\n"))
        let plain = RichText.attributedString("@joelw #fl")
        XCTAssertTrue(plain.runs.allSatisfy { $0.link == nil }, "no closures, no links")
        let evil = RichText.attributedString("@joelw", mentionURL: { _ in "javascript:alert(1)" })
        XCTAssertTrue(evil.runs.allSatisfy { $0.link == nil })
        let cut = RichText.attributedString("https://floridapolitics.com/archives/123456/long", maxUrlLength: 12)
        let run = try XCTUnwrap(cut.runs.first)
        XCTAssertEqual(String(cut[run.range].characters), "floridapolitics.com")
        XCTAssertEqual(run.link?.absoluteString, "https://floridapolitics.com/archives/123456/long")
    }

    // MARK: LinkPreview

    func testDisplayDomainReturnsTheExactParsedHost() {
        XCTAssertEqual(LinkPreview.displayDomain("https://www.floridapolitics.com/a/b"), "www.floridapolitics.com")
        XCTAssertEqual(LinkPreview.displayDomain("http://x.com"), "x.com")
        XCTAssertEqual(LinkPreview.displayDomain("not a url"), "")
        XCTAssertEqual(LinkPreview.displayDomain("javascript:alert(1)"), "")
        XCTAssertEqual(LinkPreview.displayDomain(""), "")
    }

    func testDisplayDomainRejectsCredentialAddressesAndRetainsSubdomains() {
        XCTAssertEqual(LinkPreview.displayDomain("https://media.example.com/article"), "media.example.com")
        XCTAssertEqual(LinkPreview.displayDomain("https://user:secret@example.com/article"), "")
    }

    func testLinkPreviewKeepsDestinationHostBesideOptionalBranding() {
        XCTAssertEqual(LinkPreview.siteLabel(url: "https://media.example.com/article", siteName: "Daily Journal"),
                       "media.example.com · Daily Journal")
        XCTAssertEqual(LinkPreview.siteLabel(url: "https://media.example.com/article", siteName: nil), "media.example.com")
    }

    // MARK: NewItemsPill

    func testNewItemsLabelPluralizesAndClamps() {
        XCTAssertEqual(NewItemsPill.newItemsLabel(1), "1 new reply")
        XCTAssertEqual(NewItemsPill.newItemsLabel(3), "3 new replies")
        XCTAssertEqual(NewItemsPill.newItemsLabel(1200), "1,200 new replies")
        XCTAssertEqual(NewItemsPill.newItemsLabel(0), "0 new replies")
        XCTAssertEqual(NewItemsPill.newItemsLabel(-4), "0 new replies")
        XCTAssertEqual(NewItemsPill.clampNewItems(.infinity), 0)
        XCTAssertEqual(NewItemsPill.clampNewItems(.nan), 0)
        XCTAssertEqual(NewItemsPill.clampNewItems(2.9), 2)
    }

    func testNewItemsAnnouncementSpeaksOnFirstAppearanceOnly() {
        let say: (Int) -> String = { "\($0) new" }
        XCTAssertEqual(NewItemsPill.announcement(previous: 0, next: 3, label: say), "3 new")
        XCTAssertNil(NewItemsPill.announcement(previous: 3, next: 4, label: say))
        XCTAssertEqual(NewItemsPill.announcement(previous: 4, next: 0, label: say), "")
        XCTAssertEqual(NewItemsPill.announcement(previous: 0, next: 0, label: say), "")
        XCTAssertEqual(NewItemsPill.announcement(previous: 0, next: 1, label: say), "1 new")
    }

    func testSplitNewItemsLabelSeparatesTheRollingNumber() {
        let rolling = NewItemsPill.splitNewItemsLabel("3 new replies", count: 3)
        XCTAssertTrue(rolling.rolls)
        XCTAssertEqual(rolling.rest, " new replies")
        let whole = NewItemsPill.splitNewItemsLabel("Nuevas: 3", count: 3)
        XCTAssertFalse(whole.rolls)
        XCTAssertEqual(whole.rest, "Nuevas: 3")
    }

    // MARK: ReplyPreview and CharacterCountRing

    func testReplyLabels() {
        XCTAssertEqual(ReplyPreview.dismissLabel("Ava"), "Cancel reply to Ava")
        XCTAssertEqual(ReplyPreview.jumpLabel("Ava"), "Go to the message from Ava")
    }

    func testRingStateFractionRemainingToneAndCountdown() {
        typealias Ring = CharacterCountRing
        XCTAssertEqual(Ring.ringState(length: 0, max: 280), .init(fraction: 0, remaining: 280, tone: .normal, showNumber: false))
        XCTAssertEqual(Ring.ringState(length: 140, max: 280).fraction, 0.5)
        XCTAssertEqual(Ring.ringState(length: 260, max: 280), .init(fraction: 260.0 / 280.0, remaining: 20, tone: .warning, showNumber: true))
        XCTAssertEqual(Ring.ringState(length: 259, max: 280).tone, .normal)
        XCTAssertEqual(Ring.ringState(length: 280, max: 280), .init(fraction: 1, remaining: 0, tone: .warning, showNumber: true))
        XCTAssertEqual(Ring.ringState(length: 283, max: 280), .init(fraction: 1, remaining: -3, tone: .danger, showNumber: true))
        XCTAssertEqual(Ring.ringState(length: 95, max: 100, warnAt: 5).tone, .warning)
        XCTAssertFalse(Ring.ringState(length: 94, max: 100, warnAt: 5).showNumber)
    }

    func testRingStateClampsBadInput() {
        typealias Ring = CharacterCountRing
        XCTAssertEqual(Ring.ringState(length: Double.nan, max: 100.0).fraction, 0)
        XCTAssertEqual(Ring.ringState(length: -5, max: 100).remaining, 100)
        XCTAssertEqual(Ring.ringState(length: 5.0, max: Double.nan).fraction, 1)
        XCTAssertEqual(Ring.ringState(length: 5, max: 0).tone, .danger)
        XCTAssertEqual(Ring.ringState(length: 1.0, max: 10.0, warnAt: Double.nan).remaining, 9)
    }

    func testRingAnnouncement() {
        XCTAssertEqual(CharacterCountRing.announcement(remaining: 12), "12 characters left")
        XCTAssertEqual(CharacterCountRing.announcement(remaining: 1), "1 character left")
        XCTAssertEqual(CharacterCountRing.announcement(remaining: -3), "3 characters over the limit")
    }

    // MARK: Comment helpers

    func testCommentDepthAndRail() {
        typealias C = Comment<EmptyView, EmptyView>
        XCTAssertEqual(C.commentDepth(nil as Int?), 0)
        XCTAssertEqual(C.commentDepth(-2), 0)
        XCTAssertEqual(C.commentDepth(Double.nan), 0)
        XCTAssertEqual(C.commentDepth(2.7), 2)
        XCTAssertFalse(C.commentHasRail(railed: false, hasReplies: false))
        XCTAssertTrue(C.commentHasRail(railed: true, hasReplies: false))
        XCTAssertTrue(C.commentHasRail(railed: false, hasReplies: true))
    }

    // MARK: CommentThread helpers

    struct Item: FlatComment, Equatable {
        let id: String
        var parentID: String?
        var text = ""
        init(_ id: String, parent: String? = nil, text: String = "") { self.id = id; parentID = parent; self.text = text }
    }

    func testBuildCommentTreeKeepsOrderMakesOrphansRootsDropsDuplicatesAndSurvivesCycles() {
        let flat = [Item("a"), Item("b", parent: "a"), Item("c", parent: "a"), Item("d", parent: "b"),
                    Item("x", parent: "missing"), Item("e", parent: nil), Item("a")]
        let tree = CommentTree.buildCommentTree(flat: flat)
        XCTAssertEqual(tree.map(\.id), ["a", "x", "e"])
        XCTAssertEqual(tree[0].children.map(\.id), ["b", "c"])
        XCTAssertEqual(tree[0].children[0].children.map(\.id), ["d"])
        XCTAssertEqual(CommentTree.buildCommentTree(flat: [Item]()).count, 0)
        let loop = CommentTree.buildCommentTree(flat: [Item("p", parent: "q"), Item("q", parent: "p"), Item("s", parent: "s")])
        XCTAssertEqual(loop.count, 2)
        XCTAssertEqual(CommentTree.countDescendants(loop[0]) + CommentTree.countDescendants(loop[1]) + loop.count, 3)
        XCTAssertEqual(CommentTree.buildCommentTree(flat: [Item("k", parent: "k")]).count, 1)

        let orderedCycle = CommentTree.buildCommentTree(flat: [Item("a", parent: "b"), Item("b", parent: "c"), Item("c", parent: "a")])
        XCTAssertEqual(orderedCycle.map(\.id), ["c"])
        XCTAssertEqual(orderedCycle[0].children.map(\.id), ["b"])
        XCTAssertEqual(orderedCycle[0].children[0].children.map(\.id), ["a"])
    }

    func testBuildCommentTreeHandlesLongChainsWithoutRecursiveConstruction() {
        let count = 10_000
        let flat = (0..<count).map { index in
            Item(String(index), parent: index == 0 ? nil : String(index - 1))
        }
        let roots = CommentTree.buildCommentTree(flat: flat)
        XCTAssertEqual(roots.map(\.id), ["0"])

        var node = roots[0]
        var visited = 1
        while let child = node.children.first {
            node = child
            visited += 1
        }
        XCTAssertEqual(visited, count)
    }

    func testBuildCommentTreeCarriesHostFieldsThrough() {
        let root = CommentTree.buildCommentTree(flat: [Item("a", text: "hello"), Item("b", parent: "a", text: "reply")])[0]
        XCTAssertEqual(root.item.text, "hello")
        XCTAssertEqual(root.children[0].item.text, "reply")
    }

    func testCountDescendantsCountsEveryDepthOnce() {
        XCTAssertEqual(CommentTree.countDescendants(nil as CommentNode<Item>?), 0)
        XCTAssertEqual(CommentTree.countDescendants(CommentNode(item: Item("a"))), 0)
        let tree = CommentNode(item: Item("a"), children: [
            CommentNode(item: Item("b"), children: [CommentNode(item: Item("c"))]), CommentNode(item: Item("d")),
        ])
        XCTAssertEqual(CommentTree.countDescendants(tree), 3)
        let repeated = CommentNode(item: Item("a"), children: [CommentNode(item: Item("b")), CommentNode(item: Item("b"))])
        XCTAssertEqual(CommentTree.countDescendants(repeated), 1, "a repeated id is counted once")
    }

    func testVisibleRepliesShowsTheFirstNUntilExpanded() {
        let kids = ["a", "b", "c", "d", "e"]
        func check(_ expanded: Bool, _ initial: Int, _ visible: [String], _ hidden: Int, line: UInt = #line) {
            let result = CommentTree.visibleReplies(children: kids, expanded: expanded, initial: initial)
            XCTAssertEqual(result.visible, visible, line: line)
            XCTAssertEqual(result.hidden, hidden, line: line)
        }
        check(false, 2, ["a", "b"], 3)
        check(true, 2, kids, 0)
        check(false, 9, kids, 0)
        check(false, 0, [], 5)
        check(false, -3, [], 5)
        XCTAssertEqual(CommentTree.visibleReplies(children: nil as [String]?, expanded: false, initial: 2).hidden, 0)
        XCTAssertEqual(CommentTree.moreRepliesLabel(3), "View 3 more replies")
        XCTAssertEqual(CommentTree.moreRepliesLabel(1), "View 1 more reply")
    }

    func testFlattenRepliesListsDescendantsDepthFirst() {
        let tree = [
            CommentNode(item: Item("b"), children: [CommentNode(item: Item("c"), children: [CommentNode(item: Item("d"))])]),
            CommentNode(item: Item("e")),
        ]
        XCTAssertEqual(CommentTree.flattenReplies(tree).map(\.id), ["b", "c", "d", "e"])
    }

    func testFlattenRepliesHandlesDeepTreesWithoutRecursion() {
        let count = 20_000
        let nodes = (0..<count).map(DeepCommentNode.init)
        for index in 0..<(count - 1) { nodes[index].next = nodes[index + 1] }

        let flattened = CommentTree.flattenReplies([nodes[0]])
        XCTAssertEqual(flattened.count, count)
        XCTAssertEqual(flattened.first?.id, 0)
        XCTAssertEqual(flattened.last?.id, count - 1)
    }

    func testLevelEntriesFlattenAtTheDepthCapAndStopPastIt() {
        let children = [CommentNode(item: Item("b"), children: [CommentNode(item: Item("c"))])]
        typealias Thread = CommentThread<CommentNode<Item>, EmptyView>

        XCTAssertEqual(Thread.levelEntries(children, level: 3, maxDepth: 3).map(\.id), ["b", "c"])
        XCTAssertTrue(Thread.levelEntries(children, level: 4, maxDepth: 3).isEmpty)
        XCTAssertEqual(Thread.levelEntries(children, level: 32, maxDepth: Int.max).map(\.id), ["b", "c"])
        XCTAssertTrue(Thread.levelEntries(children, level: 33, maxDepth: Int.max).isEmpty)
    }

    // MARK: CommentComposer helpers

    func testCanSubmitCoversEmptyWhitespaceAttachmentsLimitPendingAndDisabled() {
        typealias C = CommentComposer
        XCTAssertFalse(C.canSubmit(text: ""))
        XCTAssertFalse(C.canSubmit(text: "   \n"))
        XCTAssertTrue(C.canSubmit(text: "hi"))
        XCTAssertTrue(C.canSubmit(text: "", hasAttachments: true))
        XCTAssertTrue(C.canSubmit(text: "hello", maxLength: 5))
        XCTAssertFalse(C.canSubmit(text: "hello!", maxLength: 5))
        XCTAssertFalse(C.canSubmit(text: "hi", isPending: true))
        XCTAssertFalse(C.canSubmit(text: "hi", isDisabled: true))
        XCTAssertFalse(C.canSubmit(text: "", hasAttachments: true, isPending: true))
        XCTAssertEqual(C.composerLength("a😀b"), 3)
        XCTAssertTrue(C.canSubmit(text: "😀😀", maxLength: 2))
        XCTAssertEqual(C.submittedText("  hi there \n"), "hi there")
    }

    func testShowsCountAppearsAtEightyPercentOnlyWithALimit() {
        XCTAssertFalse(CommentComposer.showsCount(length: 79, maxLength: 100))
        XCTAssertTrue(CommentComposer.showsCount(length: 80, maxLength: 100))
        XCTAssertFalse(CommentComposer.showsCount(length: 500, maxLength: nil))
        XCTAssertFalse(CommentComposer.showsCount(length: 5, maxLength: 0))
    }

    func testKeyActionCommandReturnPostsReturnIsANewlineEscapeCancelsAReply() {
        typealias C = CommentComposer
        XCTAssertEqual(C.keyAction(key: .return, modifiers: .command, replying: false), .submit)
        XCTAssertNil(C.keyAction(key: .return, modifiers: [], replying: false))
        XCTAssertEqual(C.keyAction(key: .escape, modifiers: [], replying: true), .cancelReply)
        XCTAssertNil(C.keyAction(key: .escape, modifiers: [], replying: false))
    }

    // MARK: Rendering

    @MainActor
    private func height<V: View>(_ view: V, width: CGFloat = 390, scheme: ColorScheme = .light) throws -> Int {
        let renderer = ImageRenderer(content: view.environment(\.colorScheme, scheme).frame(width: width))
        renderer.scale = 2
        return try XCTUnwrap(renderer.cgImage).height
    }

    @MainActor
    func testEveryComponentRendersAtPhoneWidthInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let view = Self.specimens
            let renderer = ImageRenderer(content: view.environment(\.colorScheme, scheme).frame(width: 390))
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage)
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 600)
            try AtomTests.save(image, name: "comments-\(scheme)")
        }
    }

    @MainActor
    func testRepliesAddHeightAndADeletedCommentKeepsThem() throws {
        func node(_ state: Comment<Color, Text>.State, replies: Bool) -> some View {
            let base = Comment(author: "Ava", state: state, avatar: { Color.gray }, content: { Text("Hello") })
            return Group {
                if replies {
                    base.replies { Comment(author: "Bo", depth: 1, avatar: { Color.gray }, content: { Text("Reply") }) }
                } else { base }
            }
        }
        let alone = try height(node(.default, replies: false))
        let withReply = try height(node(.default, replies: true))
        let deletedWithReply = try height(node(.deleted, replies: true))
        XCTAssertGreaterThan(withReply, alone)
        XCTAssertGreaterThan(deletedWithReply, alone, "a deleted comment keeps its replies")
    }

    @MainActor
    func testFailedCommentShowsAStatusLineAndPendingAddsPosting() throws {
        func comment(_ state: Comment<Color, Text>.State) -> some View {
            Comment(author: "Ava", state: state, avatar: { Color.gray }, content: { Text("Hello") })
        }
        let plain = try height(comment(.default))
        XCTAssertGreaterThan(try height(comment(.failed)), plain)
        XCTAssertGreaterThan(try height(comment(.pending)), plain)
    }

    @MainActor
    func testCompactCardIsShorterThanLargeAndLoadingKeepsAFootprint() throws {
        func card(_ variant: LinkPreview.Variant, loading: Bool = false) -> some View {
            LinkPreview(url: "https://example.com/a", title: "A headline", summary: "Summary", image: .init(src: "https://example.com/i.jpg"),
                        variant: variant, loading: loading)
        }
        XCTAssertGreaterThan(try height(card(.large)), try height(card(.compact)))
        XCTAssertGreaterThan(try height(card(.large, loading: true)), 0)
    }

    @MainActor
    func testComposerGrowsWithTheReplyAndShowsPostDisabledWhenEmpty() throws {
        let plain = try height(CommentComposer(text: .constant(""), onSubmit: { _ in }))
        let replying = try height(CommentComposer(text: .constant(""), replyingTo: .init(author: "Ava", excerpt: "Hello"),
                                                  onCancelReply: {}, onSubmit: { _ in }))
        XCTAssertGreaterThan(replying, plain)
    }

    @MainActor
    func testThreadRendersTopLevelRepliesAndTheMoreButtonCountsWhatIsHidden() throws {
        let items = [Item("r1"), Item("a", parent: "r1"), Item("b", parent: "r1"), Item("c", parent: "r1"), Item("d", parent: "r1")]
        let tree = CommentTree.buildCommentTree(flat: items)
        func thread(expanded: Set<String>) -> some View {
            CommentThread(label: "Comments", items: tree, expanded: .constant(expanded)) { node, depth, replies in
                Comment(author: node.id, depth: depth, avatar: { Color.gray }, content: { Text("text") }).replies { replies }
            }
        }
        XCTAssertGreaterThan(try height(thread(expanded: ["r1"])), try height(thread(expanded: [])), "expanding reveals the rest")
    }

    @MainActor
    static var specimens: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack { Text("ginandtanic"); VerifiedBadge() }
            RichText("Source: x.com/joelw hi @joelw #fl", mentionURL: { "/u/\($0)" })
            ByLine(author: "ginandtanic", time: "1d") { VerifiedBadge(size: .sm) } context: { Text("midterms 2026") }
            Mention(handle: "joelw", href: "https://x.com/joelw")
            ReplyPreview(author: "Ava", excerpt: "Hello there", variant: .composer, onDismiss: {})
            CharacterCountRing(length: 268, max: 280)
            NewItemsPill(count: 3, onShow: {})
            LinkPreview(url: "https://example.com/a", title: "A headline that is long enough to wrap onto a second line of text", variant: .compact)
            Comment(author: "Ava", time: "1d", state: .highlighted, avatar: { Color.gray }, content: { Text("Hello") })
                .replies { Comment(author: "Bo", depth: 1, avatar: { Color.gray }, content: { Text("Hi") }) }
            CommentComposer(text: .constant("draft"), maxLength: 5, onSubmit: { _ in })
        }
        .padding()
    }
}
