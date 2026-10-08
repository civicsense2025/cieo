import SwiftUI
import Cieo

public struct SnoozeSheetAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "snoozesheet", category: "Email", name: "Snooze sheet",
        summary: "The sheet rises on base and time chips stagger in every 40ms. Picking one collapses the top row, which returns on soft as a snoozed terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var sheetOpen = false
    @State private var picked: String?
    @State private var dipped = false
    @State private var remindSound = true
    public init() {}
    private let times = ["Tonight", "Tomorrow", "This weekend", "Next week"]

    public var body: some View {
        AtomStage(hint: "Snooze, then pick a time") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 10) {
                        Circle().fill(Color.accentColor.opacity(0.15))
                            .frame(width: 34, height: 34)
                            .overlay(Text("AC").font(.caption2.weight(.semibold)))
                        SwapText(picked == nil ? "Invoice #2041 due Friday" : "Snoozed until \(picked ?? "")")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(picked == nil ? Color.primary : Color.green)
                    }
                    .frame(height: dipped ? 0 : 52, alignment: .top).clipped()
                    .opacity(dipped ? 0 : 1)
                    Button(picked == nil ? "Snooze" : "Snoozed") {
                        withMotion(.base, reduceMotion: reduce) { sheetOpen.toggle() }
                    }
                    .buttonStyle(.bordered).controlSize(.small)
                    .disabled(picked != nil)
                    if sheetOpen {
                        VStack(alignment: .leading, spacing: 6) {
                            ForEach(times.indices, id: \.self) { i in
                                Button(times[i]) { choose(times[i]) }
                                    .buttonStyle(.bordered).controlSize(.small)
                                    .offset(y: sheetOpen ? 0 : 8)
                                    .opacity(sheetOpen ? 1 : 0)
                                    .animation(reduce ? nil : .motion(.base).delay(0.08 + Double(i) * 0.04), value: sheetOpen)
                            }
                        }
                        .motionTransition(.presence)
                    }
                }
                .padding(14).frame(maxWidth: 300)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                Toggle("Remind with sound", isOn: $remindSound)
                    .font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.switch).controlSize(.small)
            }
        }
    }

    private func choose(_ time: String) {
        withMotion(.base, reduceMotion: reduce) { sheetOpen = false; dipped = true }
        Task {
            try? await Task.sleep(for: .milliseconds(reduce ? 0 : 220))
            withMotion(.soft, reduceMotion: reduce) { dipped = false; picked = time }
        }
    }
}
