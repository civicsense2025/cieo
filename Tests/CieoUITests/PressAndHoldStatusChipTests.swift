@testable import CieoUI
import SwiftUI
import XCTest

final class PressAndHoldStatusChipTests: XCTestCase {
    // MARK: - HoldPolicy

    func testHoldDurationDefaultsToTheSystemLongPressAndStaysUsable() {
        XCTAssertEqual(HoldPolicy.defaultMinimumDuration, 0.5)
        XCTAssertEqual(HoldPolicy.minimumDuration(0.8), 0.8)
        XCTAssertEqual(HoldPolicy.minimumDuration(0), HoldPolicy.minimumDurationRange.lowerBound, "never as short as a tap")
        XCTAssertEqual(HoldPolicy.minimumDuration(-3), HoldPolicy.minimumDurationRange.lowerBound)
        XCTAssertEqual(HoldPolicy.minimumDuration(60), HoldPolicy.minimumDurationRange.upperBound, "never so long it looks broken")
        XCTAssertEqual(HoldPolicy.minimumDuration(.nan), HoldPolicy.defaultMinimumDuration)
        XCTAssertEqual(HoldPolicy.minimumDuration(.infinity), HoldPolicy.defaultMinimumDuration)
    }

    func testOnlyAFarEnoughSlideLeftCancelsAHold() {
        XCTAssertFalse(HoldPolicy.slideCancels(dx: 0))
        XCTAssertFalse(HoldPolicy.slideCancels(dx: -80), "exactly at the distance still keeps going")
        XCTAssertTrue(HoldPolicy.slideCancels(dx: -80.5))
        XCTAssertFalse(HoldPolicy.slideCancels(dx: 400), "sliding right never cancels")
        XCTAssertFalse(HoldPolicy.slideCancels(dx: .nan))
        XCTAssertFalse(HoldPolicy.slideCancels(dx: -.infinity), "a broken reading never throws a take away")
    }

    func testVoiceRecorderSharesTheHoldPolicyRatherThanItsOwnCopy() {
        XCTAssertEqual(VoiceRecorderModel.holdCancelDistance, HoldPolicy.slideCancelDistance)
        for dx in [0.0, -79, -80, -81, -500, 120, .nan, -.infinity] {
            XCTAssertEqual(VoiceRecorderModel.holdGesture(dx: dx) == .cancel, HoldPolicy.slideCancels(dx: dx), "dx \(dx)")
        }
    }

    func testAHoldCountsOnlyAfterTheLongPressCompletesWithTheFingerStillDown() {
        typealias Value = SequenceGesture<LongPressGesture, DragGesture>.Value
        XCTAssertFalse(HoldPolicy.isHeld(Value.first(false)), "still pressing, threshold not reached")
        XCTAssertFalse(HoldPolicy.isHeld(Value.first(true)), "a first phase alone is not a hold")
        XCTAssertFalse(HoldPolicy.isHeld(Value.second(false, nil)))
        XCTAssertTrue(HoldPolicy.isHeld(Value.second(true, nil)), "threshold reached, finger not yet moved")
    }

    func testAHeldViewShrinksOnlyWhenMotionIsAllowed() {
        XCTAssertEqual(HoldPolicy.scale(held: false, motionAllowed: true, heldScale: 0.9), 1)
        XCTAssertEqual(HoldPolicy.scale(held: true, motionAllowed: true, heldScale: 0.9), 0.9)
        XCTAssertEqual(HoldPolicy.scale(held: true, motionAllowed: false, heldScale: 0.9), 1, "Reduce Motion keeps the size")
        XCTAssertEqual(HoldPolicy.scale(held: true, motionAllowed: true, heldScale: .nan), HoldPolicy.heldScale)
        XCTAssertEqual(HoldPolicy.scale(held: true, motionAllowed: true, heldScale: 3), 1, "never grows")
        XCTAssertEqual(HoldPolicy.scale(held: true, motionAllowed: true, heldScale: -1), 0)
    }

    @MainActor
    func testPressAndHoldLeavesTheViewsLayoutAndStaysInteractive() throws {
        let plain = Button("Add") {}.buttonStyle(.plain)
        let held = plain.pressAndHold(isHolding: .constant(false), accessibilityActionName: "Stop commenting") {}
        func size<V: View>(_ view: V) throws -> (Int, Int) {
            let image = try XCTUnwrap(ImageRenderer(content: view.fixedSize()).cgImage)
            return (image.width, image.height)
        }
        let (a, b) = (try size(plain), try size(held))
        XCTAssertEqual(a.0, b.0)
        XCTAssertEqual(a.1, b.1)
    }

    // MARK: - StatusChip

    private static let palette = Theme(accent: .indigo, surface: .gray, foreground: .black, tint: .mint,
                                       danger: .pink, success: .green, warning: .orange)

    func testEveryToneReadsItsOwnThemeRole() {
        let theme = Self.palette
        XCTAssertEqual(StatusChip.foreground(.neutral, in: theme), theme.foreground)
        XCTAssertEqual(StatusChip.foreground(.active, in: theme), theme.accent)
        XCTAssertEqual(StatusChip.foreground(.done, in: theme), theme.success)
        XCTAssertEqual(StatusChip.foreground(.attention, in: theme), theme.warning)
        XCTAssertEqual(StatusChip.foreground(.danger, in: theme), theme.danger)
        XCTAssertEqual(StatusChip.fill(.active, in: theme), theme.tint)
        for tone in StatusChip.Tone.allCases where tone != .active {
            XCTAssertEqual(StatusChip.fill(tone, in: theme), theme.surface, "\(tone)")
        }
        let colours = StatusChip.Tone.allCases.map { StatusChip.foreground($0, in: theme) }
        XCTAssertEqual(Set(colours.map { "\($0)" }).count, colours.count, "no two tones share a colour")
    }

    @MainActor
    private func image<V: View>(_ view: V, scheme: ColorScheme = .light) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view.environment(\.colorScheme, scheme)).cgImage)
    }

    @MainActor
    func testChipsDrawEveryToneWithAndWithoutAGlyphInBothSchemes() throws {
        for scheme in [ColorScheme.light, .dark] {
            for tone in StatusChip.Tone.allCases {
                for symbol in [nil, ComponentIcon.check] {
                    let chip = StatusChip("In progress", tone: tone, symbol: symbol).fixedSize()
                    XCTAssertGreaterThan(try image(chip, scheme: scheme).width, 0, "\(tone) \(scheme)")
                }
            }
        }
    }

    @MainActor
    func testAChipIsAsWideAsItsContentAndNoWider() throws {
        let short = try image(StatusChip("Done").fixedSize()).width
        let long = try image(StatusChip("Waiting for the committee").fixedSize()).width
        let withGlyph = try image(StatusChip("Done", symbol: .check).fixedSize()).width
        XCTAssertLessThan(short, long)
        XCTAssertGreaterThan(withGlyph, short, "a glyph adds width")
        XCTAssertLessThan(long, 390 * 2, "never stretched to the row")
    }

    @MainActor
    func testALongTitleWrapsInsteadOfTruncatingOrOverflowing() throws {
        let title = "Waiting for the committee to respond"
        let wide = try image(StatusChip(title).frame(width: 600, alignment: .leading)).height
        let narrow = try image(StatusChip(title).frame(width: 90, alignment: .leading)).height
        XCTAssertGreaterThan(narrow, wide, "a narrow row gives the chip more lines, not clipped text")
    }

    @MainActor
    func testChipColoursComeFromTheHostTheme() throws {
        let red = Color(red: 1, green: 0, blue: 0)
        for tone in StatusChip.Tone.allCases {
            let theme = Theme(accent: red, surface: red, foreground: red, tint: red, danger: red, success: red, warning: red)
            let chip = StatusChip("Open", tone: tone).fixedSize().environment(\.componentTheme, theme)
            XCTAssertTrue(ComponentIconTests.containsRed(try image(chip)), "\(tone) draws with the host's colour")
        }
    }

    @MainActor
    func testTheGlyphComesFromTheHostsIconSet() throws {
        let red = Color(red: 1, green: 0, blue: 0)
        let theme = Theme(foreground: .black)
        let icons = ComponentIcons { _ in Circle().fill(red) }
        let with = StatusChip("Done", symbol: .check).fixedSize().environment(\.componentTheme, theme).environment(\.componentIcons, icons)
        let without = StatusChip("Done").fixedSize().environment(\.componentTheme, theme).environment(\.componentIcons, icons)
        XCTAssertTrue(ComponentIconTests.containsRed(try image(with)))
        XCTAssertFalse(ComponentIconTests.containsRed(try image(without)), "no symbol, no glyph")
    }

    func testTonesAreTheDocumentedFive() {
        XCTAssertEqual(StatusChip.Tone.allCases, [.neutral, .active, .done, .attention, .danger])
    }
}
