import CieoUI
import SwiftUI
import XCTest

/// Pins Notice's optional action: drawn from the host slots under the text, kept as its own button for
/// VoiceOver, and absent from every existing call site.
final class NoticeActionTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)

    @MainActor
    private func image<V: View>(_ view: V) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view.frame(width: 300)).cgImage)
    }

    @MainActor
    func testActionDrawsInTheHostAccentAndAddsATouchTarget() throws {
        let plain = Notice("Couldn't load", detail: "Check your connection.", icon: .error)
        let withAction = Notice("Couldn't load", detail: "Check your connection.", icon: .error, actionTitle: "Try again") {}
        let accent = Theme(accent: red)
        XCTAssertTrue(ComponentIconTests.containsRed(try image(withAction.environment(\.componentTheme, accent))))
        XCTAssertFalse(ComponentIconTests.containsRed(try image(plain.environment(\.componentTheme, accent))),
                       "existing notices draw no action")
        XCTAssertGreaterThanOrEqual(try image(withAction).height - image(plain).height, 44, "the action keeps a full touch target")
    }

    @MainActor
    func testActionReadsTheHostTypeAndTouchTarget() throws {
        let notice = Notice("Saved", detail: "Stays on this screen.", symbol: "checkmark.circle.fill", actionTitle: "Undo") {}
        let plain = try image(notice).height
        XCTAssertGreaterThan(try image(notice.environment(\.componentTypography, ComponentTypography(strongBody: .system(size: 60)))).height, plain)
        XCTAssertGreaterThan(try image(notice.environment(\.componentMetrics, ComponentMetrics(touchTarget: 120))).height, plain)
    }

    /// `swift test` has no accessibility tree, so the rule is pinned in the source: without an action
    /// the notice is one element; with one, the text is one element and the button stays separate.
    func testTheActionStaysAFindableButtonForVoiceOver() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let source = try String(contentsOf: root.appendingPathComponent("Sources/CieoUI/Molecules/Notice.swift"), encoding: .utf8)
        XCTAssertTrue(source.contains(".accessibilityElement(children: action == nil ? .combine : .contain)"))
        XCTAssertTrue(source.contains("Heading(title, detail: detail, level: .heading, isHeader: false)\n                    .accessibilityElement(children: .combine)"))
    }
}
