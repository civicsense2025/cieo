@testable import CieoGallery
import CieoUI
import SwiftUI
import XCTest

final class GalleryReviewFixesTests: XCTestCase {
    func testSpecimenFollowsSystemTextSizeUnlessAPresetIsChosen() {
        XCTAssertNil(ConfigurableSpecimenState().typeSizePreset, "default must not override the reader's Dynamic Type")
        XCTAssertEqual(ConfigurableSpecimenState(typeSizePreset: .xxLarge).typeSizePreset?.dynamicTypeSize, .xxLarge)
    }

    func testPhysicsLabDefaultsToCriticallyDamped() {
        XCTAssertEqual(PhysicsLabView.defaultZeta, 1.0)
        let names = Set(PhysicsLabView.sampleCurves(mode: .position, customW: 22, customZeta: PhysicsLabView.defaultZeta).map(\.series))
        XCTAssertEqual(names, Set(PhysicsLabView.seriesNames), "every plotted series has a themed colour")
    }

    func testShellTabsUseSiteNavLabelsAndCompactHidesKeyboardHint() {
        XCTAssertEqual(Array(AdaptiveCatalogShell.compactTabTitles.prefix(4)), ["Foundations", "Studio", "Library", "Recipes"])
        XCTAssertTrue(AdaptiveCatalogShell.searchNoticeTitle(isCompact: false).contains("⌘K"))
        XCTAssertFalse(AdaptiveCatalogShell.searchNoticeTitle(isCompact: true).contains("⌘K"))
    }

    func testThemeHasASensibleDefaultScrim() {
        let env = EnvironmentValues()
        let resolved = Theme().scrim.resolve(in: env)
        XCTAssertGreaterThan(resolved.opacity, 0.05)
        XCTAssertLessThan(resolved.opacity, 0.7)
    }
}
