import CieoUI
import SwiftUI
import XCTest

final class MoleculeTests: XCTestCase {
    func testIndexRanksPrintAsTwoDigits() {
        XCTAssertEqual(IndexRow.rank(0), "01")
        XCTAssertEqual(IndexRow.rank(8), "09")
        XCTAssertEqual(IndexRow.rank(9), "10")
        XCTAssertEqual(IndexRow.rank(122), "123")
        XCTAssertEqual(IndexRow.rank(-4), "01")
    }

    func testIndexBarsOnlyDrawRealFigures() {
        XCTAssertEqual(IndexRow.barFraction(0.4), 0.4)
        XCTAssertEqual(IndexRow.barFraction(3), 1)
        XCTAssertEqual(IndexRow.barFraction(-1), 0)
        XCTAssertNil(IndexRow.barFraction(.nan))
        XCTAssertNil(IndexRow.barFraction(nil))
    }

    func testInfoButtonNeverOffersAnEmptySheet() {
        let empty = InfoButton.QuestionGroup("Empty", questions: [])
        let filled = InfoButton.QuestionGroup("Bills", questions: [.init("What is a bill?", answer: "A proposed law.")])
        XCTAssertEqual(InfoButton.visible([empty, filled]).map(\.id), ["Bills"])
        XCTAssertTrue(InfoButton.visible([empty]).isEmpty)
    }

    func testStepsKeepTheirOrderAndDropEmptyDetails() {
        let steps = [NumberedSteps.Step(id: 0, title: "Introduced", detail: ""), .init(id: 1, title: "Committee", detail: "Hearings")]
        XCTAssertNil(steps[0].detail)
        XCTAssertEqual(steps.map(\.title), ["Introduced", "Committee"])
    }

    @MainActor
    func testMoleculesRenderAtPhoneWidthInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let renderer = ImageRenderer(content: Self.specimens(scheme).environment(\.colorScheme, scheme).frame(width: 390))
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage)
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 500)
            try AtomTests.save(image, name: "molecules-\(scheme)")
        }
    }

    @MainActor
    func testANarrowWidthStacksTheHeaderInsteadOfTruncating() throws {
        let narrow = SectionHeader("Closest races in your state", action: {}).frame(width: 160)
        let wide = SectionHeader("Closest races in your state", action: {}).frame(width: 390)
        let narrowHeight = try XCTUnwrap(ImageRenderer(content: narrow).cgImage).height
        let wideHeight = try XCTUnwrap(ImageRenderer(content: wide).cgImage).height
        XCTAssertGreaterThan(narrowHeight, wideHeight, "the action moves under the title")
    }

    @MainActor
    static func specimens(_ scheme: ColorScheme) -> some View {
        VStack(alignment: .leading, spacing: 20) {
            SectionHeader("Top stories", action: {})
            SectionHeader("No action here")
            VStack(spacing: 0) {
                IndexRow(rank: IndexRow.rank(0), title: Text("Federal government"), note: Text("6 of 10 lessons"), fraction: 0.6)
                IndexRow(rank: IndexRow.rank(1), title: Text("Elections and voting"), note: Text("Not started"), fraction: 0)
                IndexRow(rank: nil, title: Text("A row without a rank"), showsDisclosure: false)
            }
            NumberedSteps([(title: "Read the question", detail: "One at a time."), (title: "Pick an answer", detail: nil)])
            InfoButton("About bills", groups: [.init(questions: [.init("What is a bill?", answer: "A proposed law.")])], style: .row)
            InfoButton("About bills", groups: [.init(questions: [.init("What is a bill?", answer: "A proposed law.")])])
        }
        .padding(16)
        .background(scheme == .dark ? Color(white: 0.04) : Color(white: 0.97))
        .environment(\.componentTheme, Theme(accent: Color(red: 0.15, green: 0.39, blue: 0.92)))
    }
}
