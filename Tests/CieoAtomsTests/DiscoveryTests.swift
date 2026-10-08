@testable import CieoAtoms
import XCTest

final class DiscoveryTests: XCTestCase {
    func testSearchMatchesWordsAcrossMetadataAndIgnoresExtraWhitespace() {
        let info = MotionAtomInfo(id: "soft-button", category: "Inputs", name: "Soft button", summary: "A press with feedback")
        XCTAssertTrue(info.matches("  INPUTS   feedback "))
        XCTAssertTrue(info.matches("soft-button"))
        XCTAssertTrue(info.matches("\n"))
        XCTAssertFalse(info.matches("soft missing"))
    }

    func testEveryRecipeCanBeFoundByItsIdentityAndName() {
        for recipe in MotionAtoms.all {
            XCTAssertTrue(recipe.info.matches(recipe.id))
            XCTAssertTrue(recipe.info.matches(recipe.info.name))
        }
    }
}
