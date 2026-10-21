import CieoUI
import SwiftUI
import XCTest

final class FlowStackTests: XCTestCase {
    func testItemsMoveToANewRowInsteadOfShrinking() {
        let sizes = [CGSize(width: 120, height: 44), CGSize(width: 140, height: 44), CGSize(width: 90, height: 44)]
        let wide = FlowLayout.frames(for: sizes, width: 400, spacing: 8)
        XCTAssertEqual(wide.frames.map(\.minY), [0, 0, 0], "everything fits on one row")
        XCTAssertEqual(wide.size, CGSize(width: 366, height: 44))
        let narrow = FlowLayout.frames(for: sizes, width: 200, spacing: 8)
        XCTAssertEqual(narrow.frames.map(\.minY), [0, 52, 104], "each item that doesn't fit starts a row")
        XCTAssertEqual(narrow.frames.map(\.width), [120, 140, 90], "items keep their full width, so words never split")
    }

    func testAnItemWiderThanTheRowGetsTheRowWidth() {
        let result = FlowLayout.frames(for: [CGSize(width: 500, height: 60)], width: 300, spacing: 8)
        XCTAssertEqual(result.frames.first?.width, 300)
        XCTAssertEqual(FlowLayout.frames(for: [], width: 300, spacing: 8).size, .zero)
    }

    func testUnsafeSpacingFallsBackToZero() {
        XCTAssertEqual(FlowLayout(spacing: .nan).spacing, 0)
        XCTAssertEqual(FlowLayout(spacing: -4).spacing, 0)
    }

    @MainActor
    func testChipsWrapAtLargeTextInsteadOfBreakingWords() throws {
        func height(_ width: CGFloat) throws -> Int {
            let group = FlowStack {
                SelectionChip("Courts", isSelected: .constant(true))
                SelectionChip("Congress", isSelected: .constant(false))
            }
            .frame(width: width)
            return try XCTUnwrap(ImageRenderer(content: group).cgImage).height
        }
        XCTAssertGreaterThan(try height(150), try height(600), "narrow rows stack the chips")
    }

    @MainActor
    func testFieldAndPanelTitlesTakeTheThemeForeground() throws {
        let red = Theme(foreground: Color(red: 1, green: 0, blue: 0))
        let field = LabeledField("ZIP code", text: .constant("")).environment(\.componentTheme, red).frame(width: 300)
        XCTAssertTrue(ComponentIconTests.containsRed(try XCTUnwrap(ImageRenderer(content: field).cgImage)))
        let panel = ExpandablePanel("Details", isExpanded: .constant(false)) { EmptyView() }
            .environment(\.componentTheme, red).frame(width: 300)
        XCTAssertTrue(ComponentIconTests.containsRed(try XCTUnwrap(ImageRenderer(content: panel).cgImage)))
    }
}
