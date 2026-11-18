@testable import CieoUI
import Cieo
import SwiftUI
import XCTest

final class Wave3ParityComponentsTests: XCTestCase {
    private let red = Color(red: 1, green: 0, blue: 0)

    private struct MetricRow: Identifiable, Equatable {
        let id: String
        let service: String
        let latencyMs: Int
    }

    @MainActor
    func testSelectMenuSingleAndMultiSelectionFilteringAndKeyboardNavigation() throws {
        let options = [
            SelectOption(value: "paper", label: "Warm paper", detail: "Editorial default"),
            SelectOption(value: "locked", label: "Archived slate", isDisabled: true),
            SelectOption(value: "cool", label: "Cool studio", detail: "Crisp neutral"),
        ]

        let filtered = SelectMenu<String>.filterOptions(options, query: "editorial")
        XCTAssertEqual(filtered.map(\.value), ["paper"])

        let moved = SelectMenu<String>.moveHighlight(current: "paper", delta: 1, in: options)
        XCTAssertEqual(moved, "cool", "keyboard navigation skips disabled options")

        // Regression (#14.1): disabled initial selection or filtered-out highlight resyncs to first visible enabled option
        XCTAssertEqual(SelectMenu<String>.resolvedHighlight(current: "locked", in: options), "paper")
        let coolOnly = SelectMenu<String>.filterOptions(options, query: "crisp")
        XCTAssertEqual(SelectMenu<String>.resolvedHighlight(current: "paper", in: coolOnly), "cool")
        XCTAssertFalse(SelectMenu<String>.canCommit("paper", in: coolOnly), "filtered-out item cannot commit on Return")
        XCTAssertTrue(SelectMenu<String>.canCommit("cool", in: coolOnly))
        XCTAssertFalse(SelectMenu<String>.canCommit("locked", in: options))

        // Regression (#14.2 & #14.3): VoiceOver contracts on SelectMenu trigger and DataTable sortable headers
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let selectSource = try String(contentsOf: root.appendingPathComponent("Sources/CieoUI/Molecules/SelectMenu.swift"), encoding: .utf8)
        XCTAssertTrue(selectSource.contains(".accessibilityLabel(title)"))
        let tableSource = try String(contentsOf: root.appendingPathComponent("Sources/CieoUI/Organisms/DataTable.swift"), encoding: .utf8)
        XCTAssertTrue(tableSource.contains("strings.sortAscending"))
        XCTAssertTrue(tableSource.contains("strings.sortDescending"))
        XCTAssertEqual(ComponentStrings().sortAscending, "Sorted ascending")
        XCTAssertEqual(ComponentStrings().sortDescending, "Sorted descending")

        let single = SelectMenu(
            "Ground",
            selection: .constant("paper"),
            options: options,
            searchable: true,
            initiallyExpanded: true
        )
        let multi = SelectMenu(
            "Channels",
            selections: .constant(Set(["paper", "cool"])),
            options: options,
            error: Text("Pick at least one channel")
        )

        let stack = VStack(spacing: 16) {
            single
            multi
        }
        .environment(\.componentTheme, Theme(accent: red, danger: red))
        .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
        .frame(width: 340)

        let image = try XCTUnwrap(ImageRenderer(content: stack).cgImage)
        XCTAssertGreaterThan(image.height, 140)
        XCTAssertTrue(ComponentIconTests.containsRed(image))
    }

    @MainActor
    func testDataTableSortingSelectionAndEmptyStateSlot() throws {
        let rows = [
            MetricRow(id: "r1", service: "Gateway", latencyMs: 48),
            MetricRow(id: "r2", service: "Auth", latencyMs: 14),
            MetricRow(id: "r3", service: "Ledger", latencyMs: 29),
        ]
        let columns: [DataTableColumn<MetricRow>] = [
            .text(id: "service", title: "Service", value: \.service),
            .comparable(id: "latency", title: "p95 (ms)", value: \.latencyMs) { "\($0) ms" },
        ]

        let asc = DataTable<MetricRow, EmptyView>.sortedRows(
            rows,
            by: DataTableSort(columnID: "latency", direction: .ascending),
            columns: columns
        )
        XCTAssertEqual(asc.map(\.id), ["r2", "r3", "r1"])

        let desc = DataTable<MetricRow, EmptyView>.sortedRows(
            rows,
            by: DataTableSort(columnID: "service", direction: .descending),
            columns: columns
        )
        XCTAssertEqual(desc.map(\.service), ["Ledger", "Gateway", "Auth"])

        let populated = DataTable(
            rows: rows,
            columns: columns,
            selection: .constant(Set(["r2"])),
            sort: .constant(DataTableSort(columnID: "latency", direction: .ascending))
        )
        let empty = DataTable(rows: [MetricRow](), columns: columns) {
            Text("No services recorded").foregroundStyle(red)
        }

        let stack = VStack(spacing: 16) {
            populated
            empty
        }
        .environment(\.componentTheme, Theme(accent: red, selection: red.opacity(0.2)))
        .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
        .frame(width: 390)

        let image = try XCTUnwrap(ImageRenderer(content: stack).cgImage)
        XCTAssertGreaterThan(image.height, 160)
        XCTAssertTrue(ComponentIconTests.containsRed(image))
    }

    @MainActor
    func testModalDialogAndAuthSignInCardRenderAllPhasesAndOtpStep() throws {
        let dialog = ModalDialog(
            isPresented: .constant(true),
            title: "Revoke API key?",
            message: "Active workers using this token will disconnect immediately.",
            confirmTitle: "Revoke key",
            confirmRole: .destructive,
            confirmPhase: .failed("Could not reach key vault"),
            onConfirm: {}
        ) {
            Text("Key ID: key_live_9842")
        }

        let authCard = AuthSignInCard(
            title: "Sign in to Cieo",
            subtitle: "Enter your workspace credentials.",
            email: .constant("ada@cieo.dev"),
            password: .constant("Correct-Horse-99!"),
            requiresOtp: true,
            otpCode: .constant("482910"),
            phase: .idle,
            onSubmit: {}
        )

        let stack = VStack(spacing: 20) {
            dialog
            authCard
        }
        .environment(\.componentTheme, Theme(accent: red, danger: red))
        .environment(\.renderPolicy, RenderPolicy(motionDisabled: true))
        .frame(width: 390)

        let image = try XCTUnwrap(ImageRenderer(content: stack).cgImage)
        XCTAssertGreaterThan(image.height, 360)
        XCTAssertTrue(ComponentIconTests.containsRed(image))
    }
}
