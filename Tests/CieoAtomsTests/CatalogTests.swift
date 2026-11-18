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

    func testMotionAtomInfoSupportsOptionalLayerPackFamiliesAndFormula() {
        let legacy = MotionAtomInfo(id: "step", category: "Foundations", name: "Spring presets", summary: "Closed-form step")
        XCTAssertNil(legacy.layer)
        XCTAssertNil(legacy.pack)
        XCTAssertTrue(legacy.families.isEmpty)
        XCTAssertNil(legacy.formula)

        let enriched = MotionAtomInfo(
            id: "step",
            category: "Foundations",
            name: "Spring presets",
            summary: "Closed-form step",
            layer: "foundation",
            pack: "core",
            families: ["Morph", "Drag"],
            formula: "x = to + resp(dt, x0, v0, S.base)"
        )
        XCTAssertEqual(enriched.layer, "foundation")
        XCTAssertEqual(enriched.pack, "core")
        XCTAssertEqual(enriched.families, ["Morph", "Drag"])
        XCTAssertEqual(enriched.formula, "x = to + resp(dt, x0, v0, S.base)")
    }

    func testCrossFolderCategoriesAreReconciledToTheirOwningDomain() {
        XCTAssertEqual(ThumbsReasonAtom.info.category, "AI chat")
        XCTAssertEqual(ChatCSATAtom.info.category, "AI chat")
        XCTAssertEqual(ChatPollAtom.info.category, "AI chat")
        XCTAssertEqual(SlotFillingFormAtom.info.category, "AI chat")
        XCTAssertEqual(LivePollAtom.info.category, "Dynamic")
        XCTAssertEqual(PredictionAtom.info.category, "Dynamic")
        XCTAssertEqual(CallRsvpAtom.info.category, "Video calls")
        XCTAssertEqual(QAUpvoteAtom.info.category, "Video calls")
        XCTAssertEqual(MultiStepShellAtom.info.category, "Views")
        XCTAssertEqual(StepperHeaderAtom.info.category, "Views")
    }

    func testSpringPlayUsesDataVelocityOnRelease() {
        var vel = DataVelocity()
        vel.add(0.1, at: 1.0)
        vel.add(0.6, at: 1.05)
        XCTAssertGreaterThan(vel.v, 1.0)
    }
}
