import CieoUI
import SwiftUI

struct MoleculeExamples: View {
    @State private var title = ""
    @State private var query = ""
    @State private var attempted = false
    @State private var saved = false
    @State private var expanded = false
    @State private var notifications = true
    private let names = ["Button", "Progress ring", "Selection chip", "Disclosure"]

    var body: some View {
        VStack(spacing: 24) {
            Specimen(title: "Field validation") {
                LabeledField("Title", text: $title, error: attempted && title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Enter a title before saving." : nil)
                ActionButton("Save title") {
                    attempted = true
                    saved = !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                }
                if saved { Notice("Saved locally", detail: "This example stays on this screen.", symbol: "checkmark.circle.fill") }
            }
            Specimen(title: "Search & preferences") {
                SearchField("Search components", text: $query)
                ForEach(names.filter { query.isEmpty || $0.localizedCaseInsensitiveContains(query) }, id: \.self) { Text($0) }
                PreferenceRow("Notifications", detail: "A local toggle. No permission request.", isOn: $notifications)
                ExpandablePanel("How this disclosure works", isExpanded: $expanded) {
                    Text("This content expands with a Cieo spring.")
                }
            }
        }
    }
}
