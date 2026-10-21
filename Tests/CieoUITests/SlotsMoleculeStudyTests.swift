import CieoUI
import SwiftUI
import XCTest

/// Pins that the four molecules (IndexRow, NumberedSteps, InfoButton, SectionHeader) read their type,
/// colour, spacing, glyphs and touch target from the host slots, so one host value restyles them.
final class SlotsMoleculeStudyTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)

    @MainActor
    private func image<V: View>(_ view: V) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view.frame(width: 300)).cgImage)
    }

    @MainActor
    private func height<V: View>(_ view: V) throws -> Int {
        try image(view).height
    }

    func testIndexRowKeepsItsRankAndBarContract() {
        XCTAssertEqual(IndexRow.rank(0), "01")
        XCTAssertEqual(IndexRow.rank(9), "10")
        XCTAssertEqual(IndexRow.barFraction(2), 1)
        XCTAssertEqual(IndexRow.barFraction(-1), 0)
        XCTAssertNil(IndexRow.barFraction(.nan))
    }

    @MainActor
    func testIndexRowTitleReadsTheHostTypography() throws {
        let plain = try height(IndexRow(rank: nil, title: Text("Turnout"), note: Text("Last four"), showsDisclosure: false))
        let big = try height(IndexRow(rank: nil, title: Text("Turnout"), note: Text("Last four"), showsDisclosure: false)
            .environment(\.componentTypography, ComponentTypography(strongHeading: .system(size: 60))))
        XCTAssertGreaterThan(big, plain)
    }

    @MainActor
    func testIndexRowBarReadsTheHostThinBarAndSpacing() throws {
        let row = IndexRow(rank: nil, title: Text("Turnout"), fraction: 0.5, showsDisclosure: false)
        let plain = try height(row)
        let thick = try height(row.environment(\.componentMetrics, ComponentMetrics(thinBar: 60)))
        XCTAssertGreaterThan(thick, plain, "a thicker host bar makes the row taller")
        let roomy = try height(IndexRow(rank: nil, title: Text("Turnout"), showsDisclosure: false)
            .environment(\.componentMetrics, ComponentMetrics(compact: 30)))
        let tight = try height(IndexRow(rank: nil, title: Text("Turnout"), showsDisclosure: false))
        XCTAssertGreaterThan(roomy, tight, "the row's vertical padding is a host spacing step")
    }

    @MainActor
    func testIndexRowBarAndRankUseTheHostAccent() throws {
        let themed = IndexRow(rank: "01", title: Text("Turnout"), fraction: 1, showsDisclosure: false)
            .environment(\.componentTheme, Theme(accent: red))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(themed)))
        let plain = IndexRow(rank: "01", title: Text("Turnout"), fraction: 1, showsDisclosure: false)
        XCTAssertFalse(ComponentIconTests.containsRed(try image(plain)))
    }

    @MainActor
    func testIndexRowDisclosureDrawsTheHostGlyph() throws {
        let host = ComponentIcons { _ in Color(red: 1, green: 0, blue: 0).frame(width: 16, height: 16) }
        let row = IndexRow(rank: nil, title: Text("Turnout")).environment(\.componentIcons, host)
        XCTAssertTrue(ComponentIconTests.containsRed(try image(row)))
        let hidden = IndexRow(rank: nil, title: Text("Turnout"), showsDisclosure: false).environment(\.componentIcons, host)
        XCTAssertFalse(ComponentIconTests.containsRed(try image(hidden)))
    }

    @MainActor
    func testNumberedStepsReadTheHostSpacingAndHeadingRole() throws {
        let steps = NumberedSteps([(title: "Register", detail: "Bring ID"), (title: "Vote", detail: nil)])
        let plain = try height(steps)
        let loose = try height(steps.environment(\.componentMetrics, ComponentMetrics(loose: 60)))
        XCTAssertGreaterThan(loose, plain, "a looser host step spaces the steps further apart")
        let big = try height(steps.environment(\.componentTypography, ComponentTypography(strongHeading: .system(size: 60))))
        XCTAssertGreaterThan(big, plain)
    }

    @MainActor
    func testNumberedStepsNumeralUsesTheHostAccent() throws {
        let steps = NumberedSteps([(title: "Register", detail: nil)])
        XCTAssertTrue(ComponentIconTests.containsRed(try image(steps.environment(\.componentTheme, Theme(accent: red)))))
        XCTAssertFalse(ComponentIconTests.containsRed(try image(steps)))
    }

    @MainActor
    func testInfoButtonIconStyleDrawsTheHostGlyphAndTouchTarget() throws {
        let group = InfoButton.QuestionGroup("Basics", questions: [.init("What is this?", answer: "A test.")])
        let host = ComponentIcons { _ in Color(red: 1, green: 0, blue: 0).frame(width: 16, height: 16) }
        let button = InfoButton("About this page", groups: [group], style: .icon).environment(\.componentIcons, host)
        XCTAssertTrue(ComponentIconTests.containsRed(try image(button)))
        let plain = InfoButton("About this page", groups: [group], style: .icon)
        XCTAssertFalse(ComponentIconTests.containsRed(try image(plain)))
        let roomy = InfoButton("About this page", groups: [group], style: .icon)
            .environment(\.componentMetrics, ComponentMetrics(touchTarget: 70))
        XCTAssertGreaterThanOrEqual(try image(roomy).height, 70)
    }

    @MainActor
    func testInfoButtonRowStyleReadsTheHostTypographyAndAccent() throws {
        let group = InfoButton.QuestionGroup("Basics", questions: [.init("What is this?", answer: "A test.")])
        let row = InfoButton("About this page", groups: [group], style: .row)
        let plain = try height(row)
        let big = try height(row.environment(\.componentTypography, ComponentTypography(strongBody: .system(size: 60))))
        XCTAssertGreaterThan(big, plain)
        let themed = try image(row.environment(\.componentTheme, Theme(accent: red)))
        XCTAssertTrue(ComponentIconTests.containsRed(themed), "the row's info glyph takes the host accent")
    }

    @MainActor
    func testSectionHeaderActionReadsTheHostTypographyAndTouchTarget() throws {
        let header = SectionHeader(Text("Elections"), action: {})
        let plain = try height(header)
        let big = try height(header.environment(\.componentTypography, ComponentTypography(strongBody: .system(size: 60))))
        XCTAssertGreaterThan(big, plain)
        let roomy = try height(header.environment(\.componentMetrics, ComponentMetrics(touchTarget: 120)))
        XCTAssertGreaterThanOrEqual(roomy, 120)
    }

    @MainActor
    func testSectionHeaderActionUsesTheHostAccent() throws {
        let header = SectionHeader(Text("Elections"), action: {})
        XCTAssertTrue(ComponentIconTests.containsRed(try image(header.environment(\.componentTheme, Theme(accent: red)))))
        XCTAssertFalse(ComponentIconTests.containsRed(try image(header)))
    }

    func testRowsAndStepsAreNotAnnouncedAsHeadings() throws {
        XCTAssertEqual(Heading.traits(isHeader: true), .isHeader)
        XCTAssertEqual(Heading.traits(isHeader: false), [])
        // A ten-row list must read as ten rows, not ten headings.
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        for file in ["IndexRow", "NumberedSteps"] {
            let source = try String(contentsOf: root.appendingPathComponent("Sources/CieoUI/Molecules/\(file).swift"), encoding: .utf8)
            XCTAssertTrue(source.contains("isHeader: false"), "\(file) labels its row, not a heading")
        }
    }
}
