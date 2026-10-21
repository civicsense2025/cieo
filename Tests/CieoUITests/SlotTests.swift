import CieoUI
import SwiftUI
import XCTest

/// Pins the host-owned slots every component reads, so a host value restyles the component and a bad
/// value never breaks it.
final class SlotTests: XCTestCase {
    func testSpacingIsAnAscendingScaleWithSafeFallbacks() {
        let metrics = ComponentMetrics()
        let scale = [metrics.tight, metrics.compact, metrics.medium, metrics.standard, metrics.loose, metrics.section]
        XCTAssertEqual(scale, [4, 8, 12, 16, 20, 24])
        XCTAssertEqual([metrics.bar, metrics.thinBar, metrics.hairline], [8, 6, 1])
        let broken = ComponentMetrics(tight: .nan, medium: -3, loose: .infinity, bar: .nan, hairline: -1)
        XCTAssertEqual(broken.tight, 4)
        XCTAssertEqual(broken.medium, 0, "negative steps collapse to zero, never below")
        XCTAssertEqual(broken.loose, 20)
        XCTAssertEqual(broken.bar, 8)
        XCTAssertEqual(broken.hairline, 0)
    }

    func testExistingMetricsCallersKeepWorking() {
        let metrics = ComponentMetrics(compact: 6, standard: 18, corner: 4, touchTarget: 48)
        XCTAssertEqual([metrics.compact, metrics.standard, metrics.corner, metrics.touchTarget], [6, 18, 4, 48])
        XCTAssertEqual(metrics.medium, 12, "new steps keep their defaults")
    }

    func testThemeAddsDangerAndSubtleRoles() {
        XCTAssertEqual(Theme().danger, .red)
        XCTAssertEqual(Theme(danger: .orange).danger, .orange)
        XCTAssertEqual(Theme(subtle: .gray).subtle, .gray)
    }

    func testEveryNewGlyphHasItsOwnDefault() {
        let names = [ComponentIcon.search, .clear, .error, .selected, .unselected].map(ComponentIcons.systemName)
        XCTAssertEqual(Set(names).count, names.count)
    }

    @MainActor
    func testHeadingLevelsReadTheHostTypography() throws {
        func height(_ typography: ComponentTypography, _ level: Heading.Level) throws -> Int {
            let view = Heading("Turnout", detail: "Last four elections", level: level)
                .environment(\.componentTypography, typography).frame(width: 300)
            return try XCTUnwrap(ImageRenderer(content: view).cgImage).height
        }
        let plain = ComponentTypography()
        let big = ComponentTypography(title: .system(size: 60), heading: .system(size: 60))
        XCTAssertGreaterThan(try height(big, .title), try height(plain, .title))
        XCTAssertGreaterThan(try height(big, .heading), try height(plain, .heading))
        XCTAssertGreaterThan(try height(plain, .title), try height(plain, .heading), "a title outranks a heading")
    }

    @MainActor
    func testStatusLabelTakesItsColourFromTheTheme() throws {
        let red = Theme(danger: Color(red: 1, green: 0, blue: 0))
        func render(_ tone: StatusLabel.Tone) throws -> CGImage {
            try XCTUnwrap(ImageRenderer(content: StatusLabel("Enter a ZIP code", icon: .error, tone: tone)
                .environment(\.componentTheme, red).frame(width: 300)).cgImage)
        }
        XCTAssertTrue(ComponentIconTests.containsRed(try render(.danger)))
        XCTAssertFalse(ComponentIconTests.containsRed(try render(.neutral)))
    }

    @MainActor
    func testStatusLabelAndIconButtonDrawTheHostGlyph() throws {
        let host = ComponentIcons { _ in Color(red: 1, green: 0, blue: 0).frame(width: 16, height: 16) }
        let label = StatusLabel("Saved", icon: .check).environment(\.componentIcons, host).frame(width: 200)
        XCTAssertTrue(ComponentIconTests.containsRed(try XCTUnwrap(ImageRenderer(content: label).cgImage)))
        let button = IconButton(.clear, label: "Clear search") {}.environment(\.componentIcons, host)
        XCTAssertTrue(ComponentIconTests.containsRed(try XCTUnwrap(ImageRenderer(content: button).cgImage)))
    }

    @MainActor
    func testIconButtonKeepsAFullTouchTarget() throws {
        let image = try XCTUnwrap(ImageRenderer(content: IconButton(.clear, label: "Clear") {}).cgImage)
        XCTAssertGreaterThanOrEqual(image.width, 44)
        XCTAssertGreaterThanOrEqual(image.height, 44)
        let roomy = IconButton(.clear, label: "Clear") {}.environment(\.componentMetrics, ComponentMetrics(touchTarget: 60))
        XCTAssertGreaterThanOrEqual(try XCTUnwrap(ImageRenderer(content: roomy).cgImage).width, 60)
    }
}
