import CieoUI
import SwiftUI
import XCTest

/// Pins that the surface atoms (SelectionChip, BlockPanel, CutSurface, ShareBar, ActionButton) read
/// their colours, type, spacing and glyphs from the host, so one host value restyles every use.
final class SlotsAtomSurfacesTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)

    @MainActor
    private func render<V: View>(_ view: V) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view).cgImage)
    }

    /// RGBA bytes of an image, so a test can read one pixel's alpha.
    private func rgba(_ image: CGImage) -> [UInt8] {
        var pixels = [UInt8](repeating: 0, count: image.width * image.height * 4)
        guard let context = CGContext(data: &pixels, width: image.width, height: image.height, bitsPerComponent: 8,
                                      bytesPerRow: image.width * 4, space: CGColorSpaceCreateDeviceRGB(),
                                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
        else { return pixels }
        context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
        return pixels
    }

    // MARK: SelectionChip

    @MainActor
    func testSelectionChipFillsSelectedWithTheHostTint() throws {
        let theme = Theme(tint: red)
        func chip(_ selected: Bool) throws -> CGImage {
            try render(SelectionChip("Reading", isSelected: .constant(selected))
                .environment(\.componentTheme, theme).frame(width: 240))
        }
        XCTAssertTrue(ComponentIconTests.containsRed(try chip(true)), "the selected chip fills with the host tint")
        XCTAssertFalse(ComponentIconTests.containsRed(try chip(false)), "an unselected chip keeps its surface")
    }

    @MainActor
    func testSelectionChipDrawsTheHostSelectionGlyphs() throws {
        let host = ComponentIcons { icon in
            if icon == .selected {
                Color(red: 1, green: 0, blue: 0).frame(width: 16, height: 16)
            } else {
                Color.clear.frame(width: 16, height: 16)
            }
        }
        func chip(_ selected: Bool) throws -> CGImage {
            try render(SelectionChip("Reading", isSelected: .constant(selected))
                .environment(\.componentIcons, host).frame(width: 240))
        }
        XCTAssertTrue(ComponentIconTests.containsRed(try chip(true)), "the host's selected glyph replaces the checkmark")
        XCTAssertFalse(ComponentIconTests.containsRed(try chip(false)), "the host's unselected glyph replaces the circle")
    }

    @MainActor
    func testSelectionChipGrowsWithTheHostTypography() throws {
        func height(_ typography: ComponentTypography) throws -> Int {
            try render(SelectionChip("Reading", isSelected: .constant(false))
                .environment(\.componentTypography, typography).frame(width: 240)).height
        }
        XCTAssertGreaterThan(try height(ComponentTypography(selection: .system(size: 60))),
                             try height(ComponentTypography()))
    }

    // MARK: BlockPanel

    @MainActor
    func testBlockPanelPaintsItsToneFromTheHostTheme() throws {
        func panel(_ tone: BlockPanel<Text>.Tone, _ theme: Theme) throws -> CGImage {
            try render(BlockPanel(tone: tone) { Text("Quiz") }
                .environment(\.componentTheme, theme).frame(width: 240))
        }
        XCTAssertTrue(ComponentIconTests.containsRed(try panel(.block, Theme(block: red))))
        XCTAssertTrue(ComponentIconTests.containsRed(try panel(.accent, Theme(accent: red))))
        XCTAssertFalse(ComponentIconTests.containsRed(try panel(.block, Theme(accent: red))),
                       "a block panel ignores the accent")
    }

    @MainActor
    func testBlockPanelSpacesItsChildrenWithTheHostMedium() throws {
        func height(_ metrics: ComponentMetrics) throws -> Int {
            try render(BlockPanel { Text("Question"); Text("Answer") }
                .environment(\.componentMetrics, metrics).frame(width: 240)).height
        }
        // The stack gap goes from the default medium step (12) to 40: the panel grows by exactly that difference.
        XCTAssertEqual(try height(ComponentMetrics(medium: 40)) - height(ComponentMetrics()), 28)
    }

    @MainActor
    func testBlockPanelPaddingFollowsTheHostSteps() throws {
        func height(_ metrics: ComponentMetrics) throws -> Int {
            try render(BlockPanel { Text("Question") }
                .environment(\.componentMetrics, metrics).frame(width: 240)).height
        }
        XCTAssertGreaterThan(try height(ComponentMetrics(section: 60)), try height(ComponentMetrics()),
                             "the vertical padding is the host's section step")
    }

    // MARK: CutSurface

    @MainActor
    func testCutSurfaceFillsWithTheHostSurface() throws {
        let image = try render(CutSurface(.arch).frame(width: 120, height: 120)
            .environment(\.componentTheme, Theme(surface: red)))
        XCTAssertTrue(ComponentIconTests.containsRed(image), "an empty cut block fills with the host surface")
    }

    // MARK: ShareBar

    @MainActor
    func testShareBarDefaultsToTheHostBarStep() throws {
        let bar = ShareBar([.init(52, color: .blue), .init(48, color: .red)], label: Text("Split"))
        func height(_ metrics: ComponentMetrics) throws -> Int {
            try render(bar.environment(\.componentMetrics, metrics).frame(width: 200)).height
        }
        XCTAssertEqual(try height(ComponentMetrics()), 8, "the default bar is the bar step, 8 points")
        XCTAssertEqual(try height(ComponentMetrics(bar: 30)), 30, "a host bar step sets the height")
    }

    @MainActor
    func testShareBarExplicitHeightStillWins() throws {
        let bar = ShareBar([.init(52, color: .blue), .init(48, color: .red)], label: Text("Split"), height: 20)
            .environment(\.componentMetrics, ComponentMetrics(bar: 30)).frame(width: 200)
        XCTAssertEqual(try render(bar).height, 20)
    }

    @MainActor
    func testShareBarSegmentGapFollowsTheHostTightStep() throws {
        // Two equal segments in a 200-point bar. With a tight step of 40, the first segment ends at x = 80;
        // with the default tight step of 4 it runs to x = 98. Column 90 is clear only in the wide-gap bar.
        func alphaAtColumn90(_ tight: CGFloat) throws -> UInt8 {
            let bar = ShareBar([.init(1, color: .blue), .init(1, color: .blue)], label: Text("Split"))
                .environment(\.componentMetrics, ComponentMetrics(tight: tight)).frame(width: 200)
            let image = try render(bar)
            let row = image.height / 2
            return rgba(image)[(row * image.width + 90) * 4 + 3]
        }
        XCTAssertEqual(try alphaAtColumn90(40), 0, "a wide host gap leaves column 90 clear")
        XCTAssertGreaterThan(try alphaAtColumn90(4), 0, "the default gap keeps column 90 filled")
    }

    // MARK: ActionButton

    @MainActor
    func testActionButtonProminentFillsWithTheHostTint() throws {
        func button(_ emphasis: ActionButtonStyle.Emphasis) throws -> CGImage {
            try render(ActionButton("Save", emphasis: emphasis) {}
                .environment(\.componentTheme, Theme(tint: red)).frame(width: 240))
        }
        XCTAssertTrue(ComponentIconTests.containsRed(try button(.prominent)))
        XCTAssertFalse(ComponentIconTests.containsRed(try button(.quiet)), "a quiet button keeps its surface")
    }

    @MainActor
    func testActionButtonGrowsWithTheHostTypographyAndPadding() throws {
        func size(_ typography: ComponentTypography, _ metrics: ComponentMetrics) throws -> CGImage {
            try render(ActionButton("Save") {}
                .environment(\.componentTypography, typography).environment(\.componentMetrics, metrics))
        }
        let plain = try size(ComponentTypography(), ComponentMetrics())
        let big = try size(ComponentTypography(action: .system(size: 60)), ComponentMetrics())
        XCTAssertGreaterThan(big.height, plain.height, "the label uses the host action type")
        let roomy = try size(ComponentTypography(), ComponentMetrics(standard: 100))
        XCTAssertGreaterThan(roomy.width, plain.width, "the side padding is the host's standard step")
    }
}
