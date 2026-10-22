import CieoUI
import SwiftUI
import XCTest

/// Pins where a glyph beside text lands and how big it is: centred on the first line of text and sized
/// from the text's role, for SF Symbols and for shapes a host draws, at default and accessibility sizes.
final class InlineGlyphTests: XCTestCase {
    private static let scale: CGFloat = 2
    private static let red = Color(red: 1, green: 0, blue: 0)
    private static let ink = Theme(foreground: .black)

    /// The host glyph sets the app ships with: SF Symbols, a bare drawn shape that fills what it is offered,
    /// and a drawn shape that carries its own fixed frame (as a host icon scaled for body text does).
    private static let hosts: [(String, ComponentIcons)] = [
        ("SF Symbol", ComponentIcons { Image(systemName: ComponentIcons.systemName($0)).foregroundStyle(red) }),
        ("drawn shape", ComponentIcons { _ in Circle().fill(red) }),
        ("fixed-frame shape", ComponentIcons { _ in Circle().fill(red).frame(width: 24, height: 24) }),
    ]

    /// Text sizes to check. `swift test` runs on macOS, which ignores `dynamicTypeSize`, so the accessibility
    /// case also sets the label's text role at the size iOS gives it at AX3; on iOS both agree.
    private static let sizes: [(String, DynamicTypeSize, ComponentTypography)] = [
        ("default size", .large, ComponentTypography()),
        ("accessibility size", .accessibility3, ComponentTypography(detail: .system(size: 39))),
    ]

    private struct Rows {
        /// Top and bottom pixel rows of the red glyph.
        let glyph: ClosedRange<Int>
        /// Top and bottom pixel rows of the first line's ink (capital letters only, so cap top to baseline).
        let firstLine: ClosedRange<Int>
        var glyphMid: Double { Double(glyph.lowerBound + glyph.upperBound) / 2 }
        var capMid: Double { Double(firstLine.lowerBound + firstLine.upperBound) / 2 }
        var capHeight: Double { Double(firstLine.upperBound - firstLine.lowerBound) }
    }

    @MainActor
    private func rows<V: View>(_ view: V) throws -> Rows {
        let renderer = ImageRenderer(content: view.environment(\.componentTheme, Self.ink))
        renderer.scale = Self.scale
        let image = try XCTUnwrap(renderer.cgImage)
        let width = image.width, height = image.height
        var pixels = [UInt8](repeating: 0, count: width * height * 4)
        let context = try XCTUnwrap(CGContext(data: &pixels, width: width, height: height, bitsPerComponent: 8,
                                              bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(),
                                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue))
        context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        var glyphRows: [Int] = [], textRows: [Int] = []
        for y in 0..<height {
            var hasGlyph = false, hasText = false
            for x in 0..<width {
                let i = (y * width + x) * 4
                let (r, g, b, a) = (pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])
                if a > 200 && r > 200 && g < 60 && b < 60 { hasGlyph = true }
                if a > 200 && r < 60 && g < 60 && b < 60 { hasText = true }
            }
            if hasGlyph { glyphRows.append(y) }
            if hasText { textRows.append(y) }
        }
        let glyphTop = try XCTUnwrap(glyphRows.first, "the glyph draws")
        let textTop = try XCTUnwrap(textRows.first, "the text draws")
        // The first line ends where the first gap in the text's ink begins.
        var textBottom = textTop
        while textRows.contains(textBottom + 1) { textBottom += 1 }
        return Rows(glyph: glyphTop...glyphRows.last!, firstLine: textTop...textBottom)
    }

    /// Three lines of capitals at this width, so "first line" is a real choice.
    private static let wrapping = "HHHH HHHH HHHH HHHH HHHH HHHH"

    @MainActor
    func testStatusLabelCentresEveryHostGlyphOnTheFirstLine() throws {
        for (name, host) in Self.hosts {
            for (size, dynamicType, typography) in Self.sizes {
                let label = StatusLabel(Self.wrapping, icon: .check)
                    .environment(\.componentIcons, host).environment(\.dynamicTypeSize, dynamicType)
                    .environment(\.componentTypography, typography)
                    // Wide enough for three lines of capitals at either size.
                    .frame(width: dynamicType.isAccessibilitySize ? 400 : 140, alignment: .leading)
                let measured = try rows(label)
                // Within a quarter of the cap height of the capitals' midline: a glyph resting on the
                // baseline sits half its own height higher and fails this.
                XCTAssertEqual(measured.glyphMid, measured.capMid, accuracy: max(2, measured.capHeight / 4),
                               "\(name) at \(size) sits on the first line")
                XCTAssertTrue(measured.firstLine.contains(Int(measured.glyphMid)),
                              "\(name) at \(size) is centred inside the first line, not above it")
            }
        }
    }

    @MainActor
    func testNoticeAndChoiceCentreHostGlyphsOnTheirFirstLine() throws {
        let shape = Self.hosts[1].1
        let notice = Notice("HHHH HHHH HHHH", detail: "HHHH", icon: .error)
            .environment(\.componentIcons, shape).frame(width: 140, alignment: .leading)
        let chip = SelectionChip("HHHH", isSelected: .constant(false)).environment(\.componentIcons, shape)
        for (name, view) in [("notice", AnyView(notice)), ("choice", AnyView(chip))] {
            let measured = try rows(view)
            XCTAssertEqual(measured.glyphMid, measured.capMid, accuracy: max(2, measured.capHeight / 4),
                           "\(name) glyph sits on its first line")
        }
    }

    @MainActor
    func testDrawnGlyphSizeFollowsTheTextRole() throws {
        let shape = Self.hosts[1].1
        func glyphHeight(_ font: KeyPath<ComponentTypography, Font>, size: Int = 0,
                         metrics: ComponentMetrics = ComponentMetrics()) throws -> (glyph: Int, line: Int) {
            let (_, dynamicType, typography) = Self.sizes[size]
            let label = StatusLabel("HHHH", icon: .check, font: font)
                .environment(\.componentIcons, shape).environment(\.componentMetrics, metrics)
                .environment(\.dynamicTypeSize, dynamicType).environment(\.componentTypography, typography)
            let renderer = ImageRenderer(content: label.environment(\.componentTheme, Self.ink))
            renderer.scale = Self.scale
            let image = try XCTUnwrap(renderer.cgImage)
            let measured = try rows(label)
            return (measured.glyph.count, image.height)
        }
        let detail = try glyphHeight(\.detail)
        let heading = try glyphHeight(\.title)
        let large = try glyphHeight(\.detail, size: 1)
        // The drawn glyph is the metrics' share of the text line it sits on.
        for sample in [detail, heading, large] {
            XCTAssertEqual(Double(sample.glyph), Double(sample.line) * 0.8, accuracy: 3)
        }
        XCTAssertGreaterThan(heading.glyph, detail.glyph, "a bigger text role draws a bigger glyph")
        XCTAssertGreaterThan(large.glyph, detail.glyph, "the glyph grows with Dynamic Type")
        let smaller = try glyphHeight(\.detail, metrics: ComponentMetrics(glyphScale: 0.5))
        XCTAssertLessThan(smaller.glyph, detail.glyph, "the host's glyph share is honoured")
    }

    @MainActor
    func testSymbolGlyphSizeFollowsTheTextRole() throws {
        let symbol = Self.hosts[0].1
        func glyphHeight(_ font: KeyPath<ComponentTypography, Font>) throws -> Int {
            try rows(StatusLabel("HHHH", icon: .error, font: font).environment(\.componentIcons, symbol)).glyph.count
        }
        XCTAssertGreaterThan(try glyphHeight(\.title), try glyphHeight(\.detail))
    }

    @MainActor
    func testGlyphOnlyControlsSizeDrawnGlyphsFromTheirGlyphRole() throws {
        let shape = Self.hosts[1].1
        let renderer = ImageRenderer(content: IconButton(.clear, label: "Clear") {}
            .environment(\.componentIcons, shape))
        let image = try XCTUnwrap(renderer.cgImage)
        let button = try rows(HStack {
            Text("H").font(ComponentTypography().glyph).foregroundStyle(.black)
            IconButton(.clear, label: "Clear") {}.environment(\.componentIcons, shape)
        })
        XCTAssertGreaterThanOrEqual(image.height, 44, "the touch target stays full size")
        XCTAssertLessThan(button.glyph.count, 44 * Int(Self.scale) / 2,
                          "a drawn glyph takes its size from the glyph font, not the whole touch target")
    }

    private struct Step: Identifiable { let id: Int }

    @MainActor
    func testPathwayCheckIsSizedFromTheNodeNotTheNumberText() throws {
        let shape = Self.hosts[1].1
        let node = try rows(Pathway([Step(id: 0)], stage: { _ in .done }, accessibilityName: { _ in Text("One") }) { _, _ in
            Text("H").foregroundStyle(.black)
        }.environment(\.componentIcons, shape))
        // A node is about 56pt at the default size; its check should read at roughly 40% of it, as before
        // inline glyphs, not at the small number text's line height.
        XCTAssertGreaterThanOrEqual(node.glyph.count, 16 * Int(Self.scale), "the check fills a share of the node")
    }

    func testGlyphScaleStaysAShare() {
        XCTAssertEqual(ComponentMetrics().glyphScale, 0.8)
        XCTAssertEqual(ComponentMetrics(glyphScale: .nan).glyphScale, 0.8)
        XCTAssertEqual(ComponentMetrics(glyphScale: 3).glyphScale, 1)
        XCTAssertEqual(ComponentMetrics(glyphScale: -1).glyphScale, 0)
    }
}
