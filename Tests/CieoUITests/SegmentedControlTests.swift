import CieoUI
import SwiftUI
import XCTest

/// Pins the single-select pill row: one selected pill that carries `.isSelected`, distinct identities,
/// counts read with their label, styling from the host slots, and overflow that scrolls instead of
/// truncating.
final class SegmentedControlTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)
    private enum Filter: Hashable { case all, bills, votes, hearings, nominations, treaties }
    private var options: [SegmentedControlOption<Filter>] {
        [.init(verbatim: "All", value: .all), .init(verbatim: "Bills", value: .bills, count: 12),
         .init(verbatim: "Votes", value: .votes, count: 3)]
    }

    @MainActor
    private func image<V: View>(_ view: V, width: CGFloat = 390) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view.frame(width: width)).cgImage)
    }

    // MARK: Contract

    func testOnlyTheSelectedPillCarriesTheSelectedTrait() {
        XCTAssertEqual(SegmentedControl<Filter, EmptyView>.traits(isSelected: true), [.isButton, .isSelected])
        XCTAssertEqual(SegmentedControl<Filter, EmptyView>.traits(isSelected: false), .isButton)
    }

    func testRepeatedValuesKeepTheFirstOptionSoIdentitiesStayDistinct() {
        let unique = SegmentedControl<Filter, EmptyView>.uniqueOptions(
            [.init(verbatim: "All", value: .all), .init(verbatim: "Again", value: .all), .init(verbatim: "Bills", value: .bills)])
        XCTAssertEqual(unique.map(\.value), [.all, .bills])
    }

    func testNegativeCountsAreDropped() {
        XCTAssertNil(SegmentedControlOption(verbatim: "Bills", value: Filter.bills, count: -1).count)
        XCTAssertEqual(SegmentedControlOption(verbatim: "Bills", value: Filter.bills, count: 0).count, 0)
    }

    // MARK: Accessibility

    /// `swift test` has no accessibility tree to walk, so the wiring is pinned in the source, as the
    /// heading rule is: the control is a named container, each pill is one combined element (label,
    /// count and accessory read together) carrying the selected trait from `traits(isSelected:)`.
    func testPillsAreCombinedNamedElementsThatCarryTheSelectedTrait() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let source = try String(contentsOf: root.appendingPathComponent("Sources/CieoUI/Molecules/SegmentedControl.swift"), encoding: .utf8)
        XCTAssertTrue(source.contains(".accessibilityElement(children: .contain)\n        .accessibilityLabel(label)"))
        XCTAssertTrue(source.contains(".accessibilityElement(children: .combine)\n        .accessibilityAddTraits(SegmentedControl<Value, Accessory>.traits(isSelected: isSelected))"))
        XCTAssertFalse(source.contains(".truncationMode"), "pills scroll rather than truncate")
    }

    // MARK: Slots

    @MainActor
    func testSelectedPillFillsWithTheHostAccent() throws {
        func control(_ selected: Filter) -> some View {
            SegmentedControl("Filter", selection: .constant(selected), options: options)
                .environment(\.componentTheme, Theme(accent: red))
        }
        XCTAssertTrue(ComponentIconTests.containsRed(try image(control(.bills))))
        XCTAssertFalse(ComponentIconTests.containsRed(try image(control(.treaties))), "no option selected, no accent")
    }

    @MainActor
    func testPillsReadTheHostTypeAndTouchTarget() throws {
        let control = SegmentedControl("Filter", selection: .constant(Filter.all), options: options)
        let plain = try image(control).height
        let big = try image(control.environment(\.componentTypography, ComponentTypography(selection: .system(size: 60)))).height
        XCTAssertGreaterThan(big, plain)
        XCTAssertGreaterThanOrEqual(plain, 44)
        let roomy = try image(control.environment(\.componentMetrics, ComponentMetrics(touchTarget: 90))).height
        XCTAssertGreaterThanOrEqual(roomy, 90)
    }

    @MainActor
    func testAccessoryDrawsBesideItsPill() throws {
        let control = SegmentedControl("Filter", selection: .constant(Filter.all), options: options) { option in
            if option.value == .votes { self.red.frame(width: 8, height: 8) }
        }
        XCTAssertTrue(ComponentIconTests.containsRed(try image(control)))
    }

    // MARK: Overflow and text size

    @MainActor
    func testOverflowScrollsInsteadOfSqueezingOrTruncating() throws {
        let many: [SegmentedControlOption<Filter>] = [
            .init(verbatim: "Everything", value: .all), .init(verbatim: "Bills and resolutions", value: .bills),
            .init(verbatim: "Roll-call votes", value: .votes), .init(verbatim: "Committee hearings", value: .hearings),
            .init(verbatim: "Nominations", value: .nominations), .init(verbatim: "Treaties", value: .treaties),
        ]
        let control = SegmentedControl("Filter", selection: .constant(Filter.all), options: many)
        // The row keeps one line: a narrow width does not make it taller (pills never wrap or stack).
        let wide = try image(control, width: 1400).height
        let narrow = try image(control, width: 200).height
        XCTAssertEqual(narrow, wide, accuracy: 2)
        // At an accessibility text size the pills still render on one scrolling line.
        let large = try image(control.environment(\.dynamicTypeSize, .accessibility3), width: 200).height
        XCTAssertGreaterThanOrEqual(large, 44)
    }
}
