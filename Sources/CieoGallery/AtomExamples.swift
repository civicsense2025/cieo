import CieoUI
import SwiftUI

struct AtomExamples: View {
    @State private var progress = 0.25
    @State private var focus = false
    @State private var reading = true
    @State private var busy = false
    @State private var count = 0
    @State private var holds = 0
    @State private var isHolding = false
    @State private var tone = StatusChip.Tone.neutral

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
            Specimen(title: "Status chips") {
                FlowStack {
                    StatusChip("Not started")
                    StatusChip("In progress", tone: .active, symbol: .play)
                    StatusChip("Done", tone: .done, symbol: .check)
                    StatusChip("Needs a look", tone: .attention, symbol: .info)
                    StatusChip("Blocked", tone: .danger, symbol: .error)
                }
                Menu {
                    ForEach(StatusChip.Tone.allCases, id: \.self) { option in
                        Button(String(describing: option).capitalized) { tone = option }
                    }
                } label: {
                    StatusChip(String(describing: tone).capitalized, tone: tone, symbol: .disclosure)
                }
            }
            Specimen(title: "Press and hold") {
                Button("Tap for 1, hold for 10 · \(holds)") { holds += 1 }
                    .buttonStyle(ActionButtonStyle(.quiet))
                    .pressAndHold(isHolding: $isHolding, accessibilityActionName: "Add ten") { holds += 10 }
                    .sensoryFeedback(.impact, trigger: isHolding)
                Text(isHolding ? "Holding" : "Not holding").font(.footnote).foregroundStyle(.secondary)
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
