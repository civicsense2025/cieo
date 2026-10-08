import CieoUI
import SwiftUI

struct AtomExamples: View {
    @State private var progress = 0.25
    @State private var focus = false
    @State private var reading = true
    @State private var busy = false
    @State private var count = 0

    var body: some View {
        VStack(spacing: 24) {
            Specimen(title: "Buttons you can press") {
                ActionButton("Press me · \(count)") { count += 1 }
                Button("Quiet action") { count += 1 }.buttonStyle(ActionButtonStyle(.quiet))
                ActionButton("Unavailable") {}.disabled(true)
                ActionButton("Run local task", isBusy: busy) { busy = true }
                    .task(id: busy) {
                        guard busy else { return }
                        do { try await Task.sleep(for: .seconds(1.4)) } catch { return }
                        busy = false
                    }
            }
            Specimen(title: "Animated progress") {
                VStack(alignment: .leading, spacing: 16) {
                    ProgressRing(value: progress).accessibilityIdentifier("progress.ring")
                    Button("Advance progress") { progress = progress >= 1 ? 0 : progress + 0.25 }
                        .buttonStyle(ActionButtonStyle(.quiet))
                }
            }
            Specimen(title: "Selection") {
                ViewThatFits {
                    HStack { chips }
                    VStack(alignment: .leading) { chips }
                }
                HStack { SymbolMark("checkmark.seal.fill"); Text("Native symbols scale with your text.") }
            }
        }
    }

    private var chips: some View {
        Group {
            SelectionChip("Focus", isSelected: $focus)
            SelectionChip("Reading", isSelected: $reading)
        }
    }
}
