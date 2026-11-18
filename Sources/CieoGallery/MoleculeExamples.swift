import CieoUI
import SwiftUI

struct MoleculeExamples: View {
    @State private var title = ""
    @State private var query = ""
    @State private var attempted = false
    @State private var saved = false
    @State private var expanded = false
    @State private var notifications = true
    @State private var filter = "All"
    @State private var selectedGround = "paper"
    @State private var selectedChannels: Set<String> = ["ios", "macos"]
    @State private var confirmDialog = false
    private let names = ["Button", "Progress ring", "Selection chip", "Disclosure"]

    var body: some View {
        VStack(spacing: 24) {
            ConfigurableSpecimen(
                title: "Field validation",
                code: """
                LabeledField("Title", text: $title, error: errorText)
                Notice("Saved locally", detail: "Stays on this screen.", tone: .success)
                """
            ) {
                LabeledField("Title", text: $title, error: attempted && title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Enter a title before saving." : nil)
                ActionButton("Save title") {
                    attempted = true
                    saved = !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                }
                if saved { Notice("Saved locally", detail: "This example stays on this screen.", symbol: "checkmark.circle.fill") }
            }
            Specimen(title: "Section headers") {
                SectionHeader("Top stories", action: {})
                SectionHeader("Bills", value: Text(verbatim: "12"))
                SectionHeader("Sources") {
                    if let url = URL(string: "https://example.com") {
                        Link("Open all", destination: url)
                    }
                }
            }
            Specimen(title: "Single-select filters") {
                SegmentedControl("Filter activity", selection: $filter, options: [
                    .init(verbatim: "All", value: "All"), .init(verbatim: "Bills", value: "Bills", count: 12),
                    .init(verbatim: "Votes", value: "Votes", count: 3), .init(verbatim: "Committee hearings", value: "Hearings"),
                    .init(verbatim: "Nominations", value: "Nominations", count: 1),
                ])
                Text("Showing: \(filter)")
            }
            Specimen(title: "Search & preferences") {
                SearchField("Search components", text: $query)
                ForEach(names.filter { query.isEmpty || $0.localizedCaseInsensitiveContains(query) }, id: \.self) { Text($0) }
                PreferenceRow("Notifications", detail: "A local toggle. No permission request.", isOn: $notifications)
                ExpandablePanel("How this disclosure works", isExpanded: $expanded) {
                    Text("This content expands with a Cieo spring.")
                }
                ExpandablePanel(Text(verbatim: "Committee hearings")) {
                    Text("This panel keeps its own open state and shows a count on its title row.")
                } accessory: {
                    Text(verbatim: "3")
                }
            }
            ConfigurableSpecimen(
                title: "Select menus & modal confirmation",
                code: """
                SelectMenu("Ground", selection: $selectedGround, options: groundOptions, searchable: true)
                ModalDialog(isPresented: $confirmDialog, title: "Reset draft?", confirmTitle: "Reset", confirmRole: .destructive, onConfirm: {})
                """
            ) {
                LabeledTextInput("Workspace alias", text: $title)
                SelectMenu("Surface ground", selection: $selectedGround, options: [
                    SelectOption(value: "paper", label: "Warm paper", detail: "Editorial default"),
                    SelectOption(value: "cool", label: "Cool studio", detail: "High-clarity neutral"),
                    SelectOption(value: "mist", label: "Soft mist", detail: "Calm reading ground"),
                ], searchable: true)
                SelectMenu("Target platforms", selections: $selectedChannels, options: [
                    SelectOption(value: "ios", label: "iOS 17+"),
                    SelectOption(value: "macos", label: "macOS 14+"),
                    SelectOption(value: "web", label: "Web & React"),
                ])
                ActionButton(confirmDialog ? "Hide confirmation" : "Preview confirmation dialog", emphasis: .quiet, sizing: .fitted) {
                    confirmDialog.toggle()
                }
                ModalDialog(
                    isPresented: $confirmDialog,
                    title: "Reset local draft?",
                    message: "Unsaved specimen edits will return to their defaults.",
                    confirmTitle: "Reset draft",
                    confirmRole: .destructive,
                    onConfirm: { title = ""; confirmDialog = false }
                )
            }
        }
        .onChange(of: title) { saved = false }
    }
}
