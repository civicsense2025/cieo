import CieoUI
import SwiftUI
import XCTest

/// Pins the editorial-frame pieces: page counts stay truthful, step states clamp, roll-call columns never collapse,
/// and every piece draws at phone width in both schemes.
final class EditorialFrameTests: XCTestCase {
    func testPageCountStaysInsideTheTotal() {
        XCTAssertTrue(ReferenceText.pageBounds(4, 18) == (4, 18))
        XCTAssertTrue(ReferenceText.pageBounds(0, 18) == (1, 18), "never page 0")
        XCTAssertTrue(ReferenceText.pageBounds(25, 18) == (18, 18), "never past the end")
        XCTAssertTrue(ReferenceText.pageBounds(3, 0) == (1, 1), "a total of at least 1")
    }

    func testStepStatesFollowTheCurrentStep() {
        XCTAssertEqual(StepList.state(at: 0, current: 1, count: 4), .done)
        XCTAssertEqual(StepList.state(at: 1, current: 1, count: 4), .current)
        XCTAssertEqual(StepList.state(at: 3, current: 1, count: 4), .upcoming)
        // A stale index past the end never marks every step done.
        XCTAssertEqual(StepList.state(at: 3, current: 9, count: 4), .current)
        XCTAssertEqual(StepList.state(at: 0, current: -2, count: 4), .current)
    }

    func testRollCallColumnsNeverCollapse() {
        XCTAssertEqual(RollCall.columnWidth(120), 120)
        XCTAssertEqual(RollCall.columnWidth(0), 140)
        XCTAssertEqual(RollCall.columnWidth(-5), 140)
        XCTAssertEqual(RollCall.columnWidth(.nan), 140)
        XCTAssertEqual(RollCall.columnWidth(.infinity), 140)
    }

    @MainActor
    func testEditorialPiecesRenderAtPhoneWidthInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let renderer = ImageRenderer(content: Self.specimens.environment(\.colorScheme, scheme).frame(width: 390))
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage, "specimens render in \(scheme)")
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 800, "every specimen takes up space")
            try AtomTests.save(image, name: "editorial-\(scheme)")
        }
    }

    @MainActor
    static var specimens: some View {
        let red = Color(red: 0.71, green: 0.14, blue: 0.09), blue = Color(red: 0.11, green: 0.31, blue: 0.85)
        return VStack(alignment: .leading, spacing: 24) {
            ContentFrame {
                FrameBar { TopicChip("Permitting") } trailing: { ReferenceText.page(1, of: 18) }
            } content: {
                Text("The Senate is debating it now").font(.subheadline.weight(.semibold))
                Text("Faster permits, fewer reviews.").displayText(.title)
            } bottom: {
                FrameBar(.bottom) { Text("Principle") } trailing: { ReferenceText("S. 5653 · Senate roll call 257") }
            }
            .frame(height: 360)
            ContentFrame(ground: .block) {
                FrameBar { TopicChip("In the bill’s words") } trailing: { ReferenceText.page(4, of: 18) }
            } content: {
                QuotedText(Text("…by striking ") + Text("‘90 days’").underline() + Text(" and inserting ") + Text("‘60 days’").underline(),
                           reference: Text("Endangered Species Act §1302"))
            } bottom: { EmptyView() }
            .frame(height: 300)
            PersonRow(Text("Sen. Capito"), detail: Text("R-W.Va. · Sponsor"), ring: red)
            HStack { LegendItem("Republican", color: red); LegendItem("Democrat", color: blue) }
            StepList([.init("End debate on taking it up", detail: "Done Nov. 9, 73–25", id: 1),
                      .init("Vote to take up the bill", detail: "Needs a simple majority", id: 2),
                      .init("Senate passage", id: 3)], current: 1)
            RollCall([.init(id: "r", title: "Republicans", color: red, members: [.init(id: "1", name: "Capito", detail: "W.Va."), .init(id: "2", name: "Lee", detail: "Utah")]),
                      .init(id: "d", title: "Democrats", color: blue, members: [.init(id: "3", name: "Heinrich", detail: "N.M.")])])
        }
        .padding(16)
        .environment(\.componentTheme, Theme(accent: blue))
    }
}
