import CieoUI
import XCTest

final class RenderPolicyTests: XCTestCase {
    func testEffectsRequireExplicitOptIn() {
        XCTAssertTrue(RenderPolicy().allowsMotion)
        XCTAssertFalse(RenderPolicy().allowsShader)
        XCTAssertTrue(RenderPolicy(effectsEnabled: true).allowsShader)
    }

    func testEverySystemConstraintDisablesOptionalShader() {
        let constrained = [
            RenderPolicy(effectsEnabled: true, reduceMotion: true),
            RenderPolicy(effectsEnabled: true, reduceTransparency: true),
            RenderPolicy(effectsEnabled: true, increasedContrast: true),
            RenderPolicy(effectsEnabled: true, lowPower: true),
            RenderPolicy(effectsEnabled: true, active: false),
        ]
        for policy in constrained {
            XCTAssertFalse(policy.allowsShader)
        }
        XCTAssertFalse(constrained[0].allowsMotion)
        XCTAssertFalse(constrained[3].allowsMotion)
        XCTAssertFalse(constrained[4].allowsMotion)
        XCTAssertTrue(constrained[1].allowsMotion)
    }

    func testGraphicsInputsAreFiniteAndBounded() {
        for value in [Double.nan, .infinity, -.infinity, -2] {
            XCTAssertEqual(RenderPolicy.progress(value), 0)
        }
        XCTAssertEqual(RenderPolicy.progress(2), 1)
        XCTAssertEqual(RenderPolicy.progress(0.4), 0.4)
    }
}
