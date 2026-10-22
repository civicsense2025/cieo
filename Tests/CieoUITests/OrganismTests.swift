import CieoUI
import SwiftUI
import XCTest

final class OrganismTests: XCTestCase {
    struct Step: Identifiable {
        let id: Int
        let title: String
        let stage: PathwayStage
    }

    static let lessons = [
        Step(id: 0, title: "What the Constitution does", stage: .done),
        Step(id: 1, title: "Three branches", stage: .done),
        Step(id: 2, title: "Checks and balances", stage: .current),
        Step(id: 3, title: "Federalism", stage: .upcoming),
        Step(id: 4, title: "Amendments", stage: .upcoming),
    ]

    static let stages = [
        Step(id: 0, title: "Introduced", stage: .done),
        Step(id: 1, title: "Committee", stage: .current),
        Step(id: 2, title: "House", stage: .upcoming),
        Step(id: 3, title: "Senate", stage: .upcoming),
    ]

    func testNodesStepSideToSideInTheStudysPattern() {
        typealias Path = Pathway<Step, EmptyView>
        XCTAssertEqual((0..<6).map { Path.offset(at: $0, in: Path.compactOffsets) }, [0, 36, 64, 36, 0, 36])
        XCTAssertEqual(Path.offset(at: 9, in: Path.wideOffsets), 72)
        XCTAssertEqual(Path.offset(at: 2, in: []), 0, "no pattern keeps nodes aligned")
        XCTAssertEqual([0, 1].map { Path.offset(at: $0, in: [.nan, -8, 20]) }, [0, 20], "a non-number is dropped and a negative offset floored")
        XCTAssertEqual(Path.offset(at: -1, in: [10]), 0)
    }

    func testOnlyLinesLeavingFinishedStepsAreWalked() {
        typealias Path = Pathway<Step, EmptyView>
        XCTAssertTrue(Path.isWalked(from: .done))
        XCTAssertFalse(Path.isWalked(from: .current))
        XCTAssertFalse(Path.isWalked(from: .upcoming))
        XCTAssertEqual([PathwayStage.done, .current, .upcoming].map(Path.spokenStage), ["done", "current", "not started"])
    }

    func testDefaultNumberingCountsFromOneOverTheRowsGiven() {
        typealias Path = Pathway<Step, EmptyView>
        XCTAssertEqual((0..<5).map { Path.stepNumber(at: $0, firstNumber: 1) }, [1, 2, 3, 4, 5])
        XCTAssertEqual(Path.stepCount(rows: 5, firstNumber: 1, total: nil), 5)
        XCTAssertEqual(Path.spokenPosition(at: 2, rows: 5), "Step 3 of 5")
        XCTAssertEqual(Path.stepCount(rows: 0, firstNumber: 1, total: nil), 0, "an empty path has no steps")
    }

    func testAWindowOfALongPathKeepsItsRealNumbers() {
        typealias Path = Pathway<Step, EmptyView>
        XCTAssertEqual((0..<3).map { Path.stepNumber(at: $0, firstNumber: 11) }, [11, 12, 13])
        XCTAssertEqual(Path.spokenPosition(at: 0, rows: 12, firstNumber: 1, total: 40), "Step 1 of 40")
        XCTAssertEqual(Path.spokenPosition(at: 2, rows: 10, firstNumber: 11, total: 40), "Step 13 of 40")
        XCTAssertEqual(Path.spokenPosition(at: 2, rows: 10, firstNumber: 11), "Step 13 of 20",
                       "without a total the path ends at the last row shown")
    }

    func testImpossibleNumbersAreClampedToAPathThatCanExist() {
        typealias Path = Pathway<Step, EmptyView>
        XCTAssertEqual(Path.stepNumber(at: 0, firstNumber: 0), 1, "numbering never starts below 1")
        XCTAssertEqual(Path.stepNumber(at: 1, firstNumber: -5), 2)
        XCTAssertEqual(Path.spokenPosition(at: 4, rows: 5, total: 3), "Step 5 of 5", "a total shorter than the rows grows to fit")
        XCTAssertEqual(Path.spokenPosition(at: 1, rows: 3, firstNumber: 10, total: 5), "Step 11 of 12",
                       "a total below the last number shown grows to it")
        XCTAssertEqual(Path.stepNumber(at: 1, firstNumber: .max), .max, "a huge first number saturates instead of trapping")
    }

    @MainActor
    func testAWindowedPathRenders() throws {
        let path = Pathway(Self.lessons, firstNumber: 11, total: 40, stage: \.stage,
                           accessibilityName: { Text($0.title) }) { step, _ in Text(step.title) }
            .environment(\.componentTheme, Self.theme)
            .frame(width: 390)
        let image = try XCTUnwrap(ImageRenderer(content: path).cgImage)
        XCTAssertEqual(image.width, 390)
    }

    func testRailPagingStopsAtTheEnds() {
        typealias Rail = ContentRail<Step, EmptyView>
        XCTAssertEqual(Rail.neighbour(of: nil, step: 1, count: 4), 1)
        XCTAssertEqual(Rail.neighbour(of: 3, step: 1, count: 4), 3)
        XCTAssertEqual(Rail.neighbour(of: 0, step: -1, count: 4), 0)
        XCTAssertNil(Rail.neighbour(of: 0, step: 1, count: 0))
    }

    @MainActor
    func testPathwaysRenderVerticallyAndHorizontallyInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let renderer = ImageRenderer(content: Self.specimens(scheme).environment(\.colorScheme, scheme).frame(width: 390))
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage)
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 700, "five lessons, four stages and a rail")
            try AtomTests.save(image, name: "organisms-\(scheme)")
        }
        let wide = ImageRenderer(content: Self.stagesRow.frame(width: 900).padding(16).background(Color(white: 0.97)))
        wide.scale = 2
        try AtomTests.save(try XCTUnwrap(wide.cgImage), name: "organisms-wide")
    }

    @MainActor
    static var stagesRow: some View {
        Pathway(stages, axis: .horizontal, stroke: .dashed, stage: \.stage, accessibilityName: { Text($0.title) }) { step, _ in
            Text(step.title).font(.subheadline.weight(.bold))
        }
        .environment(\.componentTheme, theme)
    }

    static let theme = Theme(accent: Color(red: 0.15, green: 0.39, blue: 0.92))

    @MainActor
    static func specimens(_ scheme: ColorScheme) -> some View {
        VStack(alignment: .leading, spacing: 28) {
            Pathway(lessons, offsets: Pathway<Step, EmptyView>.compactOffsets, stage: \.stage,
                    accessibilityName: { Text($0.title) }, action: { _ in }) { step, index in
                VStack(alignment: .leading, spacing: 2) {
                    Text(step.title).font(.headline.weight(.heavy))
                    Text("Lesson \(index + 1) · 8 min").font(.footnote).foregroundStyle(.secondary)
                }
            }
            Pathway(stages, stroke: .dashed, offsets: [0, 36], stage: \.stage, accessibilityName: { Text($0.title) }) { step, _ in
                Text(step.title).font(.headline.weight(.heavy))
            }
            ContentRail(lessons, itemWidth: 200, label: Text("Lessons")) { step in
                CutSurface(.quarter(.topTrailing), fill: theme.tint) {
                    Text(step.title).font(.headline.weight(.heavy)).padding(14)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
                }
                .frame(height: 140)
            }
        }
        .padding(.vertical, 16).padding(.horizontal, 16)
        .background(scheme == .dark ? Color(white: 0.04) : Color(white: 0.97))
        .environment(\.componentTheme, theme)
    }
}
