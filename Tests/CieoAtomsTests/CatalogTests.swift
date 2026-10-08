@testable import CieoAtoms
import XCTest

final class CatalogTests: XCTestCase {
    func testEveryRecipeHasUniqueIdentityAndDiscoverableMetadata() {
        let recipes = MotionAtoms.all
        XCTAssertEqual(recipes.count, 550)
        XCTAssertEqual(Set(recipes.map(\.id)).count, recipes.count)
        for recipe in recipes {
            XCTAssertFalse(recipe.info.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            XCTAssertFalse(recipe.info.category.isEmpty)
            XCTAssertFalse(recipe.info.summary.isEmpty)
        }
    }
}
