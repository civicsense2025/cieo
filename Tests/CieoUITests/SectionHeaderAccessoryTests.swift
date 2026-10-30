import CieoUI
import SwiftUI
import XCTest

/// Pins SectionHeader's trailing slots: any accessory or a quiet value, read from the host slots, stacked
/// under the title when narrow, while the existing "See all" action keeps working unchanged.
final class SectionHeaderAccessoryTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)

    @MainActor
    private func image<V: View>(_ view: V, width: CGFloat = 390) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view.frame(width: width)).cgImage)
    }

    @MainActor
    func testAccessoryDrawsBesideTheTitle() throws {
        let header = SectionHeader("Bills") { red.frame(width: 12, height: 12) }
        XCTAssertTrue(ComponentIconTests.containsRed(try image(header)))
        XCTAssertGreaterThanOrEqual(try image(header).height, 44, "the trailing slot keeps the touch target")
    }

    @MainActor
    func testAccessoryTextTakesTheHostAccentAndActionType() throws {
        let header = SectionHeader("Bills") { Text(verbatim: "Browse") }
        XCTAssertTrue(ComponentIconTests.containsRed(try image(header.environment(\.componentTheme, Theme(accent: red)))))
        let plain = try image(header).height
        let big = try image(header.environment(\.componentTypography, ComponentTypography(strongBody: .system(size: 80)))).height
        XCTAssertGreaterThan(big, plain)
    }

    @MainActor
    func testValueIsQuietAndReadsTheValueRole() throws {
        let header = SectionHeader("Bills", value: Text(verbatim: "12"))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(header.environment(\.componentTheme, Theme(secondary: red)))),
                      "the value uses the secondary colour")
        XCTAssertFalse(ComponentIconTests.containsRed(try image(header.environment(\.componentTheme, Theme(accent: red)))),
                       "the value is not styled as an action")
        let plain = try image(header).height
        let big = try image(header.environment(\.componentTypography, ComponentTypography(value: .system(size: 80)))).height
        XCTAssertGreaterThan(big, plain)
    }

    @MainActor
    func testNarrowWidthsStackTheAccessoryUnderTheTitleInsteadOfTruncating() throws {
        let header = SectionHeader("Closest races in your state", value: Text(verbatim: "1,204 races"))
        XCTAssertGreaterThan(try image(header, width: 160).height, try image(header, width: 600).height)
    }

    @MainActor
    func testExistingActionCallSitesStillDrawTheirAction() throws {
        let header = SectionHeader("Top stories", action: {}).environment(\.componentTheme, Theme(accent: red))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(header)))
        let noAction = SectionHeader("Top stories").environment(\.componentTheme, Theme(accent: red))
        XCTAssertFalse(ComponentIconTests.containsRed(try image(noAction)), "no action, no trailing slot")
    }
}
