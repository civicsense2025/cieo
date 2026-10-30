import CieoUI
import SwiftUI
import XCTest

/// Pins the page grounds, the floating shadow, the `snug` spacing step, the small glyph role and the
/// shared control appearance: existing hosts keep their look, and a host value reaches every reader.
final class PageRolesTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)

    func testNewRolesHaveDefaultsThatLeaveExistingHostsAlone() {
        let theme = Theme()
        XCTAssertEqual(theme.background, Theme.systemBackground)
        XCTAssertEqual(theme.quietBackground, Theme.systemQuietBackground)
        XCTAssertEqual(theme.floatingShadow, ComponentShadow())
        // Existing roles are unchanged by the additions.
        XCTAssertEqual(theme.danger, .red)
        XCTAssertEqual(Theme(accent: .blue).tint, Color.blue.opacity(0.18))

        let metrics = ComponentMetrics()
        XCTAssertEqual(metrics.snug, 10)
        XCTAssertLessThan(metrics.compact, metrics.snug)
        XCTAssertLessThan(metrics.snug, metrics.medium)
        XCTAssertEqual(ComponentMetrics(compact: 6, medium: 14).snug, 10, "callers that skip snug keep the default")

        XCTAssertEqual(ComponentTypography().smallGlyph, .caption2.weight(.semibold))
        XCTAssertEqual(ComponentTypography(smallGlyph: .footnote).smallGlyph, .footnote)
    }

    func testHostsCanOverrideEveryNewRole() {
        let shadow = ComponentShadow(color: .blue, radius: 4, x: 1, y: 2)
        let theme = Theme(background: .mint, quietBackground: .teal, floatingShadow: shadow)
        XCTAssertEqual(theme.background, .mint)
        XCTAssertEqual(theme.quietBackground, .teal)
        XCTAssertEqual(theme.floatingShadow, shadow)
        XCTAssertEqual(ComponentMetrics(snug: 11).snug, 11)
    }

    func testSnugAndShadowRejectUnsafeGeometry() {
        XCTAssertEqual(ComponentMetrics(snug: .nan).snug, 10)
        XCTAssertEqual(ComponentMetrics(snug: -3).snug, 0)
        let invalid = ComponentShadow(radius: .infinity, x: .nan, y: -.infinity)
        XCTAssertEqual(invalid.radius, 16)
        XCTAssertEqual(invalid.x, 0)
        XCTAssertEqual(invalid.y, 6)
        XCTAssertEqual(ComponentShadow(radius: -5).radius, 0)
        XCTAssertEqual(ComponentShadow.none.radius, 0)
    }

    func testControlAppearanceIsReachableFromTheEnvironment() {
        var environment = EnvironmentValues()
        XCTAssertEqual(environment.controlAppearance.pressedOpacity, 0.75)
        XCTAssertEqual(environment.controlAppearance.disabledOpacity, 0.5)
        environment.controlAppearance = ControlAppearance(pressedOpacity: 1, disabledOpacity: 0.3)
        XCTAssertEqual(environment.controlAppearance.pressedOpacity, 1)
        XCTAssertEqual(environment.controlAppearance.disabledOpacity, 0.3)
    }

    @MainActor
    func testFloatingShadowDrawsTheHostShadowAndNoneDrawsNothing() throws {
        func sheet(_ shadow: ComponentShadow) -> some View {
            Color.white.frame(width: 40, height: 40).floatingShadow().padding(30)
                .background(Color.white)
                .environment(\.componentTheme, Theme(floatingShadow: shadow))
        }
        let cast = try XCTUnwrap(ImageRenderer(content: sheet(ComponentShadow(color: red, radius: 6, y: 8))).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(cast), "the floating shadow takes the host colour")
        let flat = try XCTUnwrap(ImageRenderer(content: sheet(.none)).cgImage)
        XCTAssertFalse(ComponentIconTests.containsRed(flat))
    }
}
