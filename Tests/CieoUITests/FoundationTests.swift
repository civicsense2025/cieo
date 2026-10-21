import CieoUI
import SwiftUI
import XCTest

final class FoundationTests: XCTestCase {
    private let frame = CGRect(x: 0, y: 0, width: 100, height: 160)

    func testEveryCutFillsItsFrameExactly() {
        for kind in CutShape.Kind.allCases {
            let bounds = CutShape(kind).path(in: frame).boundingRect
            XCTAssertEqual(bounds.minX, 0, accuracy: 0.5, "\(kind)")
            XCTAssertEqual(bounds.minY, 0, accuracy: 0.5, "\(kind)")
            XCTAssertEqual(bounds.width, 100, accuracy: 0.5, "\(kind)")
            XCTAssertEqual(bounds.height, 160, accuracy: 0.5, "\(kind)")
        }
        XCTAssertEqual(CutShape.Kind.allCases.count, 9, "the nine cuts of the study")
    }

    func testCutsRoundTheCornersTheyNameAndKeepTheRest() {
        let near: CGFloat = 3
        let topLeft = CGPoint(x: near, y: near), topRight = CGPoint(x: 100 - near, y: near)
        let bottomLeft = CGPoint(x: near, y: 160 - near), bottomRight = CGPoint(x: 100 - near, y: 160 - near)
        func check(_ kind: CutShape.Kind, cut: [CGPoint], kept: [CGPoint]) {
            let path = CutShape(kind).path(in: frame)
            for point in cut { XCTAssertFalse(path.contains(point), "\(kind) should cut \(point)") }
            for point in kept { XCTAssertTrue(path.contains(point), "\(kind) should keep \(point)") }
        }
        check(.arch, cut: [topLeft, topRight], kept: [bottomLeft, bottomRight])
        check(.invertedArch, cut: [bottomLeft, bottomRight], kept: [topLeft, topRight])
        check(.circle, cut: [topLeft, topRight, bottomLeft, bottomRight], kept: [CGPoint(x: 50, y: 80)])
        check(.leadingPill, cut: [topLeft, bottomLeft], kept: [topRight, bottomRight])
        check(.square, cut: [], kept: [topLeft, topRight, bottomLeft, bottomRight])
        check(.quarter(.topLeading), cut: [topLeft], kept: [topRight, bottomLeft, bottomRight])
        check(.quarter(.topTrailing), cut: [topRight], kept: [topLeft, bottomLeft, bottomRight])
        check(.quarter(.bottomLeading), cut: [bottomLeft], kept: [topLeft, topRight, bottomRight])
        check(.quarter(.bottomTrailing), cut: [bottomRight], kept: [topLeft, topRight, bottomLeft])
    }

    func testCutsMirrorInRightToLeftLayouts() {
        XCTAssertEqual(CutShape(.leadingPill).layoutDirectionBehavior, .mirrors)
    }

    func testEmptyOrInvalidFramesDrawNothing() {
        XCTAssertTrue(CutShape(.arch).path(in: .zero).isEmpty)
        XCTAssertTrue(CutShape(.circle).path(in: CGRect(x: 0, y: 0, width: CGFloat.nan, height: 10)).isEmpty)
    }

    func testDisplayDefaultsAreSizedForAPhone() {
        let type = DisplayTypography()
        XCTAssertEqual(type.display.size, 30)
        XCTAssertEqual(type.title.size, 22)
        XCTAssertEqual(type.headline.size, 20)
        XCTAssertEqual([type.numeralLarge.size, type.numeralMedium.size, type.numeralSmall.size], [64, 44, 28])
        XCTAssertEqual(type.display.weight, .black)
        XCTAssertLessThan(type.display.tracking, 0, "display type is tightly tracked")
        for role in DisplayRole.allCases {
            XCTAssertGreaterThanOrEqual(type[role].maximumSize, type[role].size)
        }
        for role in [DisplayRole.numeralLarge, .numeralMedium, .numeralSmall] {
            XCTAssertTrue(type[role].monospacedDigits, "numerals line up in columns")
        }
        // Sizes step down so hierarchy holds at the default text size.
        XCTAssertGreaterThan(type.display.size, type.title.size)
        XCTAssertGreaterThan(type.title.size, type.headline.size)
        XCTAssertGreaterThan(type.numeralLarge.size, type.numeralMedium.size)
        XCTAssertGreaterThan(type.numeralMedium.size, type.numeralSmall.size)
    }

    func testDisplayStylesRejectUnsafeValuesAndCapScaling() {
        let bad = DisplayStyle(size: .nan, maximumSize: -4, textStyle: .body, tracking: .infinity, fontName: "")
        XCTAssertEqual(bad.size, 17)
        XCTAssertEqual(bad.maximumSize, 17)
        XCTAssertEqual(bad.tracking, 0)
        XCTAssertNil(bad.fontName)
        XCTAssertEqual(DisplayStyle(size: 20, textStyle: .body, tracking: -3).tracking, -0.2)
        let numeral = DisplayStyle(size: 64, maximumSize: 80, textStyle: .largeTitle)
        XCTAssertEqual(numeral.clamped(200), 80, "accessibility sizes stop at the maximum")
        XCTAssertEqual(numeral.clamped(70), 70)
        XCTAssertEqual(numeral.clamped(10), 32, "never shrinks below half the base size")
        XCTAssertEqual(numeral.clamped(.nan), 64)
    }

    func testThemeKeepsExistingDefaultsAndAddsBlockRoles() {
        let theme = Theme()
        XCTAssertEqual(theme.foreground, .primary)
        XCTAssertEqual(theme.onAccent, .white)
        XCTAssertEqual(theme.block, .black)
        XCTAssertEqual(theme.onBlock, .white)
        XCTAssertEqual(theme.tint, Color.accentColor.opacity(0.18), "tint follows the accent unless the host sets it")
        let host = Theme(accent: .blue, tint: .mint)
        XCTAssertEqual(host.tint, .mint)
        XCTAssertEqual(Theme(accent: .blue).tint, Color.blue.opacity(0.18))
    }

    @MainActor
    func testDisplayTextAndCutsComposeWithNativeViews() {
        _ = Text("This week").displayText(.display)
        _ = Text("12").displayText(DisplayStyle(size: 40, textStyle: .title))
        _ = Color.blue.clipShape(CutShape(.quarter(.bottomTrailing)))
    }
}

final class ComponentIconTests: XCTestCase {
    func testEveryGlyphHasASystemDefault() {
        let names = ComponentIcon.allCases.map(ComponentIcons.systemName)
        XCTAssertEqual(names.count, 5)
        XCTAssertFalse(names.contains(""))
    }

    @MainActor
    func testHostGlyphsReplaceTheDefaults() throws {
        // A host glyph that is a solid red square makes the swap visible in pixels.
        let host = ComponentIcons { _ in Color.red.frame(width: 20, height: 20) }
        let row = IndexRow(rank: nil, title: Text("Row")).environment(\.componentIcons, host).frame(width: 200)
        let image = try XCTUnwrap(ImageRenderer(content: row).cgImage)
        XCTAssertTrue(Self.containsRed(image), "the row's chevron is the host glyph")
        let plain = try XCTUnwrap(ImageRenderer(content: IndexRow(rank: nil, title: Text("Row")).frame(width: 200)).cgImage)
        XCTAssertFalse(Self.containsRed(plain))
    }

    static func containsRed(_ image: CGImage) -> Bool {
        let width = image.width, height = image.height
        var pixels = [UInt8](repeating: 0, count: width * height * 4)
        guard let context = CGContext(data: &pixels, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4,
                                      space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
        else { return false }
        context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        return stride(from: 0, to: pixels.count, by: 4).contains { pixels[$0] > 200 && pixels[$0 + 1] < 60 && pixels[$0 + 2] < 60 }
    }
}
