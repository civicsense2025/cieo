import CieoUI
import SwiftUI
import XCTest

final class AtomTests: XCTestCase {
    func testShareBarDrawsOnlyRealShares() {
        let shares = ShareBar.fractions([52, 48])
        XCTAssertEqual(shares?.count, 2)
        XCTAssertEqual(shares?[0] ?? 0, 0.52, accuracy: 0.0001)
        XCTAssertEqual(shares?.reduce(0, +) ?? 0, 1, accuracy: 0.0001)
        XCTAssertEqual(ShareBar.fractions([1, 1, 2])?.last ?? 0, 0.5, accuracy: 0.0001)
        // A missing or zero share never becomes a fake split.
        XCTAssertNil(ShareBar.fractions([52, 0]))
        XCTAssertNil(ShareBar.fractions([52, .nan]))
        XCTAssertNil(ShareBar.fractions([-3, 50]))
        XCTAssertNil(ShareBar.fractions([100]))
        XCTAssertNil(ShareBar.fractions([]))
    }

    func testSegmentedProgressHoldsCountsInRange() {
        XCTAssertTrue(SegmentedProgress.normalized(total: 10, completed: 4) == (10, 4))
        XCTAssertTrue(SegmentedProgress.normalized(total: 10, completed: 14) == (10, 10))
        XCTAssertTrue(SegmentedProgress.normalized(total: 10, completed: -1) == (10, 0))
        XCTAssertTrue(SegmentedProgress.normalized(total: 0, completed: 0) == (1, 0), "always at least one segment")
        XCTAssertTrue(SegmentedProgress.normalized(total: 500, completed: 500) == (60, 60), "bounded segment count")
    }

    func testBlockPanelBleedSitsPartlyOutsideItsCorner() {
        let shift = BlockPanel<EmptyView>.offset(.init(corner: .topTrailing, diameter: 200))
        XCTAssertEqual(shift.width, 60)
        XCTAssertEqual(shift.height, -60)
        let lower = BlockPanel<EmptyView>.offset(.init(corner: .bottomLeading, diameter: 100))
        XCTAssertEqual(lower.width, -30)
        XCTAssertEqual(lower.height, 30)
    }

    func testBlockPanelTextStaysClearOfTheCircle() {
        XCTAssertEqual(BlockPanel<EmptyView>.reservedWidth(.init(diameter: 200)), 120)
        XCTAssertEqual(BlockPanel<EmptyView>.reservedWidth(.init(diameter: 20)), 0)
    }

    func testBlockPanelBleedStaysBounded() {
        XCTAssertEqual(BlockPanel<EmptyView>.Bleed(diameter: .infinity).diameter, 200)
        XCTAssertEqual(BlockPanel<EmptyView>.Bleed(diameter: -5).diameter, 0)
        XCTAssertEqual(BlockPanel<EmptyView>.Bleed(diameter: 5000).diameter, 600)
    }

    @MainActor
    func testAtomsRenderAtPhoneWidthInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            let sheet = Self.specimens(scheme).environment(\.colorScheme, scheme)
            let renderer = ImageRenderer(content: sheet.frame(width: 390))
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.cgImage, "specimens render in \(scheme)")
            XCTAssertEqual(image.width, 780)
            XCTAssertGreaterThan(image.height, 600, "every specimen takes up space")
            try Self.save(image, name: "atoms-\(scheme)")
        }
    }

    @MainActor
    /// macOS does not apply Dynamic Type, so this pins width only; text scaling is checked on the iOS simulator.
    func testAtomsStayInsideAPhoneWidthWithLargeTextRequested() throws {
        let sheet = Self.specimens(.light).environment(\.dynamicTypeSize, .accessibility5)
        let renderer = ImageRenderer(content: sheet.frame(width: 390))
        let image = try XCTUnwrap(renderer.cgImage)
        XCTAssertEqual(image.width, 390, "nothing widens the frame at accessibility sizes")
        try Self.save(image, name: "atoms-ax5")
    }

    @MainActor
    static func specimens(_ scheme: ColorScheme) -> some View {
        let theme = Theme(accent: Color(red: 0.15, green: 0.39, blue: 0.92))
        return VStack(alignment: .leading, spacing: 20) {
            HStack(spacing: 12) {
                ForEach(Array(CutShape.Kind.allCases.enumerated()), id: \.offset) { _, kind in
                    CutSurface(kind, fill: theme.accent).frame(width: 32, height: 48)
                }
            }
            CutSurface(.arch) { LinearGradient(colors: [.orange, .pink], startPoint: .top, endPoint: .bottom) }
                .frame(width: 120, height: 150)
            BigNumber("64", label: "days until the election")
            BigNumber("12", label: "bills this week", role: .numeralSmall, layout: .stacked)
            ShareBar([.init(52, color: .blue), .init(48, color: .red)], label: Text("Democratic 52%, Republican 48%"))
            ShareBar([.init(52, color: .blue), .init(0, color: .red)], label: Text("No result"))
            SegmentedProgress(total: 10, completed: 4, label: Text("Questions answered"))
            BlockPanel(bleed: .init(diameter: 160)) {
                Text("Today's question").displayText(.title)
                Text("Who can call a special session of Congress?")
            }
        }
        .padding(16)
        .background(scheme == .dark ? Color(white: 0.04) : Color(white: 0.97))
        .environment(\.componentTheme, theme)
    }

    /// Writes the rendering for review when CIEO_RENDER_DIR is set; does nothing otherwise.
    static func save(_ image: CGImage, name: String) throws {
        guard let directory = ProcessInfo.processInfo.environment["CIEO_RENDER_DIR"], !directory.isEmpty else { return }
        let url = URL(fileURLWithPath: directory).appendingPathComponent(name + ".png")
        guard let destination = CGImageDestinationCreateWithURL(url as CFURL, "public.png" as CFString, 1, nil) else { return }
        CGImageDestinationAddImage(destination, image, nil)
        XCTAssertTrue(CGImageDestinationFinalize(destination))
    }
}
