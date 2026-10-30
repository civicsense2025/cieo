import CieoUI
import SwiftUI
import XCTest

/// Pins that each organism reads its colours, type, spacing and glyphs from the host, so one host value
/// restyles it. Outcomes are checked in rendered pixels and heights, not in the implementation.
final class SlotsOrganismsTests: XCTestCase {
    private struct Node: Identifiable {
        let id: Int
        let title: String
        let stage: PathwayStage
    }

    private static let red = Color(red: 1, green: 0, blue: 0)
    private static let redGlyphs = ComponentIcons { _ in SlotsOrganismsTests.red.frame(width: 16, height: 16) }

    @MainActor
    private func render<V: View>(_ view: V, width: CGFloat = 300) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view.frame(width: width)).cgImage)
    }

    private func bytes(_ image: CGImage) -> [UInt8] {
        var pixels = [UInt8](repeating: 0, count: image.width * image.height * 4)
        guard let context = CGContext(data: &pixels, width: image.width, height: image.height, bitsPerComponent: 8,
                                      bytesPerRow: image.width * 4, space: CGColorSpaceCreateDeviceRGB(),
                                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
        else { return [] }
        context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
        return pixels
    }

    // MARK: ContentSection

    @MainActor
    func testContentSectionTitleAndSpacingComeFromTheHost() throws {
        func height(_ typography: ComponentTypography, _ metrics: ComponentMetrics) throws -> Int {
            try render(ContentSection("Turnout", detail: "Last four elections") { Text("Body") }
                .environment(\.componentTypography, typography)
                .environment(\.componentMetrics, metrics)).height
        }
        let plain = try height(ComponentTypography(), ComponentMetrics())
        XCTAssertGreaterThan(try height(ComponentTypography(title: .system(size: 60)), ComponentMetrics()), plain)
        XCTAssertGreaterThan(try height(ComponentTypography(), ComponentMetrics(standard: 60)), plain)
    }

    // MARK: StatePanel

    @MainActor
    func testStatePanelTitleFollowsTheHostTypography() throws {
        func height(_ typography: ComponentTypography) throws -> Int {
            try render(StatePanel("Nothing yet", detail: "Try again later", symbol: "tray") { Text("Retry") }
                .environment(\.componentTypography, typography)).height
        }
        XCTAssertGreaterThan(try height(ComponentTypography(title: .system(size: 60))), try height(ComponentTypography()))
    }

    @MainActor
    func testStatePanelActionUsesTheHostTint() throws {
        let panel = StatePanel("Nothing yet", detail: "Try again later", symbol: "tray") { Button("Retry") {} }
        let tinted = try render(panel.environment(\.componentTheme, Theme(tint: SlotsOrganismsTests.red)))
        XCTAssertTrue(ComponentIconTests.containsRed(tinted), "the action's fill is the host tint")
        XCTAssertFalse(ComponentIconTests.containsRed(try render(panel)))
    }

    @MainActor
    func testStatePanelIconDrawsTheHostGlyphAndTheSymbolInitKeepsItsSymbol() throws {
        let icon = StatePanel("Nothing yet", detail: "Try again later", icon: .search) { Text("Retry") }
            .environment(\.componentIcons, SlotsOrganismsTests.redGlyphs)
        XCTAssertTrue(ComponentIconTests.containsRed(try render(icon)), "the host glyph replaces the default")
        let symbol = StatePanel("Nothing yet", detail: "Try again later", symbol: "tray") { Text("Retry") }
            .environment(\.componentIcons, SlotsOrganismsTests.redGlyphs)
        XCTAssertFalse(ComponentIconTests.containsRed(try render(symbol)), "an SF Symbol name still draws the symbol")
    }

    @MainActor
    func testStatePanelDescriptionMarkAndActionsAreEachOptional() throws {
        let full = try render(StatePanel("Nothing yet", detail: "Try again later", icon: .search) { Text("Retry") }).height
        let titleOnly = try render(StatePanel("Nothing yet")).height
        XCTAssertGreaterThan(titleOnly, 0, "a title alone draws")
        XCTAssertLessThan(titleOnly, try render(StatePanel("Nothing yet", detail: "Try again later")).height,
                          "a description adds a line")
        XCTAssertLessThan(titleOnly, try render(StatePanel("Nothing yet", icon: .search)).height, "a mark adds a row")
        XCTAssertLessThan(titleOnly, try render(StatePanel("Nothing yet") { Text("Retry") }).height, "actions add a row")
        XCTAssertLessThan(titleOnly, full)
    }

    @MainActor
    func testStatePanelWithoutAMarkDrawsNoGlyph() throws {
        let markless = StatePanel("Nothing yet", detail: "Try again later") { Text("Retry") }
            .environment(\.componentIcons, SlotsOrganismsTests.redGlyphs)
        XCTAssertFalse(ComponentIconTests.containsRed(try render(markless)))
        let iconOnly = StatePanel("Nothing yet", icon: .search).environment(\.componentIcons, SlotsOrganismsTests.redGlyphs)
        XCTAssertTrue(ComponentIconTests.containsRed(try render(iconOnly)), "a mark without a description still draws")
    }

    /// `swift test` has no accessibility tree, so the spoken contract is pinned in the source: the title is
    /// always a header (with or without a description) and a host glyph mark stays decorative.
    func testStatePanelTitleStaysAHeaderAndTheMarkStaysHidden() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let source = try String(contentsOf: root.appendingPathComponent("Sources/CieoUI/Organisms/StatePanel.swift"), encoding: .utf8)
        XCTAssertTrue(source.contains("Heading(title, detail: detail, level: .title)\n"))
        XCTAssertTrue(source.contains("InlineGlyph { icons(icon) }.font(typography.prominentGlyph).accessibilityHidden(true)"))
    }

    // MARK: TaskPanel

    @MainActor
    func testTaskPanelHeadingAndSpacingComeFromTheHost() throws {
        func height(_ typography: ComponentTypography, _ metrics: ComponentMetrics) throws -> Int {
            try render(TaskPanel("Uploading", detail: "2 of 4 files", progress: 0.5) { Text("Cancel") }
                .environment(\.componentTypography, typography)
                .environment(\.componentMetrics, metrics)).height
        }
        let plain = try height(ComponentTypography(), ComponentMetrics())
        XCTAssertGreaterThan(try height(ComponentTypography(subtitle: .system(size: 60)), ComponentMetrics()), plain)
        XCTAssertGreaterThan(try height(ComponentTypography(), ComponentMetrics(standard: 60)), plain)
    }

    @MainActor
    func testTaskPanelRingDrawsTheHostAccent() throws {
        let panel = TaskPanel("Uploading", detail: "2 of 4 files", progress: 0.5) { EmptyView() }
        XCTAssertTrue(ComponentIconTests.containsRed(try render(panel.environment(\.componentTheme, Theme(accent: SlotsOrganismsTests.red)))))
        XCTAssertFalse(ComponentIconTests.containsRed(try render(panel)))
    }

    // MARK: Pathway

    @MainActor
    private func pathway(_ nodes: [Node], axis: Pathway<Node, Text>.Axis = .vertical) -> some View {
        Pathway(nodes, axis: axis, stage: \.stage, accessibilityName: { Text($0.title) }) { node, _ in
            Text(node.title)
        }
    }

    private let upcoming = [Node(id: 0, title: "Read", stage: .upcoming), Node(id: 1, title: "Vote", stage: .upcoming)]

    @MainActor
    func testUnwalkedPathUsesTheHostSubtleRole() throws {
        let host = try render(pathway(upcoming).environment(\.componentTheme, Theme(subtle: SlotsOrganismsTests.red)))
        XCTAssertTrue(ComponentIconTests.containsRed(host), "the unwalked line is the host subtle colour")
        XCTAssertFalse(ComponentIconTests.containsRed(try render(pathway(upcoming))))
    }

    @MainActor
    func testCurrentStepHaloUsesTheHostTint() throws {
        let current = [Node(id: 0, title: "Read", stage: .current)]
        let host = try render(pathway(current).environment(\.componentTheme, Theme(tint: SlotsOrganismsTests.red)))
        XCTAssertTrue(ComponentIconTests.containsRed(host), "the halo marking the reader's place is the host tint")
        XCTAssertFalse(ComponentIconTests.containsRed(try render(pathway(current))))
    }

    @MainActor
    func testFinishedStepCheckDrawsTheHostGlyph() throws {
        let done = [Node(id: 0, title: "Read", stage: .done)]
        let host = try render(pathway(done).environment(\.componentIcons, SlotsOrganismsTests.redGlyphs))
        XCTAssertTrue(ComponentIconTests.containsRed(host), "the check is the host glyph")
    }

    @MainActor
    func testStepNumberFollowsTheHostMarkerRole() throws {
        let current = [Node(id: 0, title: "Read", stage: .current)]
        let plain = bytes(try render(pathway(current)))
        let host = bytes(try render(pathway(current).environment(\.componentTypography,
                                                                 ComponentTypography(marker: .system(size: 8)))))
        XCTAssertNotEqual(plain, host, "the step number is drawn in the host marker role")
    }

    @MainActor
    func testHorizontalPathSpacingComesFromTheHostMetrics() throws {
        func height(_ metrics: ComponentMetrics) throws -> Int {
            try render(pathway(upcoming, axis: .horizontal).environment(\.componentMetrics, metrics)).height
        }
        XCTAssertGreaterThan(try height(ComponentMetrics(compact: 40)), try height(ComponentMetrics()))
    }

    @MainActor
    func testVerticalPathLabelSpacingComesFromTheHostMetrics() throws {
        let long = [Node(id: 0, title: "Checks and balances between the three branches", stage: .upcoming)]
        func height(_ metrics: ComponentMetrics) throws -> Int {
            try render(pathway(long).environment(\.componentMetrics, metrics), width: 220).height
        }
        XCTAssertGreaterThan(try height(ComponentMetrics(medium: 80)), try height(ComponentMetrics()),
                             "a wider gap narrows the label, so it wraps onto more lines")
    }

    // MARK: ContentRail

    #if os(macOS)
    /// The paging buttons only exist on the Mac, where there is no swipe.
    @MainActor
    private func rail(_ nodes: [Node]) -> some View {
        ContentRail(nodes, label: Text("Lessons")) { Text($0.title) }
    }

    @MainActor
    func testRailPagingGlyphsComeFromTheHost() throws {
        let nodes = upcoming + [Node(id: 2, title: "Act", stage: .upcoming)]
        XCTAssertTrue(ComponentIconTests.containsRed(try render(rail(nodes).environment(\.componentIcons, SlotsOrganismsTests.redGlyphs))))
        XCTAssertFalse(ComponentIconTests.containsRed(try render(rail(nodes))))
    }

    @MainActor
    func testRailPagerSpacingComesFromTheHostMetrics() throws {
        func height(_ metrics: ComponentMetrics) throws -> Int {
            try render(rail(upcoming).environment(\.componentMetrics, metrics)).height
        }
        XCTAssertGreaterThan(try height(ComponentMetrics(compact: 40)), try height(ComponentMetrics()))
    }
    #endif
}
