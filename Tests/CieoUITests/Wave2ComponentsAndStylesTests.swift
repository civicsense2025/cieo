@testable import CieoUI
import Cieo
import SwiftUI
import XCTest

private struct CustomAccentProgressRingStyle: ProgressRingStyle {
    let color: Color
    func makeBody(configuration: Configuration) -> some View {
        ZStack {
            Circle().stroke(color, lineWidth: 10)
            configuration.centerLabel
        }
        .frame(width: configuration.diameter, height: configuration.diameter)
    }
}

private struct CustomBannerNoticeStyle: NoticeStyle {
    let highlight: Color
    func makeBody(configuration: Configuration) -> some View {
        HStack {
            configuration.icon.foregroundStyle(highlight)
            configuration.content
        }
        .padding(8)
        .background(highlight.opacity(0.2))
    }
}

private struct CustomBadgeChipStyle: ChipStyle {
    let badgeColor: Color
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(8)
            .background(configuration.isSelected ? badgeColor : .clear)
    }
}

final class Wave2ComponentsAndStylesTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)
    private let green = Color(red: 0, green: 1, blue: 0)

    @MainActor
    func testChipStyleNoticeStyleAndProgressRingStyleCustomizePresentation() throws {
        let variableTitle: Substring = "Dynamic"[...]
        let chipShowcase = VStack {
            SelectionChip("Capsule", isSelected: .constant(true)).chipStyle(.capsule)
            SelectionChip("Rounded", isSelected: .constant(true)).chipStyle(.rounded)
            SelectionChip("Soft", isSelected: .constant(true)).chipStyle(.soft)
            SelectionChip("Outlined", isSelected: .constant(false)).chipStyle(.outlined)
            SelectionChip(variableTitle, isSelected: .constant(true)).chipStyle(CustomBadgeChipStyle(badgeColor: red))
            SelectionChip(Text("Custom slots"), isSelected: .constant(true)) {
                Circle().fill(red).frame(width: 10, height: 10)
            } trailing: {
                Text("12")
            }
        }
        .environment(\.componentTheme, Theme(accent: red, accentSoft: red))
        .frame(width: 320)

        let chipImage = try XCTUnwrap(ImageRenderer(content: chipShowcase).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(chipImage))

        // Notice.Tone covers all 5 semantic tones and reads soft semantic theme tokens
        XCTAssertEqual(Notice.Tone.allCases, [.neutral, .info, .success, .warning, .danger])
        let successNotice = Notice("Deployed", detail: "All checks green.", tone: .success, onDismiss: {}) {
            Button("View log") {}
        }
        .environment(\.componentTheme, Theme(success: green, successSoft: red))
        .frame(width: 320)
        let noticeImage = try XCTUnwrap(ImageRenderer(content: successNotice).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(noticeImage), "Notice .success tone paints theme.successSoft")

        let styledNotice = Notice("Custom notice", detail: "Styled via NoticeStyle", tone: .info)
            .noticeStyle(CustomBannerNoticeStyle(highlight: red))
            .frame(width: 320)
        let styledNoticeImage = try XCTUnwrap(ImageRenderer(content: styledNotice).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(styledNoticeImage))

        // ProgressRing custom @ViewBuilder center label + custom ProgressRingStyle
        let customRing = ProgressRing(value: 0.75) {
            Text("3/4")
        }
        .progressRingStyle(CustomAccentProgressRingStyle(color: red))
        .frame(width: 120)
        let ringImage = try XCTUnwrap(ImageRenderer(content: customRing).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(ringImage))
    }

    @MainActor
    func testUpgradedActionButtonLabeledFieldAndComponentStrings() throws {
        var tapped = 0
        let pendingBtn = ActionButton("Submit", phase: .pending) { tapped += 1 }
        let iconBtn = ActionButton("Publish", phase: .succeeded) {
            tapped += 1
        } icon: {
            Circle().fill(red).frame(width: 8, height: 8)
        }
        let uncertainBtn = ActionButton(phase: .uncertain("Sending could not be confirmed")) {
            tapped += 1
        } label: {
            HStack {
                Text("Retry")
            }
        }
        let customField = LabeledField(
            Text("API Token"),
            description: Text("Scoped to read-only metrics."),
            error: Text("Token expired.")
        ) {
            Text("Custom input slot").padding(8)
        }
        .environment(\.componentTheme, Theme(danger: red))

        var customStrings = ComponentStrings()
        customStrings.passwordShow = "Afficher"
        customStrings.passwordHide = "Masquer"
        XCTAssertEqual(customStrings.passwordShow, "Afficher")

        let stack = VStack {
            pendingBtn
            iconBtn
            uncertainBtn
            customField
        }
        .environment(\.componentStrings, customStrings)
        .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
        .frame(width: 340)

        let image = try XCTUnwrap(ImageRenderer(content: stack).cgImage)
        XCTAssertGreaterThan(image.height, 120)
        XCTAssertTrue(ComponentIconTests.containsRed(image))
        XCTAssertEqual(tapped, 0)
    }

    @MainActor
    func testToastBannerBottomSheetCommandPaletteAndAuthFields() throws {
        // CommandPalette filtering & roving highlight skip disabled items
        let groups = [
            CommandGroup(id: "nav", title: "Navigation", items: [
                CommandItem(id: "open", title: "Open file", shortcut: "⌘O", icon: .search),
                CommandItem(id: "locked", title: "Delete workspace", icon: .discard, isDisabled: true),
                CommandItem(id: "theme", title: "Switch theme", keywords: ["dark", "light", "brand"]),
            ]),
        ]
        let filtered = CommandPaletteView.filterGroups(groups, query: "brand")
        XCTAssertEqual(filtered.flatMap(\.items).map(\.id), ["theme"])

        let allEnabledMove = CommandPaletteView.moveHighlight(current: "open", delta: 1, in: groups)
        XCTAssertEqual(allEnabledMove, "theme", "keyboard navigation skips disabled items")

        // AuthOtpInput sanitization & AuthPasswordField strength scoring
        XCTAssertEqual(AuthOtpInput.sanitize("12a-34 5678", length: 6), "123456")
        XCTAssertEqual(AuthPasswordField.strengthScore("short"), 0)
        XCTAssertEqual(AuthPasswordField.strengthScore("LongerPass12!"), 4)

        let queue = ToastQueueModel()
        _ = queue.enqueue(title: "Saved changes", detail: "Synced to local ledger.", priority: .success, actionTitle: "Undo")
        let bannerItem = try XCTUnwrap(queue.visibleItems.first)

        let view = VStack(spacing: 16) {
            ToastBanner(item: bannerItem, onDismiss: {}, onAction: {})
            ToastHost(queue: queue)
            BottomSheetPanel(isPresented: .constant(true), detents: [160, 320]) {
                Text("Sheet content")
            }
            .frame(height: 240)
            CommandPaletteView(isPresented: .constant(true), groups: groups) { _ in }
                .frame(height: 260)
            AuthOtpInput(code: .constant("4829"), length: 6, error: Text("Enter all 6 digits"))
            AuthPasswordField(text: .constant("StrongPass99!"), error: nil)
        }
        .environment(\.componentTheme, Theme(accent: red, danger: red))
        .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
        .frame(width: 390)

        let image = try XCTUnwrap(ImageRenderer(content: view).cgImage)
        XCTAssertGreaterThan(image.height, 400)
        XCTAssertTrue(ComponentIconTests.containsRed(image))
    }
}
