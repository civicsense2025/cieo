import CieoUI
import SwiftUI
import XCTest

/// Pins SectionHeader's trailing slots: any accessory or a quiet value, read from the host slots, stacked
/// under the title when narrow, while the existing "See all" action keeps working unchanged.
final class SectionHeaderAccessoryTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)

    @MainActor
    private func image<V: View>(_ view: V, width: CGFloat = 390) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view.frame(width: width)).cgImage)
    }

    @MainActor
    func testAccessoryDrawsBesideTheTitle() throws {
        let header = SectionHeader("Bills") { red.frame(width: 12, height: 12) }
        XCTAssertTrue(ComponentIconTests.containsRed(try image(header)))
        XCTAssertGreaterThanOrEqual(try image(header).height, 44, "the trailing slot keeps the touch target")
    }

    @MainActor
    func testIconOnlyAccessoryCanCenterWithoutInventingATextBaseline() throws {
        let header = SectionHeader("Categories", accessoryAlignment: .center) {
            Button {} label: { red.frame(width: 12, height: 12) }
                .buttonStyle(.plain)
                .frame(width: 44, height: 44)
        }
        let rendered = try image(header)
        let pixels = try rgba(rendered)
        let redRows = stride(from: 0, to: pixels.count, by: 4).compactMap { offset -> Int? in
            pixels[offset] > 200 && pixels[offset + 1] < 60 && pixels[offset + 2] < 60
                ? (offset / 4) / rendered.width : nil
        }
        let first = try XCTUnwrap(redRows.min()), last = try XCTUnwrap(redRows.max())
        XCTAssertEqual(CGFloat(first + last + 1) / 2, CGFloat(rendered.height) / 2, accuracy: 1)
        XCTAssertGreaterThanOrEqual(rendered.height, 44)
    }

    @MainActor
    func testExistingTextAccessoryDefaultMatchesExplicitFirstBaseline() throws {
        let original = try image(SectionHeader("Top stories") { Text(verbatim: "Browse") })
        let explicit = try image(SectionHeader("Top stories", accessoryAlignment: .firstTextBaseline) { Text(verbatim: "Browse") })
        XCTAssertEqual(original.width, explicit.width)
        XCTAssertEqual(original.height, explicit.height)
        XCTAssertEqual(try rgba(original), try rgba(explicit))
    }

    @MainActor
    func testCenteredAccessoryKeepsNarrowTitleWrapping() throws {
        let header = SectionHeader("Closest races in your state", accessoryAlignment: .center) {
            red.frame(width: 44, height: 44)
        }
        XCTAssertGreaterThan(try image(header, width: 160).height, try image(header, width: 600).height)
    }

    private func rgba(_ image: CGImage) throws -> [UInt8] {
        var pixels = [UInt8](repeating: 0, count: image.width * image.height * 4)
        let context = try XCTUnwrap(CGContext(data: &pixels, width: image.width, height: image.height,
            bitsPerComponent: 8, bytesPerRow: image.width * 4, space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue))
        context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
        return pixels
    }

    @MainActor
    func testAccessoryTextTakesTheHostAccentAndActionType() throws {
        let header = SectionHeader("Bills") { Text(verbatim: "Browse") }
        XCTAssertTrue(ComponentIconTests.containsRed(try image(header.environment(\.componentTheme, Theme(accent: red)))))
        let plain = try image(header).height
        let big = try image(header.environment(\.componentTypography, ComponentTypography(strongBody: .system(size: 80)))).height
        XCTAssertGreaterThan(big, plain)
    }

    @MainActor
    func testValueIsQuietAndReadsTheValueRole() throws {
        let header = SectionHeader("Bills", value: Text(verbatim: "12"))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(header.environment(\.componentTheme, Theme(secondary: red)))),
                      "the value uses the secondary colour")
        XCTAssertFalse(ComponentIconTests.containsRed(try image(header.environment(\.componentTheme, Theme(accent: red)))),
                       "the value is not styled as an action")
        let plain = try image(header).height
        let big = try image(header.environment(\.componentTypography, ComponentTypography(value: .system(size: 80)))).height
        XCTAssertGreaterThan(big, plain)
    }

    @MainActor
    func testNarrowWidthsStackTheAccessoryUnderTheTitleInsteadOfTruncating() throws {
        let header = SectionHeader("Closest races in your state", value: Text(verbatim: "1,204 races"))
        XCTAssertGreaterThan(try image(header, width: 160).height, try image(header, width: 600).height)
    }

    @MainActor
    func testExistingActionCallSitesStillDrawTheirAction() throws {
        let header = SectionHeader("Top stories", action: {}).environment(\.componentTheme, Theme(accent: red))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(header)))
        let noAction = SectionHeader("Top stories").environment(\.componentTheme, Theme(accent: red))
        XCTAssertFalse(ComponentIconTests.containsRed(try image(noAction)), "no action, no trailing slot")
    }
}
