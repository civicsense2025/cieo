import CieoUI
import SwiftUI
import XCTest

/// Pins that the row, notice, panel and field molecules read their type, glyphs, colours and spacing
/// from the host, so a host value changes the rendered output.
final class SlotsMoleculeRowsTests: XCTestCase {
    private static let red = Color(red: 1, green: 0, blue: 0)

    /// A solid red glyph in place of every icon the host passes through, or only the ones `only` names.
    private static func redGlyphs(only: ComponentIcon? = nil) -> ComponentIcons {
        ComponentIcons { icon in
            if only == nil || only == icon { red.frame(width: 20, height: 20) } else { Color.clear.frame(width: 20, height: 20) }
        }
    }

    @MainActor
    private func image<V: View>(_ view: V) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view.frame(width: 300)).cgImage)
    }

    @MainActor
    private func height<V: View>(_ view: V) throws -> Int {
        try image(view).height
    }

    // MARK: ActionRow

    @MainActor
    func testActionRowHeadingFollowsHostHeadingType() throws {
        func row(_ typography: ComponentTypography) -> some View {
            ActionRow("Your ZIP code", detail: "Find your races", actionTitle: "Set ZIP") {}
                .environment(\.componentTypography, typography)
        }
        let big = ComponentTypography(heading: .system(size: 60))
        XCTAssertGreaterThan(try height(row(big)), try height(row(ComponentTypography())))
    }

    // MARK: PreferenceRow

    @MainActor
    func testPreferenceRowHeadingFollowsHostHeadingType() throws {
        func row(_ typography: ComponentTypography) -> some View {
            PreferenceRow("Notifications", detail: "A local toggle.", isOn: .constant(true))
                .environment(\.componentTypography, typography)
        }
        let big = ComponentTypography(heading: .system(size: 60))
        XCTAssertGreaterThan(try height(row(big)), try height(row(ComponentTypography())))
    }

    @MainActor
    func testPreferenceRowTouchTargetFollowsHostMetrics() throws {
        let row = PreferenceRow("Notifications", detail: "A local toggle.", isOn: .constant(false))
            .environment(\.componentMetrics, ComponentMetrics(touchTarget: 90))
        XCTAssertGreaterThanOrEqual(try height(row), 90)
    }

    // MARK: Notice

    @MainActor
    func testNoticeIconDrawsTheHostGlyph() throws {
        let host = Notice("Saved locally", detail: "Stays on this screen.", icon: .check)
            .environment(\.componentIcons, Self.redGlyphs())
        XCTAssertTrue(ComponentIconTests.containsRed(try image(host)), "the notice's glyph is the host glyph")
        let plain = Notice("Saved locally", detail: "Stays on this screen.", icon: .check)
        XCTAssertFalse(ComponentIconTests.containsRed(try image(plain)))
    }

    @MainActor
    func testNoticeSymbolInitStillRendersItsSymbol() throws {
        let notice = Notice("Saved locally", detail: "Stays on this screen.", symbol: "checkmark.circle.fill")
        XCTAssertGreaterThan(try height(notice), 0)
        XCTAssertFalse(ComponentIconTests.containsRed(try image(notice)), "a symbol takes no host glyph colour")
    }

    @MainActor
    func testNoticeHeadingFollowsHostHeadingType() throws {
        func notice(_ typography: ComponentTypography) -> some View {
            Notice("Saved locally", detail: "Stays on this screen.").environment(\.componentTypography, typography)
        }
        let big = ComponentTypography(heading: .system(size: 60))
        XCTAssertGreaterThan(try height(notice(big)), try height(notice(ComponentTypography())))
    }

    // MARK: ExpandablePanel

    @MainActor
    func testExpandablePanelTitleFollowsHostHeadingType() throws {
        func panel(_ typography: ComponentTypography) -> some View {
            ExpandablePanel("How this works", isExpanded: .constant(false)) { Text("Body") }
                .environment(\.componentTypography, typography)
        }
        let big = ComponentTypography(heading: .system(size: 60))
        XCTAssertGreaterThan(try height(panel(big)), try height(panel(ComponentTypography())))
    }

    @MainActor
    func testExpandablePanelTouchTargetFollowsHostMetrics() throws {
        let panel = ExpandablePanel("How this works", isExpanded: .constant(false)) { Text("Body") }
            .environment(\.componentMetrics, ComponentMetrics(touchTarget: 90))
        XCTAssertGreaterThanOrEqual(try height(panel), 90)
    }

    @MainActor
    func testExpandablePanelCanOwnItsOpenState() throws {
        let closed = try height(ExpandablePanel("How this works") { Text("Body").frame(height: 120) })
        let open = try height(ExpandablePanel("How this works", initiallyExpanded: true) { Text("Body").frame(height: 120) })
        XCTAssertGreaterThan(open, closed, "an owned panel starts open when asked")
        let bound = try height(ExpandablePanel("How this works", isExpanded: .constant(true)) { Text("Body").frame(height: 120) })
        XCTAssertEqual(open, bound, "owned and bound panels draw the same open state")
    }

    @MainActor
    func testExpandablePanelTakesVerbatimAndTextTitles() throws {
        let fromDatabase: String = "Senate votes, 2024"
        let verbatim = try height(ExpandablePanel(fromDatabase, isExpanded: .constant(false)) { Text("Body") })
        let text = try height(ExpandablePanel(Text(verbatim: fromDatabase)) { Text("Body") })
        let key = try height(ExpandablePanel("Senate votes, 2024", isExpanded: .constant(false)) { Text("Body") })
        XCTAssertEqual(verbatim, key)
        XCTAssertEqual(text, key)
    }

    @MainActor
    func testExpandablePanelAccessoryDrawsInTheHostDetailType() throws {
        func panel(_ typography: ComponentTypography) -> some View {
            ExpandablePanel(Text(verbatim: "Votes")) { Text("Body") } accessory: { Text(verbatim: "12") }
                .environment(\.componentTypography, typography)
                .environment(\.componentMetrics, ComponentMetrics(touchTarget: 20))
        }
        XCTAssertGreaterThan(try height(panel(ComponentTypography(detail: .system(size: 90)))),
                             try height(panel(ComponentTypography())))
        let red = ExpandablePanel(Text(verbatim: "Votes"), isExpanded: .constant(false)) { Text("Body") } accessory: {
            Self.red.frame(width: 20, height: 20)
        }
        XCTAssertTrue(ComponentIconTests.containsRed(try image(red)), "the accessory draws on the title row")
    }

    /// `swift test` has no accessibility tree, so the spoken contract is pinned in the source: a string title
    /// is never a localization key, and the title row (title plus accessory) reads as one element.
    func testExpandablePanelTitleIsVerbatimAndTheRowReadsAsOne() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let source = try String(contentsOf: root.appendingPathComponent("Sources/CieoUI/Molecules/ExpandablePanel.swift"), encoding: .utf8)
        XCTAssertTrue(source.contains("Text(verbatim: String(title))"))
        XCTAssertFalse(source.contains("LocalizedStringKey(title"), "a string is never promoted to a key")
        XCTAssertTrue(source.contains(".frame(minHeight: metrics.touchTarget)\n        .accessibilityElement(children: .combine)"))
    }

    // MARK: LabeledField

    @MainActor
    func testLabeledFieldErrorUsesTheDangerTone() throws {
        let theme = Theme(danger: Self.red)
        let withError = LabeledField("Title", text: .constant(""), error: "Enter a title.")
            .environment(\.componentTheme, theme)
        XCTAssertTrue(ComponentIconTests.containsRed(try image(withError)), "the error is drawn in the danger colour")
        let withoutError = LabeledField("Title", text: .constant(""))
            .environment(\.componentTheme, theme)
        XCTAssertFalse(ComponentIconTests.containsRed(try image(withoutError)), "no error, no danger colour")
    }

    @MainActor
    func testLabeledFieldErrorGlyphIsTheHostGlyph() throws {
        let field = LabeledField("Title", text: .constant(""), error: "Enter a title.")
            .environment(\.componentIcons, Self.redGlyphs(only: .error))
            .environment(\.componentTheme, Theme(danger: .gray))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(field)), "the error glyph is the host glyph")
    }

    // MARK: SearchField

    @MainActor
    func testSearchFieldDrawsTheHostSearchGlyph() throws {
        let field = SearchField("Search", text: .constant(""))
            .environment(\.componentIcons, Self.redGlyphs(only: .search))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(field)))
    }

    @MainActor
    func testSearchFieldClearButtonAppearsOnlyWhileTyping() throws {
        func field(_ text: String) -> some View {
            SearchField("Search", text: .constant(text)).environment(\.componentIcons, Self.redGlyphs(only: .clear))
        }
        XCTAssertFalse(ComponentIconTests.containsRed(try image(field(""))), "the clear button is hidden when empty")
        XCTAssertTrue(ComponentIconTests.containsRed(try image(field("Ballot"))), "the host clear glyph shows once there is text")
    }

    @MainActor
    func testSearchFieldSurfaceFollowsTheHostTheme() throws {
        let field = SearchField("Search", text: .constant(""))
            .environment(\.componentTheme, Theme(surface: Self.red))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(field)), "the field surface is the host surface colour")
    }

    @MainActor
    func testSearchFieldTouchTargetFollowsHostMetrics() throws {
        let field = SearchField("Search", text: .constant("")).environment(\.componentMetrics, ComponentMetrics(touchTarget: 90))
        XCTAssertGreaterThanOrEqual(try height(field), 90)
    }

    func testToggleAndNoticeTextIsNotAnnouncedAsAHeading() throws {
        // A toggle's title labels the switch; a notice is one combined element. Neither is a section heading.
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        for file in ["PreferenceRow", "Notice"] {
            let source = try String(contentsOf: root.appendingPathComponent("Sources/CieoUI/Molecules/\(file).swift"), encoding: .utf8)
            XCTAssertTrue(source.contains("isHeader: false"), "\(file) labels its control, not a heading")
        }
    }
}
