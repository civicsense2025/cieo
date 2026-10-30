import CieoUI
import SwiftUI
import XCTest

/// Pins the single Avatar: initials when there is no photo, sizes from the host metrics, a host image
/// loader that every face (Avatar, GroupAvatar, SeenBy) goes through, and one spoken name.
final class AvatarTests: XCTestCase {
    private static let red = Color(red: 1, green: 0, blue: 0)
    private static let photo = URL(string: "https://example.com/face.jpg")!
    private static let redLoader = AvatarImageLoader { _, _ in red }

    @MainActor
    private func image<V: View>(_ view: V) throws -> CGImage {
        try XCTUnwrap(ImageRenderer(content: view).cgImage)
    }

    // MARK: Contract

    func testInitialsComeFromTheFirstAndLastWords() {
        XCTAssertEqual(Avatar.initials(from: "Earl Warren"), "EW")
        XCTAssertEqual(Avatar.initials(from: "  ruth   bader  ginsburg "), "RG")
        XCTAssertEqual(Avatar.initials(from: "Cher"), "C")
        XCTAssertEqual(Avatar.initials(from: "   "), "")
        XCTAssertEqual(Avatar.initials(from: "Élodie Ünal"), "ÉÜ")
    }

    func testSizesReadTheHostMetricsAndGrowWithTextUpToACap() {
        let metrics = ComponentMetrics(avatar: 40, avatarSmall: 20)
        XCTAssertEqual(Avatar.diameter(.md, metrics: metrics), 40)
        XCTAssertEqual(Avatar.diameter(.sm, metrics: metrics), 20)
        XCTAssertEqual(Avatar.diameter(.md, metrics: metrics, textScale: 1.5), 60)
        XCTAssertEqual(Avatar.diameter(.md, metrics: metrics, textScale: 9), 80, "growth stops at twice the size")
        XCTAssertEqual(Avatar.diameter(.md, metrics: metrics, textScale: 0.5), 40, "never smaller than the metric")
        XCTAssertEqual(Avatar.diameter(.md, metrics: metrics, textScale: .nan), 40)
        XCTAssertEqual(Avatar.diameter(.points(52), metrics: metrics, textScale: 2), 52, "explicit sizes do not scale")
        XCTAssertEqual(Avatar.diameter(.points(.infinity), metrics: metrics), 0)
        XCTAssertEqual(Avatar.diameter(.points(-4), metrics: metrics), 0)
        XCTAssertEqual(Avatar.diameter(.md, metrics: ComponentMetrics()), 36, "defaults match the comment avatar")
    }

    func testANamelessFaceIsHiddenFromVoiceOver() {
        XCTAssertTrue(Avatar.isDecorative(name: " "))
        XCTAssertFalse(Avatar.isDecorative(name: "Earl Warren"))
    }

    /// `swift test` has no accessibility tree, so the spoken contract is pinned in the source: one image
    /// element labelled with the name, its initials and photo hidden inside it.
    func testVoiceOverReadsTheNameOnceAsAnImage() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let source = try String(contentsOf: root.appendingPathComponent("Sources/CieoUI/Atoms/Avatar.swift"), encoding: .utf8)
        XCTAssertTrue(source.contains("""
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(Text(verbatim: name))
                .accessibilityAddTraits(.isImage)
        """))
    }

    // MARK: Rendering

    @MainActor
    func testTheFaceIsAsWideAsItsSize() throws {
        XCTAssertEqual(try image(Avatar(name: "Earl Warren")).width, 36)
        XCTAssertEqual(try image(Avatar(name: "Earl Warren", size: .sm)).width, 24)
        XCTAssertEqual(try image(Avatar(name: "Earl Warren").environment(\.componentMetrics, ComponentMetrics(avatar: 60))).width, 60)
        XCTAssertEqual(try image(Avatar(name: "Earl Warren", size: .points(50))).width, 50)
    }

    @MainActor
    func testInitialsDrawInTheHostAccentWhenThereIsNoPhoto() throws {
        let face = Avatar(name: "Earl Warren", size: .points(80))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(face.environment(\.componentTheme, Theme(accent: Self.red, tint: .white)))))
        XCTAssertFalse(ComponentIconTests.containsRed(try image(face)))
    }

    @MainActor
    func testAPhotoGoesThroughTheHostLoaderAndNoPhotoNeverDoes() throws {
        let photo = Avatar(name: "Earl Warren", imageURL: Self.photo).environment(\.avatarImageLoader, Self.redLoader)
        XCTAssertTrue(ComponentIconTests.containsRed(try image(photo)))
        let none = Avatar(name: "Earl Warren").environment(\.avatarImageLoader, Self.redLoader)
        XCTAssertFalse(ComponentIconTests.containsRed(try image(none)), "no URL, no loader: initials only")
    }

    @MainActor
    func testTheLoaderReceivesTheInitialsAsItsFallback() throws {
        let showsFallback = AvatarImageLoader { _, fallback in fallback }
        let face = Avatar(name: "Earl Warren", imageURL: Self.photo, size: .points(80))
            .environment(\.avatarImageLoader, showsFallback)
            .environment(\.componentTheme, Theme(accent: Self.red, tint: .white))
        XCTAssertTrue(ComponentIconTests.containsRed(try image(face)), "the fallback is the initials in the accent")
    }

    @MainActor
    func testGroupAvatarAndSeenByDrawTheirFacesWithTheSameLoader() throws {
        let people = [GroupAvatarPerson(name: "Ava", initials: "A", imageURL: Self.photo),
                      GroupAvatarPerson(name: "Ben", initials: "B", imageURL: Self.photo)]
        let group = GroupAvatar(people: people).environment(\.avatarImageLoader, Self.redLoader)
        XCTAssertTrue(ComponentIconTests.containsRed(try image(group)))
        let seen = SeenBy(people: people).environment(\.avatarImageLoader, Self.redLoader)
        XCTAssertTrue(ComponentIconTests.containsRed(try image(seen)))
        XCTAssertEqual(GroupAvatar.groupAvatarLabel(people.map(\.name)), "Ava and Ben", "the group's spoken label is unchanged")
    }
}
