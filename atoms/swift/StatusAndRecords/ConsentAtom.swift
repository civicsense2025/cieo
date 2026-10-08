import SwiftUI
import Cieo

public struct ConsentAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "consent", category: "Status and records", name: "Consent banner",
        summary: "The banner rises from the bottom edge. Customize does not open a dialog: the intro fades and its height collapses while the four categories grow in place and the title swaps, and the middle button swaps to Save preferences. Every optional switch starts off, the three buttons carry equal weight, and focus lands on Necessary only. After a choice the copy exits first, then the same surface morphs its size, radius and position into a small tab in the corner; the tab label enters last. Clicking the tab reverses it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var custom = false
    @State private var tab = false
    @State private var choice = "No choice yet"
    @State private var opts = [true, false, false, false]
    public init() {}

    private let cats = [("Necessary", "Required for security and saved privacy choices."), ("Analytics", "Helps the owner see useful pages."),
                        ("Personalization", "Remembers optional display preferences."), ("Marketing", "Measures campaigns.")]

    public var body: some View {
        AtomStage(hint: "Choose, then tap the tab to reopen") {
            ZStack(alignment: .bottomTrailing) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Meadowlark Journal").font(.headline)
                    Text("How a county budget gets written").font(.callout.weight(.medium))
                    Text("Most of the decisions are made in the spring, in meetings that few residents attend.").font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Text(choice).font(.caption2).foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).padding(10)
                surface
            }
            .frame(minHeight: 230)
            .background(Color.primary.opacity(0.03), in: RoundedRectangle(cornerRadius: 12)).clipped()
        }
    }

    private var surface: some View {
        VStack(alignment: .leading, spacing: 8) {
            if tab {
                Label("Privacy choices", systemImage: "shield").font(.caption.weight(.medium))
                    .transition(.opacity.animation(reduce ? nil : .motion(.base).delay(0.15)))
            } else {
                SwapText(custom ? "Choose what we may use" : "We use cookies").font(.callout.weight(.semibold))
                AgReveal(open: !custom) { Text("Optional ones help us improve the site. They start off.").font(.caption).foregroundStyle(.secondary) }
                AgReveal(open: custom) {
                    VStack(spacing: 4) {
                        ForEach(0..<4, id: \.self) { i in
                            Toggle(isOn: $opts[i]) { VStack(alignment: .leading, spacing: 0) { Text(cats[i].0).font(.caption.weight(.medium)); Text(cats[i].1).font(.caption2).foregroundStyle(.secondary) } }
                                .disabled(i == 0).toggleStyle(.switch).controlSize(.mini)
                        }
                    }
                }
                HStack(spacing: 6) {
                    Button("Necessary only") { decide("Necessary only", all: false) }.buttonStyle(AgPress())
                    Button { custom ? decide("Saved preferences", all: nil) : withMotion(.base, reduceMotion: reduce) { custom = true } } label: { SwapText(custom ? "Save preferences" : "Customize") }.buttonStyle(AgPress())
                    Button("Accept all") { decide("Accepted all", all: true) }.buttonStyle(AgPress())
                }
                .font(.caption)
            }
        }
        .padding(tab ? 8 : 12)
        .frame(maxWidth: tab ? 150 : 340, alignment: .leading)
        .background(.background, in: RoundedRectangle(cornerRadius: tab ? 16 : 12))
        .background(RoundedRectangle(cornerRadius: tab ? 16 : 12).fill(Color.primary.opacity(0.05)))
        .shadow(radius: 6, y: 2)
        .padding(8)
        .contentShape(Rectangle())
        .onTapGesture { if tab { withMotion(.base, reduceMotion: reduce) { tab = false; custom = false } } }
        .accessibilityAddTraits(tab ? .isButton : [])
        .transition(.opacity)
    }

    private func decide(_ label: String, all: Bool?) {
        if let all { opts = [true, all, all, all] }
        withMotion(.base, reduceMotion: reduce) { tab = true; choice = label }
    }
}
