import CieoUI
import SwiftUI

struct PatternExamples: View {
    private enum ExampleState: String, CaseIterable { case empty = "Empty", loading = "Loading", error = "Error", offline = "Offline", ready = "Ready" }
    @State private var state = ExampleState.empty
    @State private var progress = 0.4
    @State private var saved = false

    var body: some View {
        VStack(spacing: 24) {
            Specimen(title: "A composed task") {
                TaskPanel("Your collection", detail: "Advance the task to see the ring respond.", progress: progress) {
                    ActionButton("Advance task") { progress = progress >= 1 ? 0 : min(1, progress + 0.2) }
                }
            }
            Specimen(title: "Recovery states") {
                Picker("State", selection: $state) {
                    ForEach(ExampleState.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                }.pickerStyle(.menu)
                StatePanel(panelTitle, detail: panelDetail, symbol: panelSymbol) {
                    ActionButton("Load example", isBusy: state == .loading) { state = .loading }
                    Button("Clear") { state = .empty }
                }
                .task(id: state) {
                    guard state == .loading else { return }
                    do { try await Task.sleep(for: .seconds(1.2)) } catch { return }
                    state = .ready
                }
            }
            Specimen(title: "Reusable section & row") {
                ContentSection("Reading list", detail: "A composition slot for your own content.") {
                    ActionRow("Sample article", detail: "Five minutes", actionTitle: saved ? "Unsave" : "Save") { saved.toggle() }
                    if saved { Notice("Saved locally", detail: "Tap Unsave to restore the original state.", symbol: "bookmark.fill") }
                }
            }
        }
    }

    private var panelTitle: LocalizedStringKey {
        switch state {
        case .empty: "Nothing saved yet"
        case .loading: "Loading your collection"
        case .error: "Couldn't load the collection"
        case .offline: "You're offline"
        case .ready: "Your collection is ready"
        }
    }

    private var panelDetail: LocalizedStringKey {
        switch state {
        case .empty: "Load a local example to try this pattern."
        case .loading: "A short, cancellable local task is running."
        case .error: "Try again to recover without leaving this screen."
        case .offline: "Saved content stays available."
        case .ready: "The action completed. Clear it to start again."
        }
    }

    private var panelSymbol: String {
        switch state {
        case .empty: "tray"
        case .loading: "arrow.triangle.2.circlepath"
        case .error: "exclamationmark.triangle"
        case .offline: "wifi.slash"
        case .ready: "checkmark.circle.fill"
        }
    }
}
