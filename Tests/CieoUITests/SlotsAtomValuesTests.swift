import CieoUI
import SwiftUI
import XCTest

/// Pins that the value atoms read their bars, steps, type and corners from the host, so one host value
/// restyles every place these atoms draw.
final class SlotsAtomValuesTests: XCTestCase {
    private struct Bitmap {
        let width: Int
        let height: Int
        let pixels: [UInt8]

        init(_ image: CGImage) {
            width = image.width
            height = image.height
            var buffer = [UInt8](repeating: 0, count: width * height * 4)
            if let context = CGContext(data: &buffer, width: width, height: height, bitsPerComponent: 8,
                                       bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(),
                                       bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
            {
                context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
            }
            pixels = buffer
        }

        /// Premultiplied RGBA at a point, with the origin at the top left.
        func pixel(x: Int, y: Int) -> (r: UInt8, g: UInt8, b: UInt8, a: UInt8) {
            let index = (y * width + x) * 4
            return (pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3])
        }

        func count(_ predicate: (_ r: UInt8, _ g: UInt8, _ b: UInt8, _ a: UInt8) -> Bool) -> Int {
            stride(from: 0, to: pixels.count, by: 4).filter {
                predicate(pixels[$0], pixels[$0 + 1], pixels[$0 + 2], pixels[$0 + 3])
            }.count
        }
    }

    @MainActor
    private func bitmap<V: View>(_ view: V) throws -> Bitmap {
        Bitmap(try XCTUnwrap(ImageRenderer(content: view).cgImage))
    }

    @MainActor
    func testProgressRingReadsItsStrokeFromTheHostBar() throws {
        let red = Theme(accent: Color(red: 1, green: 0, blue: 0))
        let plain = try bitmap(ProgressRing(value: 1).environment(\.componentTheme, red))
        let thick = try bitmap(ProgressRing(value: 1).environment(\.componentTheme, red)
            .environment(\.componentMetrics, ComponentMetrics(bar: 30)))
        let accent = { (r: UInt8, g: UInt8, b: UInt8, a: UInt8) in a > 0 && r == a && g == 0 && b == 0 }
        XCTAssertGreaterThan(thick.count(accent), plain.count(accent) * 2, "a thicker host bar paints more of the ring")
    }

    @MainActor
    func testProgressRingReadsItsPaddingFromTheHostTightStep() throws {
        let plain = try bitmap(ProgressRing(value: 0.5))
        let padded = try bitmap(ProgressRing(value: 0.5).environment(\.componentMetrics, ComponentMetrics(tight: 40)))
        XCTAssertEqual(padded.width - plain.width, (40 - 4) * 2, "the host tight step replaces the 4-point padding on each side")
    }

    @MainActor
    func testProgressRingReadsItsPercentageFromTheHostValueRole() throws {
        let plain = try bitmap(ProgressRing(value: 0.5))
        let large = try bitmap(ProgressRing(value: 0.5).environment(\.componentTypography,
                                                                  ComponentTypography(value: .system(size: 60))))
        XCTAssertNotEqual(large.pixels, plain.pixels, "the host value font changes the digits")
    }

    @MainActor
    func testProgressRingDiameterIsAParameterWithTheDefaultKept() throws {
        let plain = try bitmap(ProgressRing(value: 0.5))
        let wide = try bitmap(ProgressRing(value: 0.5, diameter: 120))
        XCTAssertGreaterThan(wide.width, plain.width + 20)
        XCTAssertTrue(ComponentIconTests.containsRed(try XCTUnwrap(ImageRenderer(content:
            ProgressRing(value: 1).environment(\.componentTheme, Theme(accent: Color(red: 1, green: 0, blue: 0)))).cgImage)))
    }

    @MainActor
    func testSegmentedProgressReadsItsHeightFromTheHostBar() throws {
        let plain = try bitmap(SegmentedProgress(total: 10, completed: 10).frame(width: 300))
        let tall = try bitmap(SegmentedProgress(total: 10, completed: 10).frame(width: 300)
            .environment(\.componentMetrics, ComponentMetrics(bar: 30)))
        XCTAssertGreaterThan(tall.height, plain.height + 15)
    }

    @MainActor
    func testSegmentedProgressReadsItsGapFromTheHostCompactStep() throws {
        let transparent = { (_: UInt8, _: UInt8, _: UInt8, a: UInt8) in a == 0 }
        let plain = try bitmap(SegmentedProgress(total: 10, completed: 10).frame(width: 300))
        let roomy = try bitmap(SegmentedProgress(total: 10, completed: 10).frame(width: 300)
            .environment(\.componentMetrics, ComponentMetrics(compact: 24)))
        XCTAssertGreaterThan(roomy.count(transparent), plain.count(transparent) + 9 * 10 * plain.height,
                             "nine gaps widen by the difference between the host step and the default")
    }

    @MainActor
    func testBigNumberReadsItsInlineGapFromTheHostCompactStep() throws {
        let plain = try bitmap(BigNumber("64", label: "days"))
        let roomy = try bitmap(BigNumber("64", label: "days").environment(\.componentMetrics, ComponentMetrics(compact: 60)))
        XCTAssertGreaterThan(roomy.width, plain.width + 40)
    }

    @MainActor
    func testBigNumberReadsItsStackedGapFromTheHostTightStep() throws {
        let plain = try bitmap(BigNumber("64", label: "days", layout: .stacked))
        let roomy = try bitmap(BigNumber("64", label: "days", layout: .stacked)
            .environment(\.componentMetrics, ComponentMetrics(tight: 40)))
        XCTAssertGreaterThan(roomy.height, plain.height + 30)
    }

    func testReadingRoleDefaultsToDetailSizeAndTakesAHostFont() {
        XCTAssertEqual(ComponentTypography().reading, ComponentTypography().detail)
        let host = ComponentTypography(reading: .system(size: 14))
        XCTAssertEqual(host.reading, .system(size: 14))
        XCTAssertEqual(host.detail, ComponentTypography().detail, "a host reading size leaves the supporting-text role alone")
    }

    @MainActor
    func testBigNumberCaptionReadsTheHostStrongDetailRole() throws {
        let plain = try bitmap(BigNumber("64", label: "days", layout: .stacked))
        let large = try bitmap(BigNumber("64", label: "days", layout: .stacked).environment(\.componentTypography,
                                                                                            ComponentTypography(strongDetail: .system(size: 60))))
        XCTAssertGreaterThan(large.height, plain.height + 30)
    }

    @MainActor
    func testBigNumberNumeralTakesTheHostAccent() throws {
        let red = Theme(accent: Color(red: 1, green: 0, blue: 0))
        let image = try XCTUnwrap(ImageRenderer(content: BigNumber("64", label: "days")
            .environment(\.componentTheme, red).frame(width: 300)).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(image))
    }

    @MainActor
    func testHighlightSurfaceReadsItsCornerFromTheHostCorner() throws {
        let square = try bitmap(HighlightSurface(progress: 0.5).frame(width: 100, height: 50)
            .environment(\.componentMetrics, ComponentMetrics(corner: 0)))
        let round = try bitmap(HighlightSurface(progress: 0.5).frame(width: 100, height: 50)
            .environment(\.componentMetrics, ComponentMetrics(corner: 40)))
        XCTAssertGreaterThan(square.pixel(x: 0, y: 0).a, 0, "a square corner is filled")
        XCTAssertEqual(round.pixel(x: 0, y: 0).a, 0, "the host corner rounds the fill away")
    }

    @MainActor
    func testHighlightSurfaceTakesTheHostAccentAtItsFillStrength() throws {
        let red = Theme(accent: Color(red: 1, green: 0, blue: 0))
        let image = try bitmap(HighlightSurface(progress: 0.5).frame(width: 100, height: 50)
            .environment(\.componentTheme, red))
        let centre = image.pixel(x: 50, y: 25)
        XCTAssertEqual(Int(centre.a), 184, accuracy: 4, "the fill keeps its 72% strength")
        XCTAssertEqual(centre.r, centre.a, "the host accent is the only colour in the fill")
        XCTAssertEqual(centre.g, 0)
        XCTAssertEqual(centre.b, 0)
    }

    @MainActor
    func testSymbolMarkReadsItsSizeFromTheCallerParameter() throws {
        let plain = try bitmap(SymbolMark("star.fill"))
        let large = try bitmap(SymbolMark("star.fill", size: 80))
        XCTAssertGreaterThan(large.height, plain.height + 30)
    }

    @MainActor
    func testSymbolMarkDrawsInTheHostForeground() throws {
        let red = Color(red: 1, green: 0, blue: 0)
        let tinted = try XCTUnwrap(ImageRenderer(content: SymbolMark("star.fill", size: 80).foregroundStyle(red)).cgImage)
        let plain = try XCTUnwrap(ImageRenderer(content: SymbolMark("star.fill", size: 80)).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(tinted))
        XCTAssertFalse(ComponentIconTests.containsRed(plain))
    }
}
