import CieoUI
import SwiftUI
import XCTest

final class ComponentConfigurationTests: XCTestCase {
    func testHostMetricsRetainTargetFloorAndRejectNonFiniteGeometry() {
        let metrics = ComponentMetrics(compact: -.infinity, standard: -12, corner: .nan, touchTarget: 20)
        XCTAssertEqual(metrics.compact, 8)
        XCTAssertEqual(metrics.standard, 0)
        XCTAssertEqual(metrics.corner, 12)
        XCTAssertEqual(metrics.touchTarget, 44)
        XCTAssertEqual(ComponentMetrics(touchTarget: 56).touchTarget, 56)
    }

    func testAppearancePreservesValidHostGeometryAndNormalizesUnsafeOverrides() {
        let appearance = ControlAppearance(horizontalPadding: 16, verticalPadding: 0,
                                           minWidth: 1, minHeight: 56, cornerRadius: 14)
        XCTAssertEqual(appearance.horizontalPadding, 16)
        XCTAssertEqual(appearance.verticalPadding, 0)
        XCTAssertEqual(appearance.minWidth, 44)
        XCTAssertEqual(appearance.minHeight, 56)
        XCTAssertEqual(appearance.cornerRadius, 14)
        let invalid = ControlAppearance(horizontalPadding: .nan, verticalPadding: -2,
                                        minHeight: .infinity, borderWidth: -.infinity)
        XCTAssertNil(invalid.horizontalPadding)
        XCTAssertEqual(invalid.verticalPadding, 0)
        XCTAssertNil(invalid.minHeight)
        XCTAssertEqual(invalid.borderWidth, 1)
    }

    func testHostCanPreservePlainButtonInteractionAndCenteredBorders() {
        let plain = ControlAppearance(borderPlacement: .centered, pressedOpacity: 1,
                                      disabledOpacity: 1, pressedScale: 1)
        XCTAssertEqual(plain.pressedOpacity, 1)
        XCTAssertEqual(plain.disabledOpacity, 1)
        XCTAssertEqual(plain.pressedScale, 1)
        XCTAssertEqual(plain.borderPlacement, .centered)
        let invalid = ControlAppearance(pressedOpacity: .nan, disabledOpacity: -2, pressedScale: 4)
        XCTAssertEqual(invalid.pressedOpacity, 0.75)
        XCTAssertEqual(invalid.disabledOpacity, 0)
        XCTAssertEqual(invalid.pressedScale, 1)
        let defaults = ControlAppearance()
        XCTAssertEqual(defaults.pressedOpacity, 0.75)
        XCTAssertEqual(defaults.disabledOpacity, 0.5)
        XCTAssertEqual(defaults.pressedScale, 0.98)
        XCTAssertEqual(defaults.borderPlacement, .inset)
    }

    @MainActor
    func testExistingAndCustomizedNativeControlContractsCompile() {
        let selected = Binding.constant(false)
        let text = Binding.constant("")
        _ = ActionButton("Continue") {}.body
        _ = SelectionChip("Topic", isSelected: selected).body
        _ = SearchField(text: text).body
        _ = LabeledField("Email", text: text).body
        _ = ActionButton("Continue", isBusy: true, emphasis: .quiet,
                         readyAccessibilityValue: "Ready", busyAccessibilityValue: "Working") {}.body
        _ = SelectionChip("Topic", isSelected: selected,
                          selectedAccessibilityValue: "Chosen", unselectedAccessibilityValue: "Available").body
        _ = SearchField("Search topics", text: text, clearAccessibilityLabel: "Clear topics").body
        _ = Button("Continue") {}.buttonStyle(ActionButtonStyle(appearance: .init(minHeight: 56)))
        _ = TextField("Email", text: text).fieldChrome(appearance: .init(minHeight: 48, cornerRadius: 14))
        var environment = EnvironmentValues()
        environment.componentTypography = ComponentTypography(action: .headline)
        environment.componentMetrics = ComponentMetrics(touchTarget: 48)
        XCTAssertEqual(environment.componentMetrics.touchTarget, 48)
    }
}
