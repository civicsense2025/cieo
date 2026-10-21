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
