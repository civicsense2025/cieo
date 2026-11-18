@testable import CieoUI
import Cieo
import SwiftUI
import XCTest

final class Wave1FoundationAndBugTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)
    private let green = Color(red: 0, green: 1, blue: 0)

    func testThemeAdditiveRolesKeepBackwardCompatibleDefaults() {
        let theme = Theme()
        XCTAssertEqual(theme.elevationRingWidth, 0)
        XCTAssertEqual(theme.info, .blue)
        XCTAssertEqual(theme.focus, theme.accent)
        XCTAssertEqual(theme.accentHover, theme.accent)
        XCTAssertEqual(theme.accentSoft, theme.tint)
        XCTAssertEqual(theme.onAccentSoft, theme.accent)
        XCTAssertEqual(theme.selection, theme.tint)

        let custom = Theme(
            accent: .purple,
            surfaceLow: .mint,
            surfaceHigh: .cyan,
            raised: .indigo,
            sunken: .brown,
            info: .teal,
            accentHover: .pink,
            accentSoft: .yellow,
            onAccentSoft: .black,
            successSoft: .green.opacity(0.2),
            warningSoft: .orange.opacity(0.2),
            dangerSoft: .red.opacity(0.2),
            infoSoft: .blue.opacity(0.2),
            borderStrong: .primary,
            focus: .orange,
            selection: .purple.opacity(0.25),
            elevationRingWidth: 2
        )
        XCTAssertEqual(custom.surfaceLow, .mint)
        XCTAssertEqual(custom.surfaceHigh, .cyan)
        XCTAssertEqual(custom.raised, .indigo)
        XCTAssertEqual(custom.sunken, .brown)
        XCTAssertEqual(custom.info, .teal)
        XCTAssertEqual(custom.accentHover, .pink)
        XCTAssertEqual(custom.accentSoft, .yellow)
        XCTAssertEqual(custom.onAccentSoft, .black)
        XCTAssertEqual(custom.borderStrong, .primary)
        XCTAssertEqual(custom.focus, .orange)
        XCTAssertEqual(custom.elevationRingWidth, 2)
        XCTAssertEqual(Theme(elevationRingWidth: .nan).elevationRingWidth, 0)
        XCTAssertEqual(Theme(elevationRingWidth: -4).elevationRingWidth, 0)
    }

    @MainActor
    func testThemePresetCoversAllSevenBrandsThreeGroundsAndBothElevations() throws {
        XCTAssertEqual(ThemeBrand.allCases.count, 7)
        XCTAssertEqual(ThemeGround.allCases.count, 3)
        XCTAssertEqual(ElevationStyle.allCases.count, 2)

        let defaultPreset = Theme.preset()
        XCTAssertEqual(defaultPreset.elevationRingWidth, 1)
        XCTAssertEqual(defaultPreset.floatingShadow.radius, 4)

        let softPreset = Theme.preset(brand: .ember, ground: .cool, elevation: .soft)
        XCTAssertEqual(softPreset.elevationRingWidth, 0)
        XCTAssertGreaterThan(softPreset.floatingShadow.radius, defaultPreset.floatingShadow.radius)

        for brand in ThemeBrand.allCases {
            for ground in ThemeGround.allCases {
                let theme = Theme.preset(brand: brand, ground: ground, elevation: .ring)
                let swatch = HStack(spacing: 0) {
                    Rectangle().fill(theme.background).frame(width: 10, height: 10)
                    Rectangle().fill(theme.surface).frame(width: 10, height: 10)
                    Rectangle().fill(theme.accent).frame(width: 10, height: 10)
                    Rectangle().fill(theme.selection).frame(width: 10, height: 10)
                }
                let image = try XCTUnwrap(ImageRenderer(content: swatch).cgImage)
                XCTAssertEqual(image.width, 40, "\(brand):\(ground)")
            }
        }
    }

    func testComponentMetricsTieredRadiiDensityHeightsAndPresetFactory() {
        let defaults = ComponentMetrics()
        XCTAssertEqual(defaults.cornerSmall, 8)
        XCTAssertEqual(defaults.corner, 12)
        XCTAssertEqual(defaults.cornerSurface, 16)
        XCTAssertEqual(defaults.cornerPill, 9999)
        XCTAssertEqual([defaults.controlXS, defaults.controlSmall, defaults.controlHeight, defaults.controlLarge, defaults.controlXL],
                       [28, 32, 40, 48, 52])

        let compactCrisp = ComponentMetrics.preset(density: .compact, corners: .crisp)
        XCTAssertEqual([compactCrisp.cornerSmall, compactCrisp.corner, compactCrisp.cornerSurface, compactCrisp.cornerPill],
                       [2, 4, 8, 9999])
        XCTAssertEqual([compactCrisp.controlXS, compactCrisp.controlSmall, compactCrisp.controlHeight, compactCrisp.controlLarge, compactCrisp.controlXL],
                       [24, 24, 32, 40, 44])

        let spaciousRound = ComponentMetrics.preset(density: .spacious, corners: .round)
        XCTAssertEqual([spaciousRound.cornerSmall, spaciousRound.corner, spaciousRound.cornerSurface, spaciousRound.cornerPill],
                       [12, 16, 24, 9999])
        XCTAssertEqual([spaciousRound.controlXS, spaciousRound.controlSmall, spaciousRound.controlHeight, spaciousRound.controlLarge, spaciousRound.controlXL],
                       [36, 40, 48, 56, 60])
    }

    @MainActor
    func testActionButtonSizingDestructiveRoleAndEnvironmentControlAppearance() throws {
        let flexView = HStack {
            ActionButton("Go", sizing: .flexible) {}
        }.frame(width: 320)
        let fittedView = HStack {
            ActionButton("Go", sizing: .fitted) {}
            Spacer()
        }.frame(width: 320)

        let fittedStandalone = try XCTUnwrap(ImageRenderer(content: ActionButton("Go", sizing: .fitted) {}).cgImage)
        let flexStandalone = try XCTUnwrap(ImageRenderer(content: flexView).cgImage)
        _ = fittedView
        XCTAssertLessThan(fittedStandalone.width, flexStandalone.width, "fitted ActionButton hugs its label instead of expanding infinitely")

        // Destructive role honors theme.danger
        let destructiveProminent = try XCTUnwrap(ImageRenderer(
            content: ActionButton("Delete", role: .destructive, sizing: .fitted) {}
                .environment(\.componentTheme, Theme(accent: .blue, danger: red))
        ).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(destructiveProminent), "destructive prominent button uses theme.danger")

        let destructiveQuiet = try XCTUnwrap(ImageRenderer(
            content: Button("Remove", role: .destructive) {}
                .buttonStyle(ActionButtonStyle(.quiet))
                .environment(\.componentTheme, Theme(accent: .blue, danger: red))
        ).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(destructiveQuiet), "destructive quiet button uses theme.danger")

        // Environment controlAppearance applies when no explicit appearance was passed
        let envStyled = try XCTUnwrap(ImageRenderer(
            content: ActionButton("Env", sizing: .fitted) {}
                .environment(\.controlAppearance, ControlAppearance(minHeight: 84, background: red))
        ).cgImage)
        XCTAssertGreaterThanOrEqual(envStyled.height, 84)
        XCTAssertTrue(ComponentIconTests.containsRed(envStyled))
    }

    @MainActor
    func testSegmentedTabsRendersActiveUnderlineWithEdgesIndicatorAndRespectsRenderPolicy() throws {
        let tabs: [SegmentedTabs<String>.Tab] = [
            .init("overview", title: Text("Overview")),
            .init("activity", title: Text("Activity")),
        ]
        let rendered = try XCTUnwrap(ImageRenderer(
            content: SegmentedTabs(tabs, selection: .constant("overview"))
                .environment(\.componentTheme, Theme(accent: red))
                .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
                .frame(width: 300)
        ).cgImage)
        XCTAssertTrue(ComponentIconTests.containsRed(rendered))
    }

    @MainActor
    func testFeedbackPopoverControlledDraftPreservesTextOnSubmitFailure() {
        XCTAssertNil(FeedbackPopover<EmptyView, EmptyView>.submissionState(raw: "   ", preserveDraft: true))

        let autoClear = FeedbackPopover<EmptyView, EmptyView>.submissionState(raw: "  ship it  ", preserveDraft: false)
        XCTAssertEqual(autoClear?.submitted, "ship it")
        XCTAssertEqual(autoClear?.nextDraft, "")
        XCTAssertEqual(autoClear?.shouldDismiss, true)

        let preserved = FeedbackPopover<EmptyView, EmptyView>.submissionState(raw: "  ship it  ", preserveDraft: true)
        XCTAssertEqual(preserved?.submitted, "ship it")
        XCTAssertEqual(preserved?.nextDraft, "  ship it  ", "controlled draft stays intact until async host confirms")
        XCTAssertEqual(preserved?.shouldDismiss, false)

        var draft = "Needs revision"
        let binding = Binding(get: { draft }, set: { draft = $0 })
        let popover = FeedbackPopover(
            isPresented: .constant(true),
            text: binding,
            preserveDraftOnSubmit: true,
            title: "Review",
            onSubmit: { _ in }
        )
        _ = popover.body
        XCTAssertEqual(draft, "Needs revision")
    }

    @MainActor
    func testNewItemsPillRespectsLocaleFormatting() throws {
        let german = Locale(identifier: "de_DE")
        XCTAssertEqual(NewItemsPill.newItemsLabel(1200, locale: german), "1.200 new replies")
        let split = NewItemsPill.splitNewItemsLabel("1.200 neue Antworten", count: 1200, locale: german)
        XCTAssertTrue(split.rolls)
        XCTAssertEqual(split.rest, " neue Antworten")

        let view = NewItemsPill(count: 1200, onShow: {})
            .environment(\.locale, german)
            .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
        XCTAssertNotNil(ImageRenderer(content: view).cgImage)
    }

    @MainActor
    func testCanonicalTypealiasesResolveToUnderlyingComponents() {
        let bar: ProportionBar = ShareBar([.init(60, color: .blue), .init(40, color: .orange)], label: Text("60 to 40"))
        let roster: GroupedRoster = RollCall([.init(id: "g1", title: "Yea", color: .green, members: [.init(id: "m1", name: "Ava")])])
        let chip: TagChip = TopicChip("Policy")
        let mono: MonoText = ReferenceText.page(2, of: 8)
        let pageBar: PageBar = FrameBar { TopicChip("Brief") } trailing: { MonoText.page(2, of: 8) }
        _ = (bar.body, roster.body, chip.body, mono.body, pageBar.body)
    }

    @MainActor
    func testAudioPlayerURLInitDoesNotMutateDuringBodyAndMotionGatedViewsRenderCleanly() {
        let player = AudioPlayer(url: URL(fileURLWithPath: "/tmp/nonexistent-test.m4a"), label: "Test clip", duration: 42)
        let restricted = RenderPolicy(motionDisabled: true)
        let stack = VStack {
            player
            AudioPlayButton(playing: false, loading: true, label: "Clip") {}
            TypingIndicator(names: ["Ava"])
            Rating(value: .constant(4), label: "Rating")
            NotifyToggle(isOn: .constant(true))
            Poll(question: Text("Topic?"), options: [.init(id: "a", label: "Yes", votes: 3)], voted: "a") { _ in }
            CountButton("Like", count: 5, isOn: .constant(true)) { Color.clear }
            PersonRow(Text("Ava"), detail: Text("Host"), compact: true)
            StepList([.init("Draft", id: 1), .init("Review", id: 2)], current: 1)
        }
        .environment(\.renderPolicy, restricted)
        XCTAssertNotNil(ImageRenderer(content: stack.frame(width: 320)).cgImage)
    }
}
