@testable import CieoGallery
import CieoAtoms
import CieoUI
import SwiftUI
import XCTest
#if canImport(AppKit)
import AppKit
#endif

final class CieoGalleryTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)

    private static func containsRed(_ image: CGImage) -> Bool {
        let width = image.width, height = image.height
        var pixels = [UInt8](repeating: 0, count: width * height * 4)
        guard let context = CGContext(
            data: &pixels,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: width * 4,
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { return false }
        context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        return stride(from: 0, to: pixels.count, by: 4).contains {
            pixels[$0] > 200 && pixels[$0 + 1] < 60 && pixels[$0 + 2] < 60
        }
    }

    @MainActor
    func testSpecimenReadsComponentThemeSurfaceBorderAndMetrics() throws {
        let card = Specimen(title: "Card") {
            Text("Body")
        }
        .padding(12)
        .background(Color.white)
        .environment(\.componentTheme, Theme(surface: red, border: red))
        .environment(\.componentMetrics, ComponentMetrics.preset(density: .spacious, corners: .round))
        .frame(width: 320)

        let image = try XCTUnwrap(ImageRenderer(content: card).cgImage)
        XCTAssertTrue(Self.containsRed(image), "Specimen card paints componentTheme.surface over its canvas")
    }

    @MainActor
    func testFoundationCatalogIncludesEditorialCategoryAndThemeSwitcher() throws {
        XCTAssertTrue(FoundationCatalog.Category.allCases.map(\.rawValue).contains("Editorial"))
        for brand in ThemeBrand.allCases {
            for ground in ThemeGround.allCases {
                let theme = FoundationCatalog.resolvedTheme(usePreset: true, brand: brand, ground: ground)
                XCTAssertEqual(theme.elevationRingWidth, 1)
            }
        }
        let systemFallback = FoundationCatalog.resolvedTheme(usePreset: false, brand: .iris, ground: .cool)
        XCTAssertEqual(systemFallback.elevationRingWidth, 0)
    }

    @MainActor
    func testEditorialAndCleanedGalleryExamplesRenderAtPhoneWidth() throws {
        let views: [AnyView] = [
            AnyView(EditorialExamples()),
            AnyView(AudioCaptureExamples()),
            AnyView(MessagingFeedbackExamples()),
            AnyView(MoleculeExamples()),
        ]
        for (index, view) in views.enumerated() {
            let rendered = view
                .environment(\.componentTheme, Theme.preset(brand: .studio, ground: .paper))
                .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
                .frame(width: 390)
            let image = try XCTUnwrap(ImageRenderer(content: rendered).cgImage, "example \(index)")
            XCTAssertGreaterThan(image.height, 200, "example \(index) rendered non-empty content without nested ScrollView collapse")
        }
    }

    @MainActor
    func testWave2GalleryViewsAndAdaptiveCatalogShellRenderAndAuditContrast() throws {
        let env = EnvironmentValues()
        let blackOnWhite = ThemeStudioView.contrastRatio(.black, .white, in: env)
        XCTAssertEqual(blackOnWhite, 21.0, accuracy: 0.2)
        let presetTheme = Theme.preset(brand: .instrument, ground: .paper)
        XCTAssertGreaterThanOrEqual(
            ThemeStudioView.contrastRatio(presetTheme.foreground, presetTheme.surface, in: env),
            7.0,
            "audited instrument:paper text on surface meets AAA contrast"
        )

        XCTAssertTrue(AdaptiveCatalogSection.allCases.contains(.overview))
        XCTAssertTrue(AdaptiveCatalogSection.allCases.contains(.themeStudio))
        XCTAssertTrue(AdaptiveCatalogSection.allCases.contains(.agentAndAuth))
        XCTAssertTrue(AdaptiveCatalogSection.allCases.contains(.motionRecipes))
        XCTAssertTrue(AdaptiveCatalogSection.allCases.contains(.physicsLab))

        let wave2Views: [AnyView] = [
            AnyView(ThemeStudioView()),
            AnyView(PhysicsLabView()),
            AnyView(AgentAndAuthExamples()),
        ]
        for (index, view) in wave2Views.enumerated() {
            let rendered = view
                .environment(\.componentTheme, presetTheme)
                .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
                .frame(width: 390)
            let image = try XCTUnwrap(ImageRenderer(content: rendered).cgImage, "wave2 gallery \(index)")
            XCTAssertGreaterThan(image.height, 200, "wave2 gallery \(index) renders non-empty specimens")
        }

        _ = ComponentCatalog().body
        _ = CatalogRoot().body
        #if canImport(AppKit)
        let hosting = NSHostingView(rootView: ComponentCatalog().environment(\.renderPolicy, RenderPolicy(motionDisabled: true)))
        hosting.frame = NSRect(x: 0, y: 0, width: 1024, height: 680)
        hosting.layoutSubtreeIfNeeded()
        XCTAssertEqual(hosting.bounds.width, 1024)
        #endif
    }

    @MainActor
    func testWave3CommandSearchIndexConfigurableSpecimenAndChartsSuperposition() throws {
        // 1. Global Command Search indexes sections, quick brand/ground switches, and featured MotionAtoms
        let groups = CatalogCommandIndex.groups(featuredCount: 12)
        XCTAssertEqual(groups.count, 3)

        let contrastMatches = CommandPaletteView.filterGroups(groups, query: "wcag")
        XCTAssertTrue(contrastMatches.flatMap(\.items).contains {
            CatalogCommandIndex.resolve($0.id) == .section(.themeStudio)
        })

        let brandMatches = CommandPaletteView.filterGroups(groups, query: "lagoon")
        XCTAssertTrue(brandMatches.flatMap(\.items).contains {
            CatalogCommandIndex.resolve($0.id) == .brand(.lagoon)
        })

        let groundMatches = CommandPaletteView.filterGroups(groups, query: "mist")
        XCTAssertTrue(groundMatches.flatMap(\.items).contains {
            CatalogCommandIndex.resolve($0.id) == .ground(.mist)
        })

        let recipeItems = groups.first { $0.id == "recipes" }?.items ?? []
        XCTAssertEqual(recipeItems.count, 12)
        let firstRecipeID = try XCTUnwrap(recipeItems.first?.id)
        if case .recipe(let atomID) = CatalogCommandIndex.resolve(firstRecipeID) {
            XCTAssertTrue(MotionAtoms.all.contains { $0.id == atomID })
        } else {
            XCTFail("Expected featured recipe command to resolve to .recipe(atomID)")
        }

        // 2. ConfigurableSpecimen state clamps width, maps DynamicTypeSize, toggles RTL & code disclosure
        var specState = ConfigurableSpecimenState(
            constrainWidth: true,
            constrainedWidth: 9999,
            typeSizePreset: .accessibility2,
            layoutDirection: .rightToLeft,
            isCodeExpanded: true
        )
        XCTAssertEqual(specState.constrainedWidth, 720)
        XCTAssertEqual(specState.typeSizePreset.dynamicTypeSize, .accessibility2)
        specState.setWidth(120)
        XCTAssertEqual(specState.constrainedWidth, 240)

        let configurable = ConfigurableSpecimen(
            title: "Action button",
            code: "ActionButton(\"Save\", phase: .idle) {}",
            initialState: specState
        ) {
            ActionButton("Save", phase: .idle) {}
        }
        .environment(\.componentTheme, Theme(surface: red))
        .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
        .frame(width: 420)

        let specImage = try XCTUnwrap(ImageRenderer(content: configurable).cgImage)
        XCTAssertGreaterThan(specImage.height, 120)
        XCTAssertTrue(Self.containsRed(specImage))

        // 3. PhysicsLabView Charts curve sampler & impulse superposition continuity
        let superposition = PhysicsLabView.sampleCurves(mode: .superposition, customW: 22, customZeta: 0.9)
        XCTAssertFalse(superposition.isEmpty)
        let customSamples = superposition.filter { $0.series == "custom" }
        XCTAssertGreaterThan(customSamples.count, 20)
        XCTAssertTrue(customSamples.allSatisfy { $0.value.isFinite })
    }

    func testEveryPublicCieoUIViewAppearsInGalleryAndZeroOffsetIdentitiesRemain() throws {
        let root = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
        let fm = FileManager.default

        func swiftFiles(in relative: String) -> [URL] {
            guard let enumerator = fm.enumerator(at: root.appendingPathComponent(relative), includingPropertiesForKeys: nil) else {
                return []
            }
            return enumerator.compactMap { $0 as? URL }.filter { $0.pathExtension == "swift" }
        }

        let galleryCombined = try swiftFiles(in: "Sources/CieoGallery")
            .map { try String(contentsOf: $0, encoding: .utf8) }
            .joined(separator: "\n")

        let structRegex = try NSRegularExpression(pattern: #"public struct (\w+)(?:<[^>]+>)?:\s*View\b"#)
        for folder in ["Sources/CieoUI/Atoms", "Sources/CieoUI/Molecules", "Sources/CieoUI/Organisms"] {
            for file in swiftFiles(in: folder) {
                let text = try String(contentsOf: file, encoding: .utf8)
                let nsRange = NSRange(text.startIndex..<text.endIndex, in: text)
                for match in structRegex.matches(in: text, range: nsRange) {
                    guard let range = Range(match.range(at: 1), in: text) else { continue }
                    let viewName = String(text[range])
                    XCTAssertTrue(
                        galleryCombined.range(of: #"\b\#(viewName)\b"#, options: .regularExpression) != nil,
                        "Public CieoUI view \(viewName) must appear in CieoGallery"
                    )
                }
            }
        }

        for folder in ["Sources", "atoms/swift"] {
            for file in swiftFiles(in: folder) {
                let text = try String(contentsOf: file, encoding: .utf8)
                XCTAssertFalse(text.contains(#"id: \.offset"#), "\(file.lastPathComponent) must use stable element identity")
            }
        }
    }
}
